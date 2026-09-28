import React, { useState, useEffect } from 'react';
import { History, Shield, CheckCircle2, RotateCcw, FileText, Search } from 'lucide-react';
import { api } from '../services/api.js';
import { AuditLogItem } from '../types/index.js';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          <span>{action}</span>
        </span>
      );
    }
    if (action.includes('REJECTED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  const filteredLogs = searchTerm.trim()
    ? logs.filter(
        (log) =>
          log.audit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.object_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FinOps Immutable Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Cryptographic provenance, timestamped user actions, and full change logs for all financial reallocations.
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit ID, actor, action, or reason..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Audit Events ({filteredLogs.length})</span>
          <span className="text-xs text-slate-500 font-medium">Append-only compliance ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Audit ID / Time</th>
                <th className="p-3 font-semibold">Actor &amp; Role</th>
                <th className="p-3 font-semibold">Action</th>
                <th className="p-3 font-semibold">Target Object</th>
                <th className="p-3 font-semibold">Before &rarr; After</th>
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
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No audit records match "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-mono text-[11px] font-bold text-emerald-700">{log.audit_id}</div>
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
