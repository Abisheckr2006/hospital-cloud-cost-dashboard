import { describe, it, expect, beforeEach } from 'vitest';
import initSqlJs, { Database } from 'sql.js';
import { initializeSchema, run, query } from '../../backend/src/database/db.js';
import { runAllocationEngine } from '../../backend/src/allocation/engine.js';
import { ConfidenceLevel, AllocationMethod, AllocationStatus } from '../../backend/src/types/index.js';

describe('Confidence Scoring & Waterfall Level Tests', () => {
  let db: Database;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    initializeSchema(db);

    // Seed reference dimensions
    run(db, `INSERT INTO business_units (name, code, description) VALUES ('Radiology', 'BU-RAD', 'Radiology Dept')`);
    run(db, `INSERT INTO business_units (name, code, description) VALUES ('Clinical Analytics', 'BU-ANALYTICS', 'Analytics Dept')`);
    run(db, `INSERT INTO products (name, code, business_unit_id, description) VALUES ('Medical Imaging Platform', 'PROD-IMG', 1, 'PACS Platform')`);
    run(db, `INSERT INTO products (name, code, business_unit_id, description) VALUES ('Clinical Analytics Platform', 'PROD-ANALYTICS', 2, 'Analytics Platform')`);
    run(db, `INSERT INTO features (name, code, product_id, description) VALUES ('Image Storage', 'FEAT-IMG-03', 1, 'DICOM Storage')`);
    run(db, `INSERT INTO cloud_accounts (account_id, name, provider, environment) VALUES ('ACCT-IMAGING', 'Imaging Account', 'AWS', 'Production')`);
    run(db, `INSERT INTO cloud_accounts (account_id, name, provider, environment) VALUES ('ACCT-SHARED', 'Shared Account', 'AWS', 'Production')`);
  });

  it('1. Fresh complete direct billing tag -> HIGH confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-DIR-001', '2026-06-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-direct-001', 'c5.large-Hour', 150.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
        'Radiology', 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    const result = runAllocationEngine(db);
    expect(result.levelBreakdown.direct.count).toBe(1);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-DIR-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.High);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Direct);
  });

  it('2. Missing tags/telemetry/activity -> UNALLOCATED & NONE confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-MISS-001', '2026-06-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-untagged-999', 'c5.large-Hour', 200.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    const result = runAllocationEngine(db);
    expect(result.levelBreakdown.unallocated.count).toBe(1);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-MISS-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Unallocated);
    expect(allocs[0].allocation_status).toBe(AllocationStatus.Unallocated);
  });

  it('3. Telemetry older than 72 hours -> STALE telemetry & LOW confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-STALE-001', '2026-06-10', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-shared-stale', 'c5.large-Hour', 500.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-10T12:00:00Z'
      )
    `);

    // Stale telemetry: timestamp 100 hours older than billing date
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (
        'TEL-STALE-001', '2026-06-05T12:00:00Z', 'ACCT-SHARED', 'res-shared-stale', 'Medical Imaging Platform',
        'Image Storage', 'Radiology', 'CPU_Hours', 100.0, 'Hours', '2026-06-05T12:00:00Z'
      )
    `);

    const result = runAllocationEngine(db);
    expect(result.levelBreakdown.usageBased.count).toBe(1);

    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-STALE-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.Low);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.UsageBased);
    expect(allocs[0].reason).toContain('STALE TELEMETRY DETECTED');
  });

  it('4. Fresh usage telemetry -> MEDIUM confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-FRESH-001', '2026-06-10', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-shared-fresh', 'c5.large-Hour', 300.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-10T12:00:00Z'
      )
    `);

    // Telemetry within 12 hours of billing
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (
        'TEL-FRESH-001', '2026-06-10T00:00:00Z', 'ACCT-SHARED', 'res-shared-fresh', 'Medical Imaging Platform',
        'Image Storage', 'Radiology', 'CPU_Hours', 50.0, 'Hours', '2026-06-10T00:00:00Z'
      )
    `);

    runAllocationEngine(db);
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-FRESH-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.Medium);
  });

  it('5. Conflicting resource tags -> UNALLOCATED & NONE confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-CONF-001', '2026-06-01', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-conflict-001', 'c5.large-Hour', 400.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    // Two tags with different business units for same resource
    run(db, `
      INSERT INTO allocation_tags (resource_id, cloud_account_id, business_unit, product_id, feature_id, allocation_status, tag_last_updated, tag_source)
      VALUES ('res-conflict-001', 'ACCT-SHARED', 'Radiology', 'Medical Imaging Platform', 'Image Storage', 'TAGGED', '2026-06-01T00:00:00Z', 'Terraform')
    `);
    run(db, `
      INSERT INTO allocation_tags (resource_id, cloud_account_id, business_unit, product_id, feature_id, allocation_status, tag_last_updated, tag_source)
      VALUES ('res-conflict-001', 'ACCT-SHARED', 'Clinical Analytics', 'Clinical Analytics Platform', 'Data Processing', 'TAGGED', '2026-06-01T00:00:00Z', 'Manual')
    `);

    runAllocationEngine(db);
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-CONF-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Unallocated);
    expect(allocs[0].allocation_status).toBe(AllocationStatus.ReviewRequired);
  });

  it('6. Complete product activity on shared account -> MEDIUM confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-ACT-001', '2026-06-01', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-shared-act-001', 'c5.large-Hour', 1000.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES ('ACT-001', '2026-06-01', 'Radiology', 'Medical Imaging Platform', 'Image Storage', 'DICOM Scans', 8000.0, 'images')
    `);

    runAllocationEngine(db);
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-ACT-001'");
    expect(allocs.length).toBeGreaterThan(0);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.Medium);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.ActivityBased);
  });

  it('7. Zero activity volume -> enters unallocated pool with NONE confidence', () => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-ZERO-001', '2026-06-01', 'AWS', 'ACCT-SHARED', 'Compute', 'us-east-1',
        'res-zero-act-001', 'c5.large-Hour', 600.00, 'USD', null, null, null,
        null, 'BILLED', '2026-06-01T12:00:00Z'
      )
    `);

    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES ('ACT-ZERO', '2026-06-01', 'Radiology', 'Medical Imaging Platform', 'Image Storage', 'DICOM Scans', 0.0, 'images')
    `);

    runAllocationEngine(db);
    const allocs = query(db, "SELECT * FROM allocation_results WHERE billing_id = 'BILL-ZERO-001'");
    expect(allocs.length).toBe(1);
    expect(allocs[0].confidence).toBe(ConfidenceLevel.None);
    expect(allocs[0].allocation_method).toBe(AllocationMethod.Unallocated);
  });
});
