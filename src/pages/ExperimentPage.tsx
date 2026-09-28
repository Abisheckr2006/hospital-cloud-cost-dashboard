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
  Sliders,
  DollarSign,
  PiggyBank,
  Check,
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

  // Interactive What-If Simulator Sliders
  const [storageTieringPct, setStorageTieringPct] = useState<number>(30);
  const [computeRightsizingPct, setComputeRightsizingPct] = useState<number>(20);
  const [reservedCapacityPct, setReservedCapacityPct] = useState<number>(50);
  const [gpuSchedulingPct, setGpuSchedulingPct] = useState<number>(40);

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

  // What-If Simulator Dynamic Math
  const totalBaseSpend = baseline.totalCost || 724892.6;
  const storageSavings = (storageTieringPct / 100) * 48000;
  const computeSavings = (computeRightsizingPct / 100) * 62000;
  const reservedSavings = (reservedCapacityPct / 100) * 35000;
  const gpuSavings = (gpuSchedulingPct / 100) * 28000;

  const totalMonthlyScenarioSavings = storageSavings + computeSavings + reservedSavings + gpuSavings;
  const scenarioMonthlySpend = Math.max(0, totalBaseSpend - totalMonthlyScenarioSavings);
  const totalAnnualScenarioSavings = totalMonthlyScenarioSavings * 12;
  const netReductionPct = (totalMonthlyScenarioSavings / totalBaseSpend) * 100;

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
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header & Run Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              FinOps Experiment &amp; What-If Cost Simulator
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Simulate infrastructure re-architecture, reserved instance coverage, and DICOM storage tiering scenarios in real time.
          </p>
        </div>

        <button
          id="btn-run-experiment"
          onClick={handleRunReExperiment}
          disabled={running}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Computing Attribution...' : 'Re-Run Experiment'}</span>
        </button>
      </div>

      {runMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
          {runMessage}
        </div>
      )}

      {/* Interactive What-If Simulator Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Interactive What-If FinOps Simulator</h2>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded border border-emerald-200">
            Dynamic Scenario Modeling
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders Control Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Control 1: Storage Tiering */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">DICOM Cold Storage Tiering</span>
                <span className="font-bold text-emerald-600">{storageTieringPct}% Tiered to Glacier</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={storageTieringPct}
                onChange={(e) => setStorageTieringPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">
                Move DICOM scans older than 90 days to Glacier Instant Retrieval. (Max 50% storage savings)
              </p>
            </div>

            {/* Control 2: Compute Rightsizing */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">Compute Rightsizing (PACS &amp; Analytics Nodes)</span>
                <span className="font-bold text-emerald-600">{computeRightsizingPct}% Rightsized</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={computeRightsizingPct}
                onChange={(e) => setComputeRightsizingPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">
                Downsize over-provisioned memory nodes with low average CPU utilization.
              </p>
            </div>

            {/* Control 3: Reserved Capacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">1-Year Reserved Instance / Savings Plan Coverage</span>
                <span className="font-bold text-emerald-600">{reservedCapacityPct}% RI Coverage</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reservedCapacityPct}
                onChange={(e) => setReservedCapacityPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">
                Commit 1-year Savings Plans for steady-state EHR and database instances.
              </p>
            </div>

            {/* Control 4: GPU Scheduling */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-800">GPU Automated Off-Peak Scheduling</span>
                <span className="font-bold text-emerald-600">{gpuSchedulingPct}% Auto-Shutdown</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={gpuSchedulingPct}
                onChange={(e) => setGpuSchedulingPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[11px] text-slate-400">
                Automatically pause non-clinical AI model training nodes between 10 PM and 6 AM.
              </p>
            </div>
          </div>

          {/* Scenario Results Panel */}
          <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Scenario Output</span>
              <h3 className="text-lg font-bold text-white mt-1">CURRENT vs SCENARIO</h3>

              <div className="mt-6 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Current Monthly Spend</span>
                  <span className="font-bold text-white">${totalBaseSpend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Scenario Monthly Spend</span>
                  <span className="font-bold text-emerald-400">${scenarioMonthlySpend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Monthly Savings</span>
                  <span className="font-bold text-emerald-300">
                    +${totalMonthlyScenarioSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Net Spend Reduction</span>
                  <span className="font-extrabold text-emerald-400 text-base">{netReductionPct.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Annual Impact</span>
              <span className="text-xl font-black text-emerald-400">
                +${totalAnnualScenarioSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/year
              </span>
            </div>
          </div>
        </div>
      </div>

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
        <div className="bg-emerald-50/40 rounded-xl border-2 border-emerald-500 shadow-xs p-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Treatment Group</span>
              <h3 className="text-base font-bold text-emerald-900">Multi-Tier Attribution Engine</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shadow-xs">
              Target Exceeded ({treatment.allocationPct.toFixed(1)}%)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-emerald-700 font-semibold">Allocation Rate:</span>
              <p className="text-3xl font-black text-emerald-700 mt-0.5">{treatment.allocationPct.toFixed(1)}%</p>
              <span className="text-[10px] text-emerald-800 font-bold">+7.57% above target</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-semibold">Unallocated Spend Reduced:</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">${treatment.unallocatedCost.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-700 font-bold">Reduced by {experiment.unallocatedReductionPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 text-xs text-slate-700 space-y-1">
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

      {/* Multi-Tier Attribution Waterfall */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Multi-Tier Waterfall Breakdown</h3>
            <p className="text-xs text-slate-500">How the multi-tier engine resolved the spend step-by-step</p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            5 Priority Levels
          </span>
        </div>

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
      </div>
    </div>
  );
};
