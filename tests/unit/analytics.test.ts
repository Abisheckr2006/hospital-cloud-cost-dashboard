import { describe, it, expect, beforeEach } from 'vitest';
import initSqlJs, { Database } from 'sql.js';
import { initializeSchema, run } from '../../backend/src/database/db.js';
import { detectCostAnomalies } from '../../backend/src/analytics/anomalies.js';
import { checkDataQuality } from '../../backend/src/analytics/quality.js';
import { checkDataFreshness } from '../../backend/src/analytics/freshness.js';
import { generateRecommendations } from '../../backend/src/analytics/recommendations.js';
import { FreshnessStatus } from '../../backend/src/types/index.js';

describe('Analytics & FinOps Governance Services Tests', () => {
  let db: Database;

  beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    initializeSchema(db);
  });

  describe('detectCostAnomalies()', () => {
    it('Does not flag anomalies for stable historical spend', () => {
      const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
      months.forEach((m) => {
        run(db, `
          INSERT INTO billing_records (
            billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
            resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
            business_unit, billing_status, timestamp
          ) VALUES (
            'BILL-STABLE-${m}', '${m}-10', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
            'res-stable-001', 'c5.large', 100.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
            'Radiology', 'BILLED', '${m}-10T00:00:00Z'
          )
        `);
      });

      const anomalies = detectCostAnomalies(db);
      expect(anomalies.length).toBe(0);
    });

    it('Flags anomaly when spend increases > 25% and > $200 jump', () => {
      const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
      months.forEach((m) => {
        run(db, `
          INSERT INTO billing_records (
            billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
            resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
            business_unit, billing_status, timestamp
          ) VALUES (
            'BILL-HIST-${m}', '${m}-10', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
            'res-spike-001', 'c5.large', 200.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
            'Radiology', 'BILLED', '${m}-10T00:00:00Z'
          )
        `);
      });

      // Jump in month 6 to $800 (+300% variance)
      run(db, `
        INSERT INTO billing_records (
          billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
          resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
          business_unit, billing_status, timestamp
        ) VALUES (
          'BILL-SPIKE-006', '2026-06-10', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
          'res-spike-001', 'c5.large', 800.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
          'Radiology', 'BILLED', '2026-06-10T00:00:00Z'
        )
      `);

      const anomalies = detectCostAnomalies(db);
      expect(anomalies.length).toBe(1);
      expect(anomalies[0].resource_id).toBe('res-spike-001');
      expect(anomalies[0].variance_pct).toBe(300.0);
      expect(anomalies[0].severity).toBe('HIGH');
    });
  });

  describe('checkDataQuality()', () => {
    it('Computes dataset health scores and overall quality score', () => {
      run(db, `
        INSERT INTO billing_records (
          billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
          resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
          business_unit, billing_status, timestamp
        ) VALUES (
          'BILL-Q1', '2026-05-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
          'res-q1', 'c5.large', 100.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
          'Radiology', 'BILLED', '2026-05-01T00:00:00Z'
        )
      `);

      const quality = checkDataQuality(db);
      expect(quality.reports.length).toBe(4);
      expect(quality.overallQualityScore).toBeGreaterThan(0);
      expect(quality.reports.find((r) => r.dataset === 'Billing Records')?.total_records).toBe(1);
    });
  });

  describe('checkDataFreshness()', () => {
    it('Evaluates dataset freshness against reference timeline', () => {
      run(db, `
        INSERT INTO billing_records (
          billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
          resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
          business_unit, billing_status, timestamp
        ) VALUES (
          'BILL-F1', '2026-06-30', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
          'res-f1', 'c5.large', 100.00, 'USD', 'bu:Radiology', 'Medical Imaging Platform', 'Image Storage',
          'Radiology', 'BILLED', '2026-06-30T10:00:00Z'
        )
      `);

      const freshness = checkDataFreshness(db);
      expect(freshness.items.length).toBe(4);
      const billingItem = freshness.items.find((i) => i.dataset === 'Cloud Billing Exports');
      expect(billingItem?.status).toBe(FreshnessStatus.Fresh);
      expect(billingItem?.age_hours).toBe(2);
    });
  });

  describe('generateRecommendations()', () => {
    it('Generates cost optimization recommendations for untagged cloud spend', () => {
      // Seed untagged billing record
      run(db, `
        INSERT INTO billing_records (
          billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
          resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
          business_unit, billing_status, timestamp
        ) VALUES (
          'BILL-REC-001', '2026-05-01', 'AWS', 'ACCT-IMAGING', 'Compute', 'us-east-1',
          'res-untagged-rec-001', 'c5.large', 5400.00, 'USD', null, null, null,
          null, 'BILLED', '2026-05-01T00:00:00Z'
        )
      `);

      const recs = generateRecommendations(db);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.type === 'GOVERNANCE_TAGGING')).toBe(true);
    });
  });
});
