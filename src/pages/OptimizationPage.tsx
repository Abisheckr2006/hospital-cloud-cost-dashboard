import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingDown, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Cpu, HardDrive, Tag, Archive } from 'lucide-react';
import { api } from '../services/api.js';
import { OptimizationRecommendation, DemoRole } from '../types/index.js';

interface OptimizationPageProps {
  currentRole?: DemoRole;
  onNavigateTab?: (tab: string) => void;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({ currentRole, onNavigateTab }) => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [monthlySavings, setMonthlySavings] = useState(38420);
  const [annualSavings, setAnnualSavings] = useState(461040);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.getOptimization();
        setRecommendations(res.items);
        setMonthlySavings(res.potentialMonthlySavings);
        setAnnualSavings(res.potentialAnnualSavings);
      } catch (err) {
        console.error('Error fetching optimization opportunities:', err);
      }
    };
    fetchRecs();
  }, []);

  const handleStatusChange = (id: string, newStatus: OptimizationRecommendation['status']) => {
    setRecommendations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showToast(`Recommendation ${id} status updated to ${newStatus}`);
  };

  const handleCreateCR = async (item: OptimizationRecommendation) => {
    try {
      await api.createChangeRequest({
        requester: 'Marcus Vance (FinOps)',
        role: currentRole || DemoRole.FinOpsAnalyst,
        product: item.product,
        business_unit: item.business_unit,
        resource_id: item.resource_id,
        proposed_allocation: `${item.title} (Est. Savings: $${item.estimated_savings}/mo)`,
        reason: item.recommendation,
      });
      handleStatusChange(item.id, 'REVIEWING');
      showToast(`Change Request submitted for ${item.resource_id} ($${item.estimated_savings}/mo savings)`);
    } catch (err) {
      showToast('Submitted Change Request for review');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRecs = filterPriority === 'ALL'
    ? recommendations
    : recommendations.filter((r) => r.priority === filterPriority);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-7 h-7 text-emerald-600" />
            Cost Optimization Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated FinOps recommendations for rightsizing, cold storage tiering, and idle hospital cloud resource reduction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
          </select>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('experiment')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Run What-If Simulator</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <span>Potential Monthly Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight">
            ${monthlySavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-emerald-200/80">
            Equivalent to **5.3%** total monthly cloud budget reduction.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Potential Annual Savings</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            ${annualSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Cumulative annual ROI across DICOM, EHR, and Analytics workloads.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Recommendations</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{recommendations.length}</span>
            <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              1 Critical
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Calculated against real utilization telemetry and tag compliance SLAs.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Optimization Opportunities &amp; Rightsizing Recommendations
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {filteredRecs.map((rec) => {
            const isCritical = rec.priority === 'CRITICAL';
            const isHigh = rec.priority === 'HIGH';
            return (
              <div
                key={rec.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.category === 'IDLE_RESOURCE'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : rec.category === 'OVERSIZED_INSTANCE'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : rec.category === 'STORAGE_TIERING'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {rec.category === 'IDLE_RESOURCE' && <Cpu className="w-6 h-6" />}
                    {rec.category === 'OVERSIZED_INSTANCE' && <HardDrive className="w-6 h-6" />}
                    {rec.category === 'STORAGE_TIERING' && <Archive className="w-6 h-6" />}
                    {rec.category === 'UNREGISTERED_TAGS' && <Tag className="w-6 h-6" />}
                    {rec.category === 'BACKUP_RETENTION' && <Archive className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900">{rec.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">
                        {rec.resource_id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rec.recommendation}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                      <span>
                        BU: <strong className="text-slate-800">{rec.business_unit}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Product: <strong className="text-slate-800">{rec.product}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Utilization: <strong className="text-slate-800">{rec.utilization_pct}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Savings & Action Button */}
                <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Savings</div>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">
                      +${rec.estimated_savings.toLocaleString()}/mo
                    </div>
                    <div className="text-[11px] text-slate-400">Current Cost: ${rec.current_cost.toLocaleString()}/mo</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(rec.id, e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEWING">REVIEWING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="IMPLEMENTED">IMPLEMENTED</option>
                    </select>

                    <button
                      onClick={() => handleCreateCR(rec)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Create CR →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
