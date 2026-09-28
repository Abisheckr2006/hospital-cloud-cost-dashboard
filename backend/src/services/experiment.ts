import { Database } from 'sql.js';
import { query, run } from '../database/db.js';
import { runAllocationEngine, VALID_BUSINESS_UNITS, VALID_PRODUCTS } from '../allocation/engine.js';
import { BillingRecord } from '../types/index.js';

export interface ExperimentSummary {
  baseline: {
    totalCost: number;
    allocatedCost: number;
    unallocatedCost: number;
    allocationPct: number;
    unallocatedPct: number;
  };
  treatment: {
    totalCost: number;
    allocatedCost: number;
    unallocatedCost: number;
    allocationPct: number;
    unallocatedPct: number;
  };
  targetPct: number;
  gapToTarget: number;
  percentagePointImprovement: number;
  relativeImprovementPct: number;
  unallocatedCostReduction: number;
  unallocatedReductionPct: number;
  costCoveragePct: number;
  breakdown: {
    level1DirectCost: number;
    level2ResourceTagCost: number;
    level3UsageBasedCost: number;
    level4ActivityBasedCost: number;
    level5UnallocatedCost: number;
  };
  errorAnalysis: Array<{
    category: string;
    affectedCost: number;
    affectedRecords: number;
    pctOfTotalCost: number;
    recommendedResolution: string;
  }>;
}

