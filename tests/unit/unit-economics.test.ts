import { describe, it, expect, beforeEach } from 'vitest';
import initSqlJs, { Database } from 'sql.js';
import { initializeSchema, run } from '../../backend/src/database/db.js';
import { calculateUnitEconomics } from '../../backend/src/analytics/unit-economics.js';

describe('Unit Economics Calculation Tests', () => {
  let db: Database;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    initializeSchema(db);
  });

  it('Calculates cost per unit correctly for normal activity volume', () => {
    // Seed allocation results
    run(db, `
      INSERT INTO allocation_results (
        allocation_id, billing_id, business_unit, product_id, feature_id,
        allocated_amount, allocation_method, confidence, evidence_source,
        evidence_timestamp, allocation_status, reason
      ) VALUES (
        'ALLOC-001', 'BILL-001', 'Radiology', 'Medical Imaging Platform', 'Image Storage',
        10000.00, 'DIRECT', 'HIGH', 'Billing Tags', '2026-05-01T00:00:00Z', 'ALLOCATED', 'Mapped'
      )
    `);

    // Seed product activity
    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES (
        'ACT-001', '2026-05-01', 'Radiology', 'Medical Imaging Platform', 'Image Storage',
        'DICOM Image Studies Processed', 20000, 'images'
      )
    `);

    const result = calculateUnitEconomics(db);
    expect(result.metrics.length).toBe(1);

    const metric = result.metrics[0];
    expect(metric.product).toBe('Medical Imaging Platform');
    expect(metric.cloud_cost).toBe(10000.00);
    expect(metric.activity_volume).toBe(20000);
    // Cost per unit = 10000 / 20000 = 0.50
    expect(metric.cost_per_unit).toBe(0.50);
  });

  it('Handles zero activity volume safely without division by zero', () => {
    run(db, `
      INSERT INTO allocation_results (
        allocation_id, billing_id, business_unit, product_id, feature_id,
        allocated_amount, allocation_method, confidence, evidence_source,
        evidence_timestamp, allocation_status, reason
      ) VALUES (
        'ALLOC-002', 'BILL-002', 'Patient Portal', 'Patient Portal', 'Patient Login',
        5000.00, 'DIRECT', 'HIGH', 'Billing Tags', '2026-05-01T00:00:00Z', 'ALLOCATED', 'Mapped'
      )
    `);

    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES (
        'ACT-002', '2026-05-01', 'Patient Portal', 'Patient Portal', 'Patient Login',
        'Active Portal Sessions', 0, 'sessions'
      )
    `);

    const result = calculateUnitEconomics(db);
    expect(result.metrics.length).toBe(1);

    const metric = result.metrics[0];
    expect(metric.cost_per_unit).toBe(0);
    expect(metric.allocation_confidence).toContain('NONE');
  });

  it('Computes monthly trend metrics across billing months', () => {
    // Month 1: 2026-05
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (
        'BILL-M1', '2026-05-15', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
        'res-01', 'c5.xlarge', 2000.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
        'Radiology', 'BILLED', '2026-05-15T00:00:00Z'
      )
    `);
    run(db, `
      INSERT INTO allocation_results (
        allocation_id, billing_id, business_unit, product_id, feature_id,
        allocated_amount, allocation_method, confidence, evidence_source,
        evidence_timestamp, allocation_status, reason
      ) VALUES (
        'ALLOC-M1', 'BILL-M1', 'Radiology', 'Medical Imaging Platform', 'Image Storage',
        2000.00, 'DIRECT', 'HIGH', 'Billing Tags', '2026-05-15T00:00:00Z', 'ALLOCATED', 'Mapped'
      )
    `);
    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id, activity_type, activity_volume, unit
      ) VALUES (
        'ACT-M1', '2026-05-15', 'Radiology', 'Medical Imaging Platform', 'Image Storage',
        'DICOM Image Studies Processed', 4000, 'images'
      )
    `);

    const result = calculateUnitEconomics(db);
    expect(result.monthlyTrend.length).toBe(6);

    const mayTrend = result.monthlyTrend.find((t) => t.month === '2026-05');
    expect(mayTrend).toBeDefined();
    // 2000 / 4000 = 0.50
    expect(mayTrend?.imagingCostPerImage).toBe(0.50);
  });
});
