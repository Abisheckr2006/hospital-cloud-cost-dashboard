import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Clock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';

export const DataQualityPage: React.FC = () => {
  const [quality, setQuality] = useState<any>(null);
  const [freshness, setFreshness] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [q, f] = await Promise.all([api.getDataQuality(), api.getDataFreshness()]);
      setQuality(q);
      setFreshness(f);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !quality || !freshness) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-sm text-slate-500">Auditing Data Quality &amp; Freshness...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Quality &amp; Pipeline Freshness</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Continuous telemetry integrity, schema validation, and missing tag governance auditing.
        </p>
      </div>

      {/* Warning Banners for Missing Data & Stale Data */}
      <div className="space-y-3">
        {/* Missing Tag Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase">Missing Allocation Tags Warning</h4>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              15% of cloud infrastructure resources lack valid allocation tags in their raw billing records or Terraform state.
              This affects <strong>$53,858</strong> in cloud spend across storage buckets and orphan serverless functions.
            </p>
            <p className="text-[11px] font-semibold text-amber-900 mt-1">
              Recommended Action: Apply AWS Resource Tags (`bu`, `product`, `feature`) in IaC templates to enable Level 2 attribution.
            </p>
          </div>
        </div>

        {/* Stale Telemetry Warning */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
          <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-rose-900 uppercase">Stale Telemetry Pipeline Alert</h4>
              <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                Feed Delay &gt; 72 Hours
              </span>
            </div>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Usage telemetry for <strong>Clinical Analytics</strong> node cluster (ACCT-ANALYTICS) has an age of 96+ hours.
              Attribution for <strong>$4,250</strong> of shared compute spend has been downgraded to <strong>LOW CONFIDENCE</strong>.
            </p>
            <p className="text-[11px] font-semibold text-rose-900 mt-1">
              Impact: Automated usage-based allocation was computed but flagged with a data staleness penalty.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quality.reports.map((report: any, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{report.dataset}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  report.health_score >= 85
                    ? 'bg-emerald-100 text-emerald-800'
                    : report.health_score >= 70
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {report.health_score}% Health
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-mono font-semibold text-slate-900">{report.total_records}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Records:</span>
                  <span className="font-mono font-semibold text-emerald-600">{report.valid_records}</span>
                </div>
                {report.missing_records > 0 && (
                  <div className="flex justify-between">
                    <span>Missing Tags:</span>
                    <span className="font-mono font-bold text-amber-600">{report.missing_records}</span>
                  </div>
                )}
                {report.duplicate_records > 0 && (
                  <div className="flex justify-between">
                    <span>Duplicates:</span>
                    <span className="font-mono font-bold text-rose-600">{report.duplicate_records}</span>
                  </div>
                )}
                {report.stale_records > 0 && (
                  <div className="flex justify-between">
                    <span>Stale Records:</span>
                    <span className="font-mono font-bold text-rose-600">{report.stale_records}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px]">
              <span className="text-slate-400">Affected Spend:</span>
              <span className="font-bold text-slate-800">${report.affected_cost.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Freshness Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Ingestion Feed Freshness Matrix</h3>
          </div>
          <span className="text-xs text-slate-500">Threshold: Fresh &lt; 24h &bull; Stale 24-72h &bull; Missing &gt; 72h</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Dataset Feed</th>
                <th className="p-3 font-semibold">Last Updated</th>
                <th className="p-3 font-semibold">Pipeline Age</th>
                <th className="p-3 font-semibold text-center">Status</th>
                <th className="p-3 font-semibold text-right">Affected Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {freshness.items.map((feed: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900">{feed.dataset}</td>
                  <td className="p-3 font-mono text-slate-600">{feed.last_updated}</td>
                  <td className="p-3 font-semibold text-slate-700">{feed.age_hours} hours</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      feed.status === 'FRESH'
                        ? 'bg-emerald-100 text-emerald-800'
                        : feed.status === 'STALE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {feed.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    ${feed.affected_cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Errors Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Data Validation Errors Log ({quality.validationErrors.length})</h3>
          </div>
          <span className="text-xs text-slate-500">Every rejected record retains auditable failure provenance</span>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-3 font-semibold">Record / Resource ID</th>
                <th className="p-3 font-semibold">Source Table</th>
                <th className="p-3 font-semibold">Issue Type</th>
                <th className="p-3 font-semibold">Reason</th>
                <th className="p-3 font-semibold text-right">Cost Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quality.validationErrors.slice(0, 50).map((err: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono font-medium text-slate-800">{err.record_id}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{err.source}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {err.issue_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{err.reason}</td>
                  <td className="p-3 font-bold text-slate-900 text-right">
                    ${(err.affected_cost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