export function runFinOpsExperiment(db: Database): ExperimentSummary {
  const billingRecords = query<BillingRecord>(db, 'SELECT * FROM billing_records');
  const totalCost = billingRecords.reduce((acc, b) => acc + b.cost, 0);

  // 1. BASELINE: Billing-Only Attribution (No tags, telemetry, or activity enrichment)
  let baselineAllocated = 0;
  let baselineAllocatedCount = 0;

  billingRecords.forEach((b) => {
    // Only records with valid business_unit + product directly in raw bill
    if (
      b.business_unit &&
      VALID_BUSINESS_UNITS.includes(b.business_unit) &&
      b.product_id &&
      VALID_PRODUCTS.includes(b.product_id) &&
      b.feature_id
    ) {
      baselineAllocated += b.cost;
      baselineAllocatedCount++;
    }
  });

  const baselineUnallocated = totalCost - baselineAllocated;
  const baselineAllocationPct = totalCost > 0 ? (baselineAllocated / totalCost) * 100 : 0;
  const baselineUnallocatedPct = 100 - baselineAllocationPct;

  // 2. TREATMENT: Run full multi-tier allocation engine
  const treatmentResult = runAllocationEngine(db);

  const treatmentAllocated = treatmentResult.allocatedCost;
  const treatmentUnallocated = treatmentResult.unallocatedCost;
  const treatmentAllocationPct = treatmentResult.allocationRatePct;
  const treatmentUnallocatedPct = 100 - treatmentAllocationPct;

  const targetPct = 85.0;
  const gapToTarget = parseFloat((targetPct - treatmentAllocationPct).toFixed(2));
  const ppImprovement = parseFloat((treatmentAllocationPct - baselineAllocationPct).toFixed(2));
  const relImprovementPct = baselineAllocationPct > 0
    ? parseFloat((((treatmentAllocationPct - baselineAllocationPct) / baselineAllocationPct) * 100).toFixed(2))
    : 0;
  const unallocatedCostReduction = parseFloat((baselineUnallocated - treatmentUnallocated).toFixed(2));
  const unallocatedReductionPct = baselineUnallocated > 0
    ? parseFloat(((unallocatedCostReduction / baselineUnallocated) * 100).toFixed(2))
    : 0;
  const costCoveragePct = totalCost > 0 ? parseFloat(((treatmentAllocated / totalCost) * 100).toFixed(2)) : 0;

  // 3. Error Analysis from data validation errors
  const validationErrors = query<{
    issue_type: string;
    affected_cost: number;
  }>(db, 'SELECT issue_type, affected_cost FROM data_validation_errors');

  const errorCategories: Record<string, { cost: number; count: number; resolution: string }> = {
    MISSING_ALLOCATION_TAG: {
      cost: 0,
      count: 0,
      resolution: 'Enforce Terraform/CloudFormation tags (`bu`, `product`, `feature`) at resource provisioning',
    },
    STALE_TELEMETRY: {
      cost: 0,
      count: 0,
      resolution: 'Restore high-frequency agent polling and health-check telemetry scrapers',
    },
    INVALID_PRODUCT_ID: {
      cost: 0,
      count: 0,
      resolution: 'Remap legacy or decommissioned product identifiers to current enterprise catalog',
    },
    CONFLICTING_TAGS: {
      cost: 0,
      count: 0,
      resolution: 'Convene FinOps review to assign single accountable business unit owner or partition resources',
    },
    DUPLICATE_BILLING: {
      cost: 0,
      count: 0,
      resolution: 'Flag cloud invoice line items with cloud support for reconciliation credits',
    },
  };

  validationErrors.forEach((ve) => {
    if (errorCategories[ve.issue_type]) {
      errorCategories[ve.issue_type].cost += ve.affected_cost || 0;
      errorCategories[ve.issue_type].count++;
    }
  });

  const errorAnalysis = Object.keys(errorCategories).map((catKey) => {
    const item = errorCategories[catKey];
    return {
      category: catKey.replace(/_/g, ' '),
      affectedCost: parseFloat(item.cost.toFixed(2)),
      affectedRecords: item.count,
      pctOfTotalCost: totalCost > 0 ? parseFloat(((item.cost / totalCost) * 100).toFixed(2)) : 0,
      recommendedResolution: item.resolution,
    };
  });

  // Record experiment run in database
  run(db, `
    INSERT INTO experiments (
      run_at, baseline_total_cost, baseline_allocated_cost, baseline_unallocated_cost,
      baseline_allocation_pct, treatment_total_cost, treatment_allocated_cost,
      treatment_unallocated_cost, treatment_allocation_pct, target_allocation_pct,
      pp_improvement, rel_improvement_pct, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    new Date().toISOString(),
    parseFloat(totalCost.toFixed(2)),
    parseFloat(baselineAllocated.toFixed(2)),
    parseFloat(baselineUnallocated.toFixed(2)),
    parseFloat(baselineAllocationPct.toFixed(2)),
    parseFloat(totalCost.toFixed(2)),
    treatmentAllocated,
    treatmentUnallocated,
    treatmentAllocationPct,
    targetPct,
    ppImprovement,
    relImprovementPct,
    'COMPLETED',
  ]);

  return {
    baseline: {
      totalCost: parseFloat(totalCost.toFixed(2)),
      allocatedCost: parseFloat(baselineAllocated.toFixed(2)),
      unallocatedCost: parseFloat(baselineUnallocated.toFixed(2)),
      allocationPct: parseFloat(baselineAllocationPct.toFixed(2)),
      unallocatedPct: parseFloat(baselineUnallocatedPct.toFixed(2)),
    },
    treatment: {
      totalCost: parseFloat(totalCost.toFixed(2)),
      allocatedCost: treatmentAllocated,
      unallocatedCost: treatmentUnallocated,
      allocationPct: treatmentAllocationPct,
      unallocatedPct: parseFloat(treatmentUnallocatedPct.toFixed(2)),
    },
    targetPct,
    gapToTarget,
    percentagePointImprovement: ppImprovement,
    relativeImprovementPct: relImprovementPct,
    unallocatedCostReduction,
    unallocatedReductionPct,
    costCoveragePct,
    breakdown: {
      level1DirectCost: treatmentResult.levelBreakdown.direct.cost,
      level2ResourceTagCost: treatmentResult.levelBreakdown.resourceTag.cost,
      level3UsageBasedCost: treatmentResult.levelBreakdown.usageBased.cost,
      level4ActivityBasedCost: treatmentResult.levelBreakdown.activityBased.cost,
      level5UnallocatedCost: treatmentResult.levelBreakdown.unallocated.cost,
    },
    errorAnalysis,
  };
}
