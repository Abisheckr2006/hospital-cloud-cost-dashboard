import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, HelpCircle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Cloud Unit Economics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Connecting cloud spend directly to clinical workload activity volume and operational throughput.
        </p>
      </div>

      {/* Unit Economics Formula Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block truncate" title={m.product}>
                {m.product}
              </span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-black text-slate-900">${m.cost_per_unit.toFixed(4)}</span>
                <span className="text-[11px] text-slate-500">/ {m.unit_name}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 capitalize">{m.activity_type}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="font-semibold text-slate-800">${m.cloud_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Volume:</span>
                <span className="font-semibold text-slate-800">{m.activity_volume.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Dynamic Activity Cost Attribution</h3>
          </div>
          <span className="text-xs text-slate-500">Formulas audited for safe non-zero division</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Hospital Product</th>
                <th className="p-3 font-semibold">Primary Activity Metric</th>
                <th className="p-3 font-semibold text-right">Activity Volume</th>
                <th className="p-3 font-semibold text-right">Attributed Cloud Spend</th>
                <th className="p-3 font-semibold text-right">Cost Per Unit</th>
                <th className="p-3 font-semibold text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">{row.product}</td>
                  <td className="p-3 text-slate-600 capitalize">{row.activity_type} ({row.unit_name})</td>
                  <td className="p-3 font-mono font-medium text-slate-800 text-right">
                    {row.activity_volume > 0 ? (
                      row.activity_volume.toLocaleString()
                    ) : (
                      <span className="text-rose-600 font-bold">0 (Zero Activity Handled)</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-slate-900 text-right">
                    ${row.cloud_cost.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-700 text-right text-sm">
                    ${row.cost_per_unit.toFixed(4)} / {row.unit_name}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.allocation_confidence.includes('HIGH')
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.allocation_confidence.includes('MEDIUM')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {row.allocation_confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Unit Economics Trend Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Unit Cost Trends (Jan - Jun 2026)</h3>
            <p className="text-xs text-slate-500">Efficiency tracking per diagnostic image, portal session, and GB stored</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            6 Months History
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Medical Imaging ($/image) &amp; Patient Portal ($/session)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(3)}`} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(4)}`, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="imagingCostPerImage" name="Medical Imaging ($/image)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="portalCostPerSession" name="Patient Portal ($/session)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Storage &amp; Logging ($/GB Stored or Ingested)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(3)}`} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(4)}`, '']} />
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
