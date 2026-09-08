import { Database } from 'sql.js';
import { query } from '../database/db.js';
import { DataQualityReport } from '../types/index.js';

export function checkDataQuality(db: Database): {
  reports: DataQualityReport[];
  overallQualityScore: number;
  validationErrors: Array<{
    id: number;
    record_id: string;
    source: string;
    field: string;
    issue_type: string;
    reason: string;
    affected_cost: number;
    timestamp: string;
  }>;
} {
  const errors = query<{
    id: number;
    record_id: string;
    source: string;
    field: string;
    issue_type: string;
    reason: string;
    affected_cost: number;
    timestamp: string;
  }>(db, 'SELECT * FROM data_validation_errors ORDER BY id DESC');

  // 1. Billing records quality
  const billingTotal = query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM billing_records')[0]?.count || 0;
  const billingDuplicates = errors.filter((e) => e.source === 'billing_records' && e.issue_type === 'DUPLICATE_BILLING');
  const billingMissing = errors.filter((e) => e.source === 'billing_records' && e.issue_type === 'MISSING_ALLOCATION_TAG');
  const billingAffectedCost = billingMissing.reduce((acc, c) => acc + (c.affected_cost || 0), 0) +
    billingDuplicates.reduce((acc, c) => acc + (c.affected_cost || 0), 0);
  const billingInvalid = billingDuplicates.length;
  const billingValid = Math.max(0, billingTotal - billingInvalid - billingMissing.length);

  // 2. Telemetry quality
  const telemetryTotal = query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM usage_telemetry')[0]?.count || 0;
  const telemetryStale = errors.filter((e) => e.source === 'usage_telemetry' && e.issue_type === 'STALE_TELEMETRY');
  const telemetryAffectedCost = telemetryStale.reduce((acc, c) => acc + (c.affected_cost || 0), 0);
  const telemetryValid = Math.max(0, telemetryTotal - telemetryStale.length);

  // 3. Tags quality
  const tagsTotal = query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM allocation_tags')[0]?.count || 0;
  const tagsConflict = errors.filter((e) => e.source === 'allocation_tags' && e.issue_type === 'CONFLICTING_TAGS');
  const tagsInvalid = errors.filter((e) => e.source === 'allocation_tags' && e.issue_type === 'INVALID_PRODUCT_ID');
  const tagsAffectedCost = tagsConflict.reduce((acc, c) => acc + (c.affected_cost || 0), 0) +
    tagsInvalid.reduce((acc, c) => acc + (c.affected_cost || 0), 0);
  const tagsValid = Math.max(0, tagsTotal - tagsConflict.length - tagsInvalid.length);

  // 4. Activity quality
  const activityTotal = query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM product_activity')[0]?.count || 0;
  const activityZero = query<{ count: number }>(db, 'SELECT COUNT(*) as count FROM product_activity WHERE activity_volume = 0')[0]?.count || 0;
  const activityValid = Math.max(0, activityTotal - activityZero);

  const reports: DataQualityReport[] = [
    {
      dataset: 'Billing Records',
      total_records: billingTotal,
      valid_records: billingValid,
      invalid_records: billingInvalid,
      missing_records: billingMissing.length,
      duplicate_records: billingDuplicates.length,
      stale_records: 0,
      affected_cost: parseFloat(billingAffectedCost.toFixed(2)),
      health_score: billingTotal > 0 ? parseFloat(((billingValid / billingTotal) * 100).toFixed(1)) : 100,
    },
    {
      dataset: 'Usage Telemetry',
      total_records: telemetryTotal,
      valid_records: telemetryValid,
      invalid_records: 0,
      missing_records: 0,
      duplicate_records: 0,
      stale_records: telemetryStale.length,
      affected_cost: parseFloat(telemetryAffectedCost.toFixed(2)),
      health_score: telemetryTotal > 0 ? parseFloat(((telemetryValid / telemetryTotal) * 100).toFixed(1)) : 100,
    },
    {
      dataset: 'Allocation Tags',
      total_records: tagsTotal,
      valid_records: tagsValid,
      invalid_records: tagsInvalid.length,
      missing_records: 0,
      duplicate_records: 0,
      stale_records: 0,
      affected_cost: parseFloat(tagsAffectedCost.toFixed(2)),
      health_score: tagsTotal > 0 ? parseFloat(((tagsValid / tagsTotal) * 100).toFixed(1)) : 100,
    },
    {
      dataset: 'Product Activity',
      total_records: activityTotal,
      valid_records: activityValid,
      invalid_records: activityZero,
      missing_records: 0,
      duplicate_records: 0,
      stale_records: 0,
      affected_cost: 0,
      health_score: activityTotal > 0 ? parseFloat(((activityValid / activityTotal) * 100).toFixed(1)) : 100,
    },
  ];

  const overallQualityScore = parseFloat(
    (reports.reduce((acc, r) => acc + r.health_score, 0) / reports.length).toFixed(1)
  );

  return { reports, overallQualityScore, validationErrors: errors };
}
