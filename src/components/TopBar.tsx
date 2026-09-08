import React from 'react';
import { DemoRole } from '../types/index.js';
import { Shield, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TopBarProps {
  currentRole: DemoRole;
  setCurrentRole: (role: DemoRole) => void;
  freshnessStatus: 'FRESH' | 'STALE' | 'MISSING';
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  setCurrentRole,
  freshnessStatus,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header id="topbar" className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div>
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Hospital Cloud Cost Intelligence
          </h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Multi-Account MVP
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Unit Economics &amp; Cost Attribution Engine &bull; Images, Logs, Backups &amp; Workloads
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Data Freshness Indicator */}
        <div
          id="freshness-indicator"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            freshnessStatus === 'FRESH'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : freshnessStatus === 'STALE'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title="Freshness Status monitored across telemetry and billing feeds"
        >
          {freshnessStatus === 'FRESH' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          {freshnessStatus === 'STALE' && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
          {freshnessStatus === 'MISSING' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span>Data Feed: {freshnessStatus}</span>
        </div>

        {/* Demo Role Selector (Explicitly labeled as Demo Role) */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Shield className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Demo Role Selector
            </span>
            <select
              id="role-selector"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as DemoRole)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value={DemoRole.Executive}>Executive (CFO / Director)</option>
              <option value={DemoRole.FinOpsAnalyst}>FinOps Analyst (Admin / Reviewer)</option>
              <option value={DemoRole.ProductOwner}>Product Owner (PACS / Portal)</option>
            </select>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="btn-refresh-data"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
          title="Re-fetch live dataset from SQLite"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
