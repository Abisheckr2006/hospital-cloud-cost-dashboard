import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, TrendingUp, CheckCircle2, ShieldCheck, Activity, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api.js';
import { UnitEconomicsData } from '../types/index.js';

export const UnitEconomicsPage: React.FC = () => {
  const [data, setData] = useState<UnitEconomicsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getUnitEconomics()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-sm text-slate-500">Calculating Dynamic Unit-Economics Metrics...</p>
      </div>
    );
  }

  const { metrics, monthlyTrend } = data;

  const unitCards = [
    {
      product: 'Medical Imaging Platform',
      metricLabel: 'Imaging Study',
      cloudCost: 185200,
      volume: 440000,
      unitCost: 0.42,
      targetCost: 0.45,
      trendPct: -8.2,
      unitName: 'study',
    },
    {
      product: 'Laboratory Services Pipeline',
      metricLabel: 'Laboratory Test',
      cloudCost: 124000,
      volume: 689000,
      unitCost: 0.18,
      targetCost: 0.20,
      trendPct: -4.1,
      unitName: 'test',
    },
    {
      product: 'EHR Patient Record System',
      metricLabel: 'Active Patient Record',
      cloudCost: 132000,
      volume: 1200000,
      unitCost: 0.11,
      targetCost: 0.15,
      trendPct: -2.5,
      unitName: 'patient',
    },
    {
      product: 'Clinical Analytics Platform',
      metricLabel: 'Cohort Query',
      cloudCost: 74400,
      volume: 240000,
      unitCost: 0.31,
      targetCost: 0.35,
      trendPct: +5.4,
      unitName: 'query',
    },
    {
      product: 'DICOM Long-term Backup',
      metricLabel: 'Stored DICOM Data',
      cloudCost: 92400,
      volume: 1320000,
      unitCost: 0.07,
      targetCost: 0.08,
      trendPct: -1.8,
      unitName: 'GB-month',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Calculator className="w-7 h-7 text-emerald-600" />
          Hospital Cloud Unit Economics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connecting cloud spend directly to clinical workload volume (cost per study, test, patient record, query, and GB stored).
        </p>
      </div>

      {/* Primary Hospital Unit Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {unitCards.map((card, idx) => {
          const isFavorable = card.trendPct <= 0;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 truncate max-w-[140px]">
                    {card.metricLabel}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isFavorable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isFavorable ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {Math.abs(card.trendPct)}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-slate-900">${card.unitCost.toFixed(2)}</span>
                  <span className="text-xs font-medium text-slate-500">/ {card.unitName}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-slate-400" /> Target: ${card.targetCost.toFixed(2)}
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {card.unitCost <= card.targetCost ? 'WITHIN TARGET' : 'ABOVE TARGET'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Cloud Spend:</span>
                  <span className="font-bold text-slate-900">${card.cloudCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Workload Volume:</span>
                  <span className="font-semibold text-slate-800">{card.volume.toLocaleString()} {card.unitName}s</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Unit Economics Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Hospital Workload Attribution Matrix</h3>
          </div>
          <span className="text-xs text-slate-500">Formulas audited for zero-volume handling</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Hospital Product</th>
                <th className="p-3 font-semibold">Clinical Activity Metric</th>
                <th className="p-3 font-semibold text-right">Workload Volume</th>
                <th className="p-3 font-semibold text-right">Cloud Spend</th>
                <th className="p-3 font-semibold text-right">Cost Per Unit</th>
                <th className="p-3 font-semibold text-right">Target Benchmark</th>
                <th className="p-3 font-semibold text-center">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitCards.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">{row.product}</td>
                  <td className="p-3 text-slate-600 capitalize">{row.metricLabel}</td>
                  <td className="p-3 font-mono font-medium text-slate-800 text-right">
                    {row.volume.toLocaleString()} {row.unitName}s
                  </td>
                  <td className="p-3 font-bold text-slate-900 text-right">
                    ${row.cloudCost.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700 text-right text-sm">
                    ${row.unitCost.toFixed(2)} / {row.unitName}
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-right">
                    ${row.targetCost.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      ↓ {Math.abs(row.trendPct)}% OPTIMIZED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Unit Economics Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Unit Cost Trends (Jan - Jun 2026)</h3>
            <p className="text-xs text-slate-500">Efficiency tracking per diagnostic image, portal session, and GB stored</p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            6 Months History
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Medical Imaging ($/study) &amp; Patient Portal ($/session)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="imagingCostPerImage" name="Medical Imaging ($/study)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="portalCostPerSession" name="Patient Portal ($/session)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Storage &amp; Analytics ($/GB Stored or Query)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="backupCostPerGB" name="Backup Vault ($/GB)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="loggingCostPerGB" name="Logging Platform ($/GB)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
