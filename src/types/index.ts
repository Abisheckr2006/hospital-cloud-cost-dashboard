export enum DemoRole {
  Executive = 'EXECUTIVE',
  FinOpsAnalyst = 'FINOPS_ANALYST',
  ProductOwner = 'PRODUCT_OWNER',
}

export interface DashboardKPIs {
  totalCost: number;
  allocatedCost: number;
  unallocatedCost: number;
  allocationRate: number;
  targetAllocationPct: number;
  gapToTarget: number;
  freshnessStatus: 'FRESH' | 'STALE' | 'MISSING';
  dataQualityScore: number;
}

export interface CostBreakdownItem {
  business_unit?: string;
  product_id?: string;
  feature_id?: string;
  service?: string;
  cloud_account_id?: string;
  cost: number;
}

export interface MonthlyTrendItem {
  month: string;
  total: number;
  allocated: number;
  unallocated: number;
}

export interface TopCostDriver {
  resource_id: string;
  service: string;
  bu: string;
  prod: string;
  total_cost: number;
}

export interface AllocationItem {
  id: number;
  allocation_id: string;
  billing_id: string;
  billing_date: string;
  cloud_account_id: string;
  service: string;
  resource_id: string;
  usage_type: string;
  cost: number;
  business_unit: string;
  product_id: string;
  feature_id: string;
  allocation_method: string;
  confidence: string;
  allocation_status: string;
  evidence_source: string;
  evidence_timestamp: string;
  reason: string;
}

export interface EvidenceDetail {
  allocation: AllocationItem;
  evidence: {
    method: string;
    confidence: string;
    source: string;
    timestamp: string;
    reason: string;
    rawBillingRecord: {
      billing_id: string;
      date: string;
      resource_id: string;
      cost: number;
      tag: string;
    };
    resourceTags: any[];
    usageTelemetry: any[];
    productActivity: any[];
  };
}

export interface UnitEconomicsData {
  metrics: Array<{
    product: string;
    activity_type: string;
    activity_volume: number;
    cloud_cost: number;
    cost_per_unit: number;
    unit_name: string;
    allocation_confidence: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    imagingCostPerImage: number;
    portalCostPerSession: number;
    analyticsCostPerReport: number;
    backupCostPerGB: number;
    loggingCostPerGB: number;
  }>;
}

export interface DataQualityReport {
  dataset: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  missing_records: number;
  duplicate_records: number;
  stale_records: number;
  affected_cost: number;
  health_score: number;
}

export interface ExperimentData {
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

export interface ChangeRequestItem {
  id: number;
  change_id: string;
  requester: string;
  role: string;
  product: string;
  business_unit: string;
  resource_id: string;
  old_allocation: string;
  proposed_allocation: string;
  cost_impact: number;
  reason: string;
  created_at: string;
  status: 'PROPOSED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'ROLLED_BACK';
  reviewer: string | null;
  reviewed_at: string | null;
}

export interface AuditLogItem {
  id: number;
  audit_id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  object_type: string;
  object_id: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: string;
  impact_amount: number;
}
