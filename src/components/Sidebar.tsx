import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Building2,
  Package,
  Calculator,
  ShieldCheck,
  FlaskConical,
  GitPullRequest,
  History,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  Lock,
} from 'lucide-react';
import { DemoRole } from '../types/index.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: DemoRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'ANY' },
    { id: 'cost-allocation', label: 'Cost Allocation', icon: PieChart, minRole: 'ANY' },
    { id: 'business-units', label: 'Business Units', icon: Building2, minRole: 'ANY' },
    { id: 'products', label: 'Products & Features', icon: Package, minRole: 'ANY' },
    { id: 'unit-economics', label: 'Unit Economics', icon: Calculator, minRole: 'ANY' },
    { id: 'data-quality', label: 'Data Quality & Freshness', icon: ShieldCheck, minRole: 'ANY' },
    { id: 'experiment', label: 'FinOps Experiment', icon: FlaskConical, minRole: 'ANY' },
    { id: 'change-review', label: 'Change Review & Rollback', icon: GitPullRequest, minRole: 'ANY' },
    { id: 'audit', label: 'Audit Trail', icon: History, minRole: 'ANY' },
    { id: 'edge-cases', label: 'Failure / Edge Cases', icon: AlertTriangle, minRole: 'ANY' },
    { id: 'documentation', label: 'Documentation', icon: BookOpen, minRole: 'ANY' },
    { id: 'evaluation', label: 'Evaluation Checklist', icon: CheckSquare, minRole: 'ANY' },
    { id: 'privacy', label: 'Privacy & Governance', icon: Lock, minRole: 'ANY' },
  ];

  return (
    <aside id="sidebar-nav" className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
            HC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Hospital Cloud</h1>
            <p className="text-xs text-teal-400 font-medium tracking-wide">Cost Intelligence</p>
          </div>
        </div>
        <div className="mt-3 px-2.5 py-1 bg-slate-800/80 rounded-md text-[11px] text-slate-400 flex items-center justify-between border border-slate-700/60">
          <span>Target Rate:</span>
          <span className="font-semibold text-emerald-400">85.0% BU Attributed</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'change-review' && (
                <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  Rollback
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Profile Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
            {currentRole === DemoRole.Executive
              ? 'EX'
              : currentRole === DemoRole.FinOpsAnalyst
              ? 'FO'
              : 'PO'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">
              {currentRole === DemoRole.Executive
                ? 'Chief Financial Officer'
                : currentRole === DemoRole.FinOpsAnalyst
                ? 'Lead FinOps Engineer'
                : 'PACS Product Owner'}
            </p>
            <p className="text-[10px] text-slate-400 truncate capitalize">
              Role: {currentRole.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
