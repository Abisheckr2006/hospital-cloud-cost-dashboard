import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { api, DashboardResponse } from '../services/api.js';
import { DemoRole } from '../types/index.js';

interface DashboardPageProps {
  currentRole: DemoRole;
  onNavigateTab: (tab: string) => void;
}

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentRole, onNavigateTab }) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Filter states
  const [buFilter, setBuFilter] = useState<string>('All');
  const [productFilter, setProductFilter] = useState<string>('All');
  const [accountFilter, setAccountFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, anom, recs] = await Promise.all([
        api.getDashboard({
          bu: buFilter,
          product: productFilter,
          account: accountFilter,
          service: serviceFilter,
          dateRange: dateFilter,
        }),
        api.getAnomalies(),
        api.getRecommendations(),
      ]);
      setData(dash);
      setAnomalies(anom);
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [buFilter, productFilter, accountFilter, serviceFilter, dateFilter]);

  if (loading && !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Calculating Multi-Tier Cloud Attribution...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800 text-sm">
          <p className="font-bold">Error loading dashboard</p>
          <p>{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis } = data;
  const isTargetMet = kpis.allocationRate >= kpis.targetAllocationPct;

  return (
    <div className="p-8 space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Cloud FinOps Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit economics, attribution coverage, and spend accountability across hospital workloads.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 pl-1 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

          <select
            id="filter-date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Months (Jan-Jun 2026)</option>
            <option value="2026-01">Jan 2026</option>
            <option value="2026-02">Feb 2026</option>
            <option value="2026-03">Mar 2026</option>
            <option value="2026-04">Apr 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-06">Jun 2026</option>
          </select>

          <select
            id="filter-bu"
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Business Units</option>
            <option value="Radiology">Radiology</option>
            <option value="Emergency Services">Emergency Services</option>
            <option value="Clinical Analytics">Clinical Analytics</option>
            <option value="Patient Portal">Patient Portal</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Research">Research</option>
            <option value="Unallocated">Unallocated</option>
          </select>

          <select
            id="filter-product"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium max-w-[150px] truncate"
          >
            <option value="All">All Products</option>
            <option value="Medical Imaging Platform">Medical Imaging Platform</option>
            <option value="Patient Portal">Patient Portal</option>
            <option value="Clinical Analytics Platform">Clinical Analytics Platform</option>
            <option value="Backup & Recovery">Backup &amp; Recovery</option>
            <option value="Hospital Logging Platform">Hospital Logging Platform</option>
            <option value="Unallocated">Unallocated</option>
          </select>

          <select
            id="filter-account"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All">All Accounts</option>
            <option value="ACCT-IMAGING">ACCT-IMAGING</option>
            <option value="ACCT-PORTAL">ACCT-PORTAL</option>
            <option value="ACCT-ANALYTICS">ACCT-ANALYTICS</option>
            <option value="ACCT-BACKUP">ACCT-BACKUP</option>
            <option value="ACCT-LOGGING">ACCT-LOGGING</option>
            <option value="ACCT-SHARED">ACCT-SHARED</option>
          </select>

          {(buFilter !== 'All' || productFilter !== 'All' || accountFilter !== 'All' || serviceFilter !== 'All' || dateFilter !== 'All') && (
            <button
              onClick={() => {
                setBuFilter('All');
                setProductFilter('All');
                setAccountFilter('All');
                setServiceFilter('All');
                setDateFilter('All');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend */}
        <div id="kpi-total-spend" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Cloud Spend</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">${kpis.totalCost.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-[11px] text-slate-500">
            <span>Aggregated across 6 accounts &amp; multi-month bills</span>
          </div>
        </div>

        {/* Card 2: Allocated Spend */}
        <div id="kpi-allocated-spend" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Allocated Spend</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-700 mt-2">${kpis.allocatedCost.toLocaleString()}</p>
          <div className="mt-2 flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-teal-600">{kpis.allocationRate.toFixed(1)}%</span>
            <span className="text-slate-400">&bull; Attributed to verified BU</span>
          </div>
        </div>

        {/* Card 3: Unallocated Spend */}
        <div id="kpi-unallocated-spend" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unallocated Spend</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">${kpis.unallocatedCost.toLocaleString()}</p>
          <div className="mt-2 flex items-center space-x-2 text-[11px]">
            <span className="font-bold text-amber-600">{(100 - kpis.allocationRate).toFixed(1)}%</span>
            <span className="text-slate-400">&bull; Missing tags or evidence</span>
          </div>
        </div>

        {/* Card 4: Primary KPI - Target vs Actual */}
        <div id="kpi-target-rate" className={`p-5 rounded-xl border shadow-xs relative overflow-hidden ${
          isTargetMet ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Objective KPI</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isTargetMet ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
            }`}>
              {isTargetMet ? 'TARGET EXCEEDED' : 'TARGET GAP'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className="text-2xl font-black text-slate-900">{kpis.allocationRate.toFixed(2)}%</p>
            <span className="text-xs text-slate-500">vs 85.0% Target</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>{isTargetMet ? `+${(kpis.allocationRate - 85).toFixed(2)}% over target` : `${kpis.gapToTarget}% gap`}</span>
            <button
              onClick={() => onNavigateTab('experiment')}
              className="text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-0.5"
            >
              <span>See Experiment</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Anomalies Banner if Cost Spike detected */}
      {anomalies.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-900 uppercase">Cost Anomaly Detected</span>
              <span className="text-[11px] font-semibold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                Variance &gt; 125% Threshold
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              <strong>{anomalies[0].resource_id}</strong> ({anomalies[0].product} - {anomalies[0].service}) billed{' '}
              <strong>${anomalies[0].current_cost.toFixed(2)}</strong> vs expected baseline{' '}
              <strong>${anomalies[0].expected_cost.toFixed(2)}</strong> (+{anomalies[0].variance_pct}% variance).
            </p>
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => onNavigateTab('cost-allocation')}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
              >
                Inspect GPU Resource in Cost Allocation &rarr;
              </button>
              <button
                onClick={() => onNavigateTab('change-review')}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
              >
                Review Reallocation Request (CR-DEMO-001) &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row 1 Charts: Spend by BU & Spend by Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Spend by Business Unit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Spend by Business Unit</h3>
              <p className="text-xs text-slate-500">Attributed cloud cost by accountable organizational unit</p>
            </div>
            <button
              onClick={() => onNavigateTab('business-units')}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center space-x-1"
            >
              <span>BU Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.spendByBU}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="business_unit" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cost']} />
                <Bar dataKey="cost" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {data.spendByBU.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.business_unit === 'Unallocated' ? '#f43f5e' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Spend by Product */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Spend by Product</h3>
              <p className="text-xs text-slate-500">Cost aggregated across clinical and operational products</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center space-x-1"
            >
              <span>Products View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.spendByProduct}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="product_id" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Spend']} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {data.spendByProduct.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.product_id === 'Unallocated' ? '#f43f5e' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Cost Trend & Allocation Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 7: Monthly Cost Trend (Allocated vs Unallocated) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7. Monthly Cost Trend: Allocated vs Unallocated</h3>
              <p className="text-xs text-slate-500">6-Month historical cloud spend trajectory (Jan - Jun 2026)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="allocated" name="Allocated Spend" stackId="1" stroke="#0d9488" fill="#ccfbf1" />
                <Area type="monotone" dataKey="unallocated" name="Unallocated Spend" stackId="1" stroke="#f43f5e" fill="#ffe4e6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 9: Allocation Confidence */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">9. Allocation Confidence</h3>
              <p className="text-xs text-slate-500">Statistical certainty of evidence</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.confidenceBreakdown}
                  dataKey="cost"
                  nameKey="confidence"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {data.confidenceBreakdown.map((entry, index) => {
                    let fill = '#94a3b8';
                    if (entry.confidence === 'HIGH') fill = '#10b981';
                    else if (entry.confidence === 'MEDIUM') fill = '#3b82f6';
                    else if (entry.confidence === 'LOW') fill = '#f59e0b';
                    else if (entry.confidence === 'NONE') fill = '#f43f5e';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cost']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Top Cost Drivers & Service Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Cost Drivers */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">10. Top Cloud Cost Drivers</h3>
              <p className="text-xs text-slate-500">Highest spending resources across hospital cloud accounts</p>
            </div>
            <button
              onClick={() => onNavigateTab('cost-allocation')}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
            >
              View All &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-2 font-semibold">Resource ID</th>
                  <th className="p-2 font-semibold">Service</th>
                  <th className="p-2 font-semibold">Attributed BU</th>
                  <th className="p-2 font-semibold">Product</th>
                  <th className="p-2 font-semibold text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.topCostDrivers.slice(0, 6).map((driver, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="p-2 font-mono font-medium text-slate-800">{driver.resource_id}</td>
                    <td className="p-2 text-slate-600">{driver.service}</td>
                    <td className="p-2 font-medium text-teal-700">{driver.bu}</td>
                    <td className="p-2 text-slate-600 truncate max-w-[150px]">{driver.prod}</td>
                    <td className="p-2 font-bold text-slate-900 text-right">
                      ${driver.total_cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spend by Cloud Service */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Spend by Cloud Service</h3>
              <p className="text-xs text-slate-500">Infrastructure components</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.spendByService}
                  dataKey="cost"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                >
                  {data.spendByService.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cost']} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
