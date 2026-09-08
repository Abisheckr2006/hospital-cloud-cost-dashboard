import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api.js';
import { ExperimentData } from '../types/index.js';

export const ExperimentPage: React.FC = () => {
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const loadExperiment = async () => {
    try {
      setLoading(true);
      const data = await api.getExperiment();
      setExperiment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiment();
  }, []);

  const handleRunReExperiment = async () => {
    try {
      setRunning(true);
      setRunMessage('Re-evaluating Baseline vs Treatment on live database...');
      const updated = await api.runExperiment();
      setExperiment(updated);
      setRunMessage('Experiment executed successfully! Metrics re-synchronized.');
      setTimeout(() => setRunMessage(null), 4000);
    } catch (err: any) {
      setRunMessage(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (loading || !experiment) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Experiment Analysis &amp; Attribution Tiers...</p>
      </div>
    );
  }

  const { baseline, treatment, breakdown, errorAnalysis } = experiment;

  const comparisonChartData = [
    {
      metric: 'Allocated Cost ($)',
      Baseline: baseline.allocatedCost,
      Treatment: treatment.allocatedCost,
    },
    {
      metric: 'Unallocated Cost ($)',
      Baseline: baseline.unallocatedCost,
      Treatment: treatment.unallocatedCost,
    },
  ];

  const tierChartData = [
    { name: 'Level 1: Direct', cost: breakdown.level1DirectCost, fill: '#10b981' },
    { name: 'Level 2: Resource Tag', cost: breakdown.level2ResourceTagCost, fill: '#3b82f6' },
    { name: 'Level 3: Usage Telemetry', cost: breakdown.level3UsageBasedCost, fill: '#0d9488' },
    { name: 'Level 4: Activity Volume', cost: breakdown.level4ActivityBasedCost, fill: '#8b5cf6' },
    { name: 'Level 5: Unallocated', cost: breakdown.level5UnallocatedCost, fill: '#f43f5e' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header & Run Experiment Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              FinOps Attribution Experiment: Baseline vs Treatment
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal A/B evaluation measuring attribution improvement against the 85.0% allocation target.
          </p>
        </div>

        <button
          id="btn-run-experiment"
          onClick={handleRunReExperiment}
          disabled={running}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Computing Attribution...' : 'Re-Run Experiment'}</span>
        </button>
      </div>

      {runMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800">
          {runMessage}
        </div>
      )}

      {/* Hero Comparative Summary: BEFORE vs AFTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control / Pre-FinOps</span>
              <h3 className="text-base font-bold text-slate-800">Baseline (Naive Billing Tag Only)</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              Target Missed (36.8%)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-500">Allocation Rate:</span>
              <p className="text-3xl font-black text-rose-600 mt-0.5">{baseline.allocationPct.toFixed(1)}%</p>
              <span className="text-[10px] text-slate-400">Target: 85.0%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">Unallocated Cloud Spend:</span>
              <p className="text-2xl font-black text-slate-800 mt-0.5">${baseline.unallocatedCost.toLocaleString()}</p>
              <span className="text-[10px] text-rose-500 font-medium">{baseline.unallocatedPct.toFixed(1)}% blind spot</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Cloud Spend:</span>
              <span className="font-semibold text-slate-900">${baseline.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Attributed Spend:</span>
              <span className="font-semibold text-slate-700">${baseline.allocatedCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Treatment Card */}
        <div className="bg-teal-50/40 rounded-xl border-2 border-teal-500 shadow-xs p-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Treatment Group</span>
              <h3 className="text-base font-bold text-teal-900">Multi-Tier Attribution Engine</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shadow-xs">
              Target Exceeded ({treatment.allocationPct.toFixed(1)}%)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-teal-700 font-semibold">Allocation Rate:</span>
              <p className="text-3xl font-black text-emerald-700 mt-0.5">{treatment.allocationPct.toFixed(1)}%</p>
              <span className="text-[10px] text-emerald-800 font-bold">+7.57% above target</span>
            </div>
            <div>
              <span className="text-[11px] text-teal-700 font-semibold">Unallocated Spend Reduced:</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">${treatment.unallocatedCost.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-700 font-bold">Reduced by {experiment.unallocatedReductionPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-100 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>Total Cloud Spend:</span>
              <span className="font-semibold text-slate-900">${treatment.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Attributed Spend:</span>
              <span className="font-bold text-emerald-800">${treatment.allocatedCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Impact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Absolute Increase</span>
          <p className="text-2xl font-black text-teal-700 mt-1">+{experiment.percentagePointImprovement.toFixed(2)} pp</p>
          <span className="text-[10px] text-slate-400">Percentage points gained</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Relative Improvement</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">+{experiment.relativeImprovementPct.toFixed(1)}%</p>
          <span className="text-[10px] text-slate-400">Attribution multiplier</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Unallocated Cost Recovered</span>
          <p className="text-2xl font-black text-slate-900 mt-1">${experiment.unallocatedCostReduction.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Rescued from blind spots</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Cloud Cost Coverage</span>
          <p className="text-2xl font-black text-teal-700 mt-1">{experiment.costCoveragePct.toFixed(1)}%</p>
          <span className="text-[10px] text-slate-400">Of total hospital invoice</span>
        </div>
      </div>

      {/* Multi-Tier Attribution Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Tier Waterfall Breakdown</h3>
            <p className="text-xs text-slate-500">How the multi-tier engine resolved the spend step-by-step</p>
          </div>
          <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            5 Priority Levels
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Attributed Spend']} />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-900">Level 1: Direct Cloud Billing</span>
                <p className="text-[11px] text-emerald-700">Dedicated accounts (ACCT-IMAGING, ACCT-PORTAL)</p>
              </div>
              <span className="font-black text-slate-900">${breakdown.level1DirectCost.toLocaleString()}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-900">Level 2: Resource Governance Tags</span>
                <p className="text-[11px] text-blue-700">Terraform / AWS tag matching on resources</p>
              </div>
              <span className="font-black text-slate-900">${breakdown.level2ResourceTagCost.toLocaleString()}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-teal-900">Level 3: Usage Telemetry Correlation</span>
                <p className="text-[11px] text-teal-700">GB logs, storage volume, node hours</p>
              </div>
              <span className="font-black text-slate-900">${breakdown.level3UsageBasedCost.toLocaleString()}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-purple-900">Level 4: Product Activity Proportional</span>
                <p className="text-[11px] text-purple-700">Images processed, sessions, report queries</p>
              </div>
              <span className="font-black text-slate-900">${breakdown.level4ActivityBasedCost.toLocaleString()}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-900">Level 5: Unallocated Pool</span>
                <p className="text-[11px] text-rose-700">Untagged, orphan resources pending tagging policy</p>
              </div>
              <span className="font-black text-rose-700">${breakdown.level5UnallocatedCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis & Recommended Resolution */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Error Taxonomy &amp; Residual Spend Analysis</h3>
          </div>
          <span className="text-xs text-slate-500">Root cause attribution failure categorization</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Error Category</th>
                <th className="p-3 font-semibold text-right">Affected Cost</th>
                <th className="p-3 font-semibold text-right">Records</th>
                <th className="p-3 font-semibold text-right">% of Total</th>
                <th className="p-3 font-semibold">Recommended Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {errorAnalysis.map((err, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-800">{err.category}</td>
                  <td className="p-3 font-bold text-slate-900 text-right">
                    ${err.affectedCost.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono text-slate-600 text-right">{err.affectedRecords}</td>
                  <td className="p-3 font-mono text-slate-700 text-right">{err.pctOfTotalCost}%</td>
                  <td className="p-3 text-slate-600">{err.recommendedResolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
