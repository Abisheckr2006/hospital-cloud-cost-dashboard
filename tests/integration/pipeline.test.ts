import { describe, it, expect, beforeEach } from 'vitest';
import initSqlJs, { Database } from 'sql.js';
import { initializeSchema, run, query } from '../../backend/src/database/db.js';
import { runAllocationEngine } from '../../backend/src/allocation/engine.js';
import { calculateUnitEconomics } from '../../backend/src/analytics/unit-economics.js';
import { checkDataFreshness } from '../../backend/src/analytics/freshness.js';
import { detectCostAnomalies } from '../../backend/src/analytics/anomalies.js';
import { ConfidenceLevel, AllocationMethod, AllocationStatus } from '../../backend/src/types/index.js';

describe('Automated FinOps Pipeline Integration Tests', () => {
  let db: Database;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    initializeSchema(db);

    // Seed dimensions
    run(db, `INSERT INTO business_units (name, code, description) VALUES ('Radiology', 'BU-RAD', 'Radiology Dept')`);
    run(db, `INSERT INTO business_units (name, code, description) VALUES ('Clinical Analytics', 'BU-ANALYTICS', 'Analytics Dept')`);
    run(db, `INSERT INTO products (name, code, business_unit_id, description) VALUES ('Medical Imaging Platform', 'PROD-IMG', 1, 'PACS Platform')`);
    run(db, `INSERT INTO products (name, code, business_unit_id, description) VALUES ('Clinical Analytics Platform', 'PROD-ANALYTICS', 2, 'Analytics Platform')`);
    run(db, `INSERT INTO features (name, code, product_id, description) VALUES ('Image Storage', 'FEAT-IMG-03', 1, 'DICOM Storage')`);
    run(db, `INSERT INTO cloud_accounts (account_id, name, provider, environment) VALUES ('ACCT-IMAGING', 'Imaging Account', 'AWS', 'Production')`);
    run(db, `INSERT INTO cloud_accounts (account_id, name, provider, environment) VALUES ('ACCT-SHARED', 'Shared Account', 'AWS', 'Production')`);
  });

  it('TEST 1 — DUPLICATE BILLING INGESTION: Cost counted once & duplicate flagged', () => {
    // 1. Insert valid billing record
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-DUP-001', '2026-06-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-dup-001', 'c5.xlarge-Hour', 500.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
        'Radiology', 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    // Run first allocation
    const res1 = runAllocationEngine(db);
    const allocatedBefore = res1.allocatedCost;

    // 2. Insert same billing record again (duplicate billing ID)
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-DUP-001-DUP', '2026-06-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-dup-001', 'c5.xlarge-Hour', 500.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
        'Radiology', 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    // 3. Run allocation engine with deduplication detection
    const res2 = runAllocationEngine(db);

    // 4. Verify duplicate detection error logged
    const errs = query(db, "SELECT * FROM data_validation_errors WHERE issue_type = 'DUPLICATE_BILLING'");
    expect(errs.length).toBeGreaterThan(0);
    expect(res2.errorsDetected).toBeGreaterThan(0);

    // 5. Verify total cost for initial record remains allocated correctly without inflation
    const validAllocations = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-DUP-001'");
    expect(validAllocations.length).toBe(1);
    expect(validAllocations[0].allocated_amount).toBe(500.00);
  });

  it('TEST 2 — SCHEMA DRIFT: Missing / unexpected field detected safely', () => {
    // Insert billing record with missing required tags & invalid provider schema representation
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-DRIFT-001', '2026-06-01', 'UNKNOWN_PROVIDER', 'ACCT-INVALID', 'UnknownService', 'us-east-1',
        'res-drift-001', 'invalid_usage', 750.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    // Execution should not crash
    expect(() => runAllocationEngine(db)).not.toThrow();

    // Mismatch detected, cost enters unallocated pool safely
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-DRIFT-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Unallocated);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);

    const errs = query(db, "SELECT * FROM data_validation_errors WHERE record_id = 'res-drift-001'");
    expect(errs.length).toBeGreaterThan(0);
  });

  it('TEST 3 — MISSING ALLOCATION TAG: Unsupported assignment avoided, cost enters unallocated pool', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-UNTAGGED-001', '2026-06-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-no-tags-123', 'c5.xlarge-Hour', 1200.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    const result = runAllocationEngine(db);
    expect(result.levelBreakdown.unallocated.count).toBe(1);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-UNTAGGED-001'");
    expect(allocs[0].business_unit).toBe('Unallocated');
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);

    const errs = query(db, "SELECT * FROM data_validation_errors WHERE issue_type = 'MISSING_ALLOCATION_TAG'");
    expect(errs.length).toBeGreaterThan(0);
  });

  it('TEST 4 — STALE TELEMETRY: Classified STALE & confidence reduced to LOW', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-STALE-999', '2026-06-20T12:00:00Z', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-stale-telemetry-01', 'c5.large-Hour', 450.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-20T12:00:00Z'
      )
    `);

    // Freshness timestamp is > 72 hours older (June 10 vs June 20)
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (
        'TEL-OLD-001', '2026-06-10T00:00:00Z', 'ACCT-SHARED', 'res-stale-telemetry-01', 'Medical Imaging Platform',
        'Image Storage', 'Radiology', 'CPU_Hours', 100.0, 'Hours', '2026-06-10T00:00:00Z'
      )
    `);

    runAllocationEngine(db);

    // Verify STALE_TELEMETRY error recorded
    const errs = query(db, "SELECT * FROM data_validation_errors WHERE issue_type = 'STALE_TELEMETRY'");
    expect(errs.length).toBeGreaterThan(0);

    // Verify confidence reduced to LOW
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-STALE-999'");
    expect(allocs[0].confidence).toBe(ConfidenceLevel.Low);
  });

  it('TEST 5 — ZERO ACTIVITY: No div-by-zero, NaN or Infinity, returns safe metric', () => {
    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES ('ACT-ZERO-VOL', '2026-06-01', 'Radiology', 'Medical Imaging Platform', 'Image Storage', 'DICOM Scans', 0, 'images')
    `);

    let ueResult: any;
    expect(() => {
      ueResult = calculateUnitEconomics(db);
    }).not.toThrow();

    const imgMetric = ueResult.metrics.find((m: any) => m.product === 'Medical Imaging Platform');
    expect(imgMetric).toBeDefined();
    expect(imgMetric.cost_per_unit).toBe(0);
    expect(Number.isNaN(imgMetric.cost_per_unit)).toBe(false);
    expect(Number.isFinite(imgMetric.cost_per_unit)).toBe(true);
  });

  it('TEST 6 — SHARED INFRASTRUCTURE: Conservation of total cost across proportional splits', () => {
    const sharedCost = 1000.00;
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-SHARED-CONSERVE', '2026-06-01', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-shared-cluster-01', 'c5.2xlarge-Hour', ${sharedCost}, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    // Workload A (Radiology) = 60 units, Workload B (Clinical Analytics) = 40 units
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (
        'TEL-A', '2026-06-01T12:00:00Z', 'ACCT-SHARED', 'res-shared-cluster-01', 'Medical Imaging Platform',
        'Image Storage', 'Radiology', 'CPU_Hours', 60.0, 'Hours', '2026-06-01T12:00:00Z'
      )
    `);
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (
        'TEL-B', '2026-06-01T12:00:00Z', 'ACCT-SHARED', 'res-shared-cluster-01', 'Clinical Analytics Platform',
        'Data Processing', 'Clinical Analytics', 'CPU_Hours', 40.0, 'Hours', '2026-06-01T12:00:00Z'
      )
    `);

    runAllocationEngine(db);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-SHARED-CONSERVE'");
    expect(allocs.length).toBe(2);

    const allocA = allocs.find((a: any) => a.business_unit === 'Radiology');
    const allocB = allocs.find((a: any) => a.business_unit === 'Clinical Analytics');

    expect(allocA).toBeDefined();
    expect(allocB).toBeDefined();
    expect(allocA.allocated_amount).toBe(600.00);
    expect(allocB.allocated_amount).toBe(400.00);

    const totalAllocated = allocA.allocated_amount + allocB.allocated_amount;
    expect(totalAllocated).toBe(sharedCost);
  });

  it('TEST 7 — INVALID PRODUCT MAPPING: Unknown product tag detected & cost enters unallocated pool', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-INV-PROD-001', '2026-06-01', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-invalid-prod-tag', 'c5.large-Hour', 350.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    run(db, `
      INSERT INTO allocation_tags (
        resource_id, cloud_account_id, business_unit, product_id, feature_id, allocation_status, tag_last_updated, tag_source
      ) VALUES (
        'res-invalid-prod-tag', 'ACCT-SHARED', 'Radiology', 'NonExistentProductApp', 'FEAT-99', 'TAGGED', '2026-06-01T00:00:00Z', 'Manual'
      )
    `);

    runAllocationEngine(db);

    const errs = query(db, "SELECT * FROM data_validation_errors WHERE issue_type = 'INVALID_PRODUCT_ID'");
    expect(errs.length).toBeGreaterThan(0);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-INV-PROD-001'");
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Unallocated);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);
  });

  it('TEST 8 — COST SPIKE: Abnormal spend increase detected by anomaly detection engine', () => {
    const resId = 'res-spike-test-001';
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];

    months.forEach((m) => {
      run(db, `
        INSERT INTO billing_records (
          billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
          resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
          business_unit, billing_status, timestamp
        ) VALUES (
          'BILL-HIST-${m}', '${m}-15', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
          '${resId}', 'c5.large-Hour', 100.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
          'Radiology', 'BILLED', '${m}-15T12:00:00Z'
        )
      `);
    });

    // Month 6 cost spike: jumps from $100 average to $500 (> 25% increase & > $200 jump)
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-SPIKE-2026-06', '2026-06-15', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        '${resId}', 'c5.large-Hour', 500.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
        'Radiology', 'BILLED', '2026-06-15T12:00:00Z'
      )
    `);

    const anomalies = detectCostAnomalies(db);
    const spikeAnomaly = anomalies.find((a) => a.resource_id === resId);

    expect(spikeAnomaly).toBeDefined();
    expect(spikeAnomaly?.current_cost).toBe(500.00);
    expect(spikeAnomaly?.expected_cost).toBe(100.00);
    expect(spikeAnomaly?.variance_pct).toBe(400.0);
    expect(spikeAnomaly?.severity).toBe('HIGH');
  });
});
