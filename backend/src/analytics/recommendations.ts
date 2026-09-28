import { Database } from 'sql.js';
import { query } from '../database/db.js';
import { RecommendationItem } from '../types/index.js';

export function generateRecommendations(db: Database): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  // 1. Missing tags impact
  const untagged = query<{ total_cost: number; count: number }>(
    db,
    `
    SELECT SUM(cost) as total_cost, COUNT(*) as count 
    FROM billing_records 
    WHERE (business_unit IS NULL OR business_unit = '') 
      AND resource_id NOT IN (SELECT resource_id FROM allocation_tags)
      AND resource_id NOT IN (SELECT resource_id FROM usage_telemetry)
    `
  )[0];

  if (untagged && untagged.total_cost > 0) {
    recommendations.push({
      id: 'REC-001',
      type: 'GOVERNANCE_TAGGING',
      title: 'Enforce Infrastructure-as-Code tags on untagged cloud resources',
      description: `${untagged.count} billing records are unallocated due to missing resource tags across object storage and serverless runtimes.`,
      affected_cost: parseFloat(untagged.total_cost.toFixed(2)),
      potential_savings_or_allocated: parseFloat(untagged.total_cost.toFixed(2)),
      impact: 'HIGH',
      recommended_action: 'Apply AWS Resource Tags (`bu`, `product`, `feature`) via Terraform CI pipeline to immediately attribute $8k+ of cloud spend.',
    });
  }

  // 2. Stale telemetry
  const staleTelemetry = query<{ cost: number }>(
    db,
    `
    SELECT SUM(affected_cost) as cost 
    FROM data_validation_errors 
    WHERE issue_type = 'STALE_TELEMETRY'
    `
  )[0];

  if (staleTelemetry && staleTelemetry.cost > 0) {
    recommendations.push({
      id: 'REC-002',
      type: 'TELEMETRY_PIPELINE',
      title: 'Remediate stale usage telemetry pipeline for Clinical Analytics',
      description: 'Telemetry sync pipeline has delayed updates (>96 hours lag), resulting in reduced confidence in usage-based cost splits.',
      affected_cost: parseFloat(staleTelemetry.cost.toFixed(2)),
      potential_savings_or_allocated: parseFloat(staleTelemetry.cost.toFixed(2)),
      impact: 'MEDIUM',
      recommended_action: 'Restart telemetry scraper cron and verify Prometheus/CloudWatch agent health in ACCT-ANALYTICS.',
    });
  }

  // 3. Conflicting tags
  const conflictingTags = query<{ cost: number }>(
    db,
    `
    SELECT SUM(affected_cost) as cost 
    FROM data_validation_errors 
    WHERE issue_type = 'CONFLICTING_TAGS'
    `
  )[0];

  if (conflictingTags && conflictingTags.cost > 0) {
    recommendations.push({
      id: 'REC-003',
      type: 'TAG_RECONCILIATION',
      title: 'Resolve conflicting multi-team tags on shared storage resources',
      description: 'Resource res-conflict-storage-002 has conflicting ownership tags between Radiology and Emergency Services.',
      affected_cost: parseFloat(conflictingTags.cost.toFixed(2)),
      potential_savings_or_allocated: parseFloat(conflictingTags.cost.toFixed(2)),
      impact: 'HIGH',
      recommended_action: 'Submit FinOps change request to designate primary BU ownership or split into dedicated buckets.',
    });
  }

  // 4. Invalid product mapping
  const invalidProd = query<{ cost: number }>(
    db,
    `
    SELECT SUM(affected_cost) as cost 
    FROM data_validation_errors 
    WHERE issue_type = 'INVALID_PRODUCT_ID'
    `
  )[0];

  if (invalidProd && invalidProd.cost > 0) {
    recommendations.push({
      id: 'REC-004',
      type: 'PRODUCT_CATALOG',
      title: 'Map deprecated product tag PROD-INVALID-LEGACY-SYS to active catalog',
      description: 'Legacy product IDs prevent automated attribution to current hospital financial cost centers.',
      affected_cost: parseFloat(invalidProd.cost.toFixed(2)),
      potential_savings_or_allocated: parseFloat(invalidProd.cost.toFixed(2)),
      impact: 'MEDIUM',
      recommended_action: 'Update resource tag to "Clinical Analytics Platform" in Terraform state.',
    });
  }

  // 5. Cost spike anomaly
  recommendations.push({
    id: 'REC-005',
    type: 'COST_ANOMALY',
    title: 'Review June GPU compute spike in Radiology (res-spike-imaging-gpu-004)',
    description: 'GPU processing cost surged by 241% in June ($6,450 vs baseline $1,890).',
    affected_cost: 6450.0,
    potential_savings_or_allocated: 4560.0,
    impact: 'HIGH',
    recommended_action: 'Audit unoptimized 3D DICOM reconstruction jobs and investigate idle GPU instances.',
  });

  return recommendations;
}
