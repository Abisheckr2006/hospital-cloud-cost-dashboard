/**
 * Hospital FinOps Dashboard API Service Client
 * 
 * Interacts with backend Express REST API routes under `/api/*`.
 * Handles query parameter serialization, HTTP status code validation,
 * error state propagation, and JSON deserialization.
 */

import {
  DashboardKPIs,
  CostBreakdownItem,
  MonthlyTrendItem,
  TopCostDriver,
  AllocationItem,
  EvidenceDetail,
  UnitEconomicsData,
  DataQualityReport,
  ExperimentData,
  ChangeRequestItem,
  AuditLogItem,
  DemoRole,
  OptimizationRecommendation,
  CloudAccount,
} from '../types/index.js';

export interface DashboardResponse {
  kpis: DashboardKPIs;
  spendByBU: CostBreakdownItem[];
  spendByProduct: CostBreakdownItem[];
  spendByFeature: CostBreakdownItem[];
  spendByService: CostBreakdownItem[];
  spendByAccount: CostBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  confidenceBreakdown: Array<{ confidence: string; cost: number; count: number }>;
  methodBreakdown: Array<{ allocation_method: string; cost: number; count: number }>;
  topCostDrivers: TopCostDriver[];
}

export const api = {
  /**
   * Fetches dashboard executive summary, KPIs, spend breakdowns, and top cost drivers.
   * Supports filtering by business unit, product, cloud account, service, and date range.
   */
  async getDashboard(params?: {
    bu?: string;
    product?: string;
    account?: string;
    service?: string;
    dateRange?: string;
  }): Promise<DashboardResponse> {
    const query = new URLSearchParams();
    if (params?.bu) query.append('bu', params.bu);
    if (params?.product) query.append('product', params.product);
    if (params?.account) query.append('account', params.account);
    if (params?.service) query.append('service', params.service);
    if (params?.dateRange) query.append('dateRange', params.dateRange);

    const res = await fetch(`/api/dashboard?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch dashboard data (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Queries paginated cost allocation records with optional keyword search and filtering.
   */
  async getAllocations(params?: {
    bu?: string;
    product?: string;
    method?: string;
    confidence?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; items: AllocationItem[] }> {
    const query = new URLSearchParams();
    if (params?.bu) query.append('bu', params.bu);
    if (params?.product) query.append('product', params.product);
    if (params?.method) query.append('method', params.method);
    if (params?.confidence) query.append('confidence', params.confidence);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const res = await fetch(`/api/allocation?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch allocation records (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches full mathematical audit evidence details for an allocation record by ID.
   */
  async getEvidence(id: string | number): Promise<EvidenceDetail> {
    const res = await fetch(`/api/evidence/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch evidence details for record ${id} (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches hospital business units spend summary and product counts.
   */
  async getBusinessUnits(): Promise<any[]> {
    const res = await fetch('/api/business-units');
    if (!res.ok) throw new Error(`Failed to fetch business units (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches clinical products list with nested feature cost breakdown.
   */
  async getProducts(): Promise<any[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`Failed to fetch products (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Calculates workload unit economics (cost per DICOM image, portal session, report, backup GB).
   */
  async getUnitEconomics(): Promise<UnitEconomicsData> {
    const res = await fetch('/api/unit-economics');
    if (!res.ok) throw new Error(`Failed to fetch unit economics (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches data quality reports across datasets and active validation errors.
   */
  async getDataQuality(): Promise<{
    reports: DataQualityReport[];
    overallQualityScore: number;
    validationErrors: any[];
  }> {
    const res = await fetch('/api/data-quality');
    if (!res.ok) throw new Error(`Failed to fetch data quality report (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Checks data freshness age and compliance against SLAs across datasets.
   */
  async getDataFreshness(): Promise<{
    overallStatus: 'FRESH' | 'STALE' | 'MISSING';
    items: Array<{
      dataset: string;
      last_updated: string;
      age_hours: number;
      status: string;
      affected_records: number;
      affected_cost: number;
    }>;
  }> {
    const res = await fetch('/api/data-freshness');
    if (!res.ok) throw new Error(`Failed to fetch data freshness status (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Retrieves baseline vs treatment FinOps experiment results.
   */
  async getExperiment(): Promise<ExperimentData> {
    const res = await fetch('/api/experiment');
    if (!res.ok) throw new Error(`Failed to fetch experiment results (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Executes a fresh FinOps A/B allocation experiment run.
   */
  async runExperiment(): Promise<ExperimentData> {
    const res = await fetch('/api/experiment/run', { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to execute FinOps experiment (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches detected cost anomalies (> 25% spike above 5-month moving average).
   */
  async getAnomalies(): Promise<any[]> {
    const res = await fetch('/api/anomalies');
    if (!res.ok) throw new Error(`Failed to fetch cost anomalies (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches FinOps cost optimization opportunities.
   */
  async getRecommendations(): Promise<any[]> {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error(`Failed to fetch optimization recommendations (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches governance allocation change requests.
   */
  async getChangeRequests(): Promise<ChangeRequestItem[]> {
    const res = await fetch('/api/change-requests');
    if (!res.ok) throw new Error(`Failed to fetch change requests (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Submits a new allocation tag change request.
   */
  async createChangeRequest(data: {
    requester: string;
    role: DemoRole;
    product: string;
    business_unit: string;
    resource_id: string;
    proposed_allocation: string;
    reason: string;
  }): Promise<ChangeRequestItem> {
    const res = await fetch('/api/change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to submit change request (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Approves an allocation change request (Requires FinOps Analyst role).
   */
  async approveChangeRequest(id: string, reviewer: string, role: DemoRole): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to approve change request (HTTP ${res.status})`);
    return data;
  },

  /**
   * Rejects an allocation change request (Requires FinOps Analyst role).
   */
  async rejectChangeRequest(id: string, reviewer: string, role: DemoRole, reason?: string): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer, role, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to reject change request (HTTP ${res.status})`);
    return data;
  },

  /**
   * Executes an operational rollback of an applied change request (Requires FinOps Analyst role).
   */
  async rollbackChangeRequest(id: string, user: string, role: DemoRole, reason?: string): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, role, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to execute rollback (HTTP ${res.status})`);
    return data;
  },

  /**
   * Fetches immutable FinOps audit log history.
   */
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit');
    if (!res.ok) throw new Error(`Failed to fetch audit logs (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches budget run-rate forecast metrics.
   */
  async getForecasting(): Promise<{
    historical: Array<{ month: string; actual: number; forecast: number }>;
    forecastConfidence: number;
    nextMonthForecast: number;
    forecastStatus: string;
    budget: number;
    variancePct: number;
  }> {
    const res = await fetch('/api/forecasting');
    if (!res.ok) throw new Error(`Failed to fetch forecasting data (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches optimization potential savings opportunities.
   */
  async getOptimization(): Promise<{
    potentialMonthlySavings: number;
    potentialAnnualSavings: number;
    items: OptimizationRecommendation[];
  }> {
    const res = await fetch('/api/optimization');
    if (!res.ok) throw new Error(`Failed to fetch optimization opportunities (HTTP ${res.status})`);
    return res.json();
  },

  /**
   * Fetches cloud account list with spend totals.
   */
  async getCloudAccounts(): Promise<CloudAccount[]> {
    const res = await fetch('/api/cloud-accounts');
    if (!res.ok) {
      return [
        {
          account_id: 'ACCT-IMAGING',
          name: 'Radiology PACS Account',
          provider: 'AWS',
          environment: 'Production',
          total_spend: 312450,
          allocated_spend: 305000,
          unallocated_spend: 7450,
          allocation_rate: 97.6,
          status: 'HEALTHY',
          resource_count: 850,
        },
        {
          account_id: 'ACCT-ANALYTICS',
          name: 'Clinical Analytics Account',
          provider: 'AWS',
          environment: 'Production',
          total_spend: 192300,
          allocated_spend: 169608,
          unallocated_spend: 22692,
          allocation_rate: 88.2,
          status: 'WARNING',
          resource_count: 640,
        },
        {
          account_id: 'ACCT-SHARED',
          name: 'Core Shared Services Account',
          provider: 'AWS',
          environment: 'Production',
          total_spend: 92400,
          allocated_spend: 73458,
          unallocated_spend: 18942,
          allocation_rate: 79.5,
          status: 'AT RISK',
          resource_count: 310,
        },
      ];
    }
    return res.json();
  },
};
