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
  PiggyBank,
  TrendingDown,
  Calendar,
  Sparkles,
  Bot,
  Info,
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
      const [dash, anom] = await Promise.all([
        api.getDashboard({
          bu: buFilter,
          product: productFilter,
          account: accountFilter,
          service: serviceFilter,
          dateRange: dateFilter,
        }),
        api.getAnomalies(),
      ]);
      setData(dash);
      setAnomalies(anom);
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
      <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-base font-bold text-slate-800">Calculating Multi-Tier Cloud Attribution</h3>
          <p className="text-xs text-slate-500">
            Correlating AWS, Azure &amp; GCP billing lines with operational telemetry...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base">Unable to load FinOps Metrics</h3>
          </div>
          <p className="text-xs text-rose-700">{error || 'Database connection error'}</p>
          <button
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { kpis } = data;
  const isTargetMet = kpis.allocationRate >= kpis.targetAllocationPct;

  // Forecast vs Historical Chart dataset
  const forecastTrendData = [
    { month: 'Jan', actual: 112000, forecast: 110000 },
    { month: 'Feb', actual: 118000, forecast: 117000 },
    { month: 'Mar', actual: 126000, forecast: 124000 },
    { month: 'Apr', actual: 132000, forecast: 130000 },
    { month: 'May', actual: 138000, forecast: 136000 },
    { month: 'Jun (Proj)', actual: 0, forecast: 145200 },
    { month: 'Jul (Proj)', actual: 0, forecast: 149800 },
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Role Focus Persona Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-inner">
            {currentRole === DemoRole.Executive
              ? 'CFO'
              : currentRole === DemoRole.FinOpsAnalyst
              ? 'FIN'
              : currentRole === DemoRole.ProductOwner
              ? 'BU'
              : currentRole === DemoRole.CloudEngineer
              ? 'ENG'
              : 'AUD'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                Persona Perspective:{' '}
                {currentRole === DemoRole.Executive
                  ? 'Chief Financial Officer (Executive Spend & ROI)'
                  : currentRole === DemoRole.FinOpsAnalyst
                  ? 'FinOps Manager (Allocation & Anomaly Resolution)'
                  : currentRole === DemoRole.ProductOwner
                  ? 'Business Unit Owner (Unit Economics & Product Costs)'
                  : currentRole === DemoRole.CloudEngineer
                  ? 'Cloud Infrastructure Engineer (Resource Rightsizing)'
                  : 'Auditor (Governance & Compliance)'}
              </h3>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentRole === DemoRole.Executive
                ? 'Emphasizing total gross spend, monthly savings opportunity ($38.4k), and annual budget variance.'
                : currentRole === DemoRole.FinOpsAnalyst
                ? 'Prioritizing allocation gap analysis, anomaly alerts, and change request governance.'
                : 'Highlighting PACS Imaging, EHR, and Lab pipeline workload unit attributions.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('cost-optimization')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-2 border border-emerald-500"
        >
          <PiggyBank className="w-4 h-4 text-emerald-200" />
          <span>View Optimization Center ($38.4k/mo)</span>
        </button>
      </div>

      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Cloud FinOps Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-account cloud spend attribution, clinical unit economics, and anomaly resolution across hospital workloads.
          </p>
        </div>

        {/* Global Filter Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-1 text-slate-400 pl-1 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">Filters:</span>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Billing Dates (Jan-Jun 2026)</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">Apr 2026</option>
            <option value="2026-03">Mar 2026</option>
          </select>

          <select
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Business Units</option>
            <option value="Medical Imaging">Medical Imaging</option>
            <option value="Laboratory Services">Laboratory Services</option>
            <option value="Patient Management">Patient Management</option>
            <option value="Analytics & Research">Analytics &amp; Research</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium max-w-[160px] truncate focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Products</option>
            <option value="Medical Imaging Platform">Medical Imaging Platform</option>
            <option value="Patient Portal">Patient Portal</option>
            <option value="Clinical Analytics Platform">Clinical Analytics Platform</option>
          </select>

          {(buFilter !== 'All' || productFilter !== 'All' || accountFilter !== 'All' || dateFilter !== 'All') && (
            <button
              onClick={() => {
                setBuFilter('All');
                setProductFilter('All');
                setAccountFilter('All');
                setDateFilter('All');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 6 Top Executive KPI Cards with Tooltips & Micro-interactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Spend */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Aggregated monthly cloud spend across AWS, Azure, and GCP organizational accounts."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spend</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            ${(kpis.totalCost || 724892.6).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+4.2% MoM Spend Growth</span>
          </div>
        </div>

        {/* Card 2: Allocated Spend */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Cloud costs mapped to dedicated business units and products via Level 1-4 attribution rules."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Allocated Spend</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">
            ${(kpis.allocatedCost || 671034.6).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-[11px] font-bold text-emerald-600">
            {kpis.allocationRate.toFixed(1)}% Attributed Coverage
          </div>
        </div>

        {/* Card 3: Unallocated Spend */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Untagged infrastructure costs or shared unallocated pools requiring governance remediation."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unallocated</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 tracking-tight">
            ${(kpis.unallocatedCost || 53858.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-[11px] font-bold text-amber-600">
            {(100 - kpis.allocationRate).toFixed(1)}% Tagging Gap
          </div>
        </div>

        {/* Card 4: Potential Savings */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Monthly savings identified by rightsizing idle compute, cold DICOM storage tiering, and backup trimming."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Potential Savings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">$38,420/mo</p>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Annual: <strong className="text-emerald-700 font-bold">$461,040</strong>
          </div>
        </div>

        {/* Card 5: Forecast */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Projected spend for June 2026 based on historical trajectory and active workload expansion."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jun Forecast</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">$145,200</p>
          <div className="mt-2 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full w-max border border-amber-200">
            4.8% ABOVE BUDGET
          </div>
        </div>

        {/* Card 6: Attribution Objective KPI */}
        <div
          className="kpi-card bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group"
          title="Enterprise FinOps Target: Minimum 85% of total cloud spend must be attributed to an accountable business unit."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Attribution Target</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{kpis.targetAllocationPct}% Goal</p>
          <div className="mt-2 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-max border border-emerald-200">
            {isTargetMet ? '✓ TARGET EXCEEDED' : 'BELOW TARGET'}
          </div>
        </div>
      </div>

      {/* Active Anomaly Banner */}
      {anomalies.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 border-2 border-amber-400 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 badge-pulse">
              <AlertTriangle className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-amber-950">
                  🚨 Active Cost Anomaly Triggered in Medical Imaging Analytics
                </h4>
                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  CRITICAL VARIANCE
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Resource <code className="font-mono font-bold bg-amber-200/60 px-1.5 py-0.5 rounded">res-analytics-db-003</code> daily
                cost jumped to <strong>$1,053.18/day</strong> (+65% above $638.47 baseline). GPU utilization is low at 18%.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('cost-allocation')}
            className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Investigate Anomaly →
          </button>
        </div>
      )}

      {/* Spend Trends & Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Historical Cloud Spend vs 3-Month Projection
              </h3>
              <p className="text-xs text-slate-500">
                Monthly actual cost trajectory (Jan-May) vs ML forecast model (87% confidence).
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-lg border border-slate-200">
              Confidence Rating: 87%
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Cost']} />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Actual Spend ($)" stroke="#0d9488" strokeWidth={2.5} fill="#ccfbf1" />
                <Area type="monotone" dataKey="forecast" name="Forecast Model ($)" stroke="#8b5cf6" strokeWidth={2.5} fill="#f3e8ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Business Unit */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 tracking-tight">Spend by Business Unit</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.spendByBU}
                  dataKey="cost"
                  nameKey="business_unit"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.spendByBU.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Spend by Product & Top Cost Drivers Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Product */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Spend by Product Workload</h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              View Products →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.spendByProduct} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="product_id" stroke="#64748b" fontSize={11} interval={0} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cost Drivers */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Top Infrastructure Cost Drivers</h3>
            <button
              onClick={() => onNavigateTab('cost-allocation')}
              className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              Allocation Explorer →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Resource ID</th>
                  <th className="py-2.5 px-3 font-semibold">Service</th>
                  <th className="py-2.5 px-3 font-semibold">Business Unit</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Monthly Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data.topCostDrivers.slice(0, 5).map((driver, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{driver.resource_id}</td>
                    <td className="py-3 px-3 text-slate-600">{driver.service}</td>
                    <td className="py-3 px-3 text-slate-600">{driver.bu}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ${driver.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
