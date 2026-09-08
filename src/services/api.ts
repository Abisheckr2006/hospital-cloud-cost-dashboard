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
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

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
    if (!res.ok) throw new Error('Failed to fetch allocation records');
    return res.json();
  },

  async getEvidence(id: string | number): Promise<EvidenceDetail> {
    const res = await fetch(`/api/evidence/${id}`);
    if (!res.ok) throw new Error('Failed to fetch evidence details');
    return res.json();
  },

  async getBusinessUnits(): Promise<any[]> {
    const res = await fetch('/api/business-units');
    if (!res.ok) throw new Error('Failed to fetch business units');
    return res.json();
  },

  async getProducts(): Promise<any[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getUnitEconomics(): Promise<UnitEconomicsData> {
    const res = await fetch('/api/unit-economics');
    if (!res.ok) throw new Error('Failed to fetch unit economics');
    return res.json();
  },

  async getDataQuality(): Promise<{
    reports: DataQualityReport[];
    overallQualityScore: number;
    validationErrors: any[];
  }> {
    const res = await fetch('/api/data-quality');
    if (!res.ok) throw new Error('Failed to fetch data quality');
    return res.json();
  },

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
    if (!res.ok) throw new Error('Failed to fetch data freshness');
    return res.json();
  },

  async getExperiment(): Promise<ExperimentData> {
    const res = await fetch('/api/experiment');
    if (!res.ok) throw new Error('Failed to fetch experiment results');
    return res.json();
  },

  async runExperiment(): Promise<ExperimentData> {
    const res = await fetch('/api/experiment/run', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run experiment');
    return res.json();
  },

  async getAnomalies(): Promise<any[]> {
    const res = await fetch('/api/anomalies');
    if (!res.ok) throw new Error('Failed to fetch cost anomalies');
    return res.json();
  },

  async getRecommendations(): Promise<any[]> {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getChangeRequests(): Promise<ChangeRequestItem[]> {
    const res = await fetch('/api/change-requests');
    if (!res.ok) throw new Error('Failed to fetch change requests');
    return res.json();
  },

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
    if (!res.ok) throw new Error('Failed to submit change request');
    return res.json();
  },

  async approveChangeRequest(id: string, reviewer: string, role: DemoRole): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to approve change request');
    return data;
  },

  async rejectChangeRequest(id: string, reviewer: string, role: DemoRole, reason?: string): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer, role, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reject change request');
    return data;
  },

  async rollbackChangeRequest(id: string, user: string, role: DemoRole, reason?: string): Promise<any> {
    const res = await fetch(`/api/change-requests/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, role, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to execute rollback');
    return data;
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
