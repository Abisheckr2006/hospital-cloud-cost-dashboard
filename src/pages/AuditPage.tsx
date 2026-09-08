import React, { useState, useEffect } from 'react';
import { History, Shield, CheckCircle2, RotateCcw, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { AuditLogItem } from '../types/index.js';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAuditLogs()
      .then((items) => setLogs(items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const actionBadge = (action: string) => {
    if (action.includes('ROLLBACK')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <RotateCcw className="w-3 h-3" />
          <span>{action}</span>
        </span>
      );
    }
    if (action.includes('APPROVED')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
          <CheckCircle2 className="w-3 h-3" />
          <span>{action}</span>
        </span>
      );
    }
    if (action.includes('REJECTED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700">
        {action}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">FinOps Immutable Audit Trail</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Cryptographic provenance and complete change log for all financial reallocations and rollbacks.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Audit Events ({logs.length})</span>
          <span className="text-xs text-slate-500">Append-only compliance ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Audit ID / Time</th>
                <th className="p-3 font-semibold">Actor</th>
                <th className="p-3 font-semibold">Action</th>
                <th className="p-3 font-semibold">Target Object</th>
                <th className="p-3 font-semibold">Old State &rarr; New State</th>
                <th className="p-3 font-semibold text-right">Spend Impact</th>
                <th className="p-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Reading audit logs from SQLite...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-mono text-[11px] font-bold text-teal-700">{log.audit_id}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{log.user}</div>
                      <div className="text-[10px] text-slate-400">{log.role}</div>
                    </td>
                    <td className="p-3">{actionBadge(log.action)}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-700">
                      {log.object_type}: {log.object_id}
                    </td>
                    <td className="p-3 max-w-[220px]">
                      <div className="text-[11px] text-slate-400 line-through truncate" title={log.old_value}>
                        {log.old_value}
                      </div>
                      <div className="text-[11px] font-medium text-slate-800 truncate" title={log.new_value}>
                        &rarr; {log.new_value}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 text-right whitespace-nowrap">
                      ${log.impact_amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate" title={log.reason}>
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
