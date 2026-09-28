import React from 'react';
import { DemoRole, GlobalFilters } from '../types/index.js';
import { Shield, RefreshCw, AlertCircle, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter.js';

interface TopBarProps {
  currentRole: DemoRole;
  setCurrentRole: (role: DemoRole) => void;
  freshnessStatus: 'FRESH' | 'STALE' | 'MISSING';
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenSearch: () => void;
  onNavigateTab: (tab: string) => void;
  globalFilters: GlobalFilters;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  setCurrentRole,
  freshnessStatus,
  onRefresh,
  isRefreshing,
  onOpenSearch,
  onNavigateTab,
  globalFilters,
  setGlobalFilters,
}) => {
  return (
    <header id="topbar" className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Title & Metadata */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hospital Cloud Cost Intelligence
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Enterprise FinOps
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Unit Economics &amp; Cost Attribution Platform &bull; Medical Imaging, EHR, Labs &amp; Analytics
          </p>
        </div>

        {/* Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search resources, BUs, products...</span>
          <kbd className="bg-white text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200 ml-2">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Global Filter Bar Pill */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={globalFilters.bu}
            onChange={(e) => setGlobalFilters((prev) => ({ ...prev, bu: e.target.value }))}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Business Units</option>
            <option value="Medical Imaging">Medical Imaging</option>
            <option value="Laboratory Services">Laboratory Services</option>
            <option value="Patient Management">Patient Management</option>
            <option value="Analytics & Research">Analytics &amp; Research</option>
          </select>

          <span className="text-slate-300">|</span>

          <select
            value={globalFilters.dateRange}
            onChange={(e) => setGlobalFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Billing Dates</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-03">March 2026</option>
          </select>
        </div>

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

        {/* Notification Center */}
        <NotificationCenter onNavigateTab={onNavigateTab} />

        {/* Demo Role Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
          <Shield className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Demo Role Selector
            </span>
            <select
              id="role-selector"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as DemoRole)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value={DemoRole.Executive}>CFO / Director</option>
              <option value={DemoRole.FinOpsAnalyst}>FinOps Manager</option>
              <option value={DemoRole.ProductOwner}>Business Unit Manager</option>
              <option value={DemoRole.CloudEngineer}>Cloud Engineer</option>
              <option value={DemoRole.Auditor}>Compliance Auditor</option>
            </select>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="btn-refresh-data"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
          title="Re-fetch live dataset from SQLite"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
