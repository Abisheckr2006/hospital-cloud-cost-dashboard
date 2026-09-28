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
  PiggyBank,
  Cloud,
} from 'lucide-react';
import { DemoRole } from '../types/index.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: DemoRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'cost-allocation', label: 'Cost Allocation', icon: PieChart },
    { id: 'cost-optimization', label: 'Cost Optimization', icon: PiggyBank, badge: 'SAVE' },
    { id: 'business-units', label: 'Business Units', icon: Building2 },
    { id: 'products', label: 'Products & Features', icon: Package },
    { id: 'unit-economics', label: 'Unit Economics', icon: Calculator },
    { id: 'cloud-accounts', label: 'Cloud Accounts', icon: Cloud },
    { id: 'data-quality', label: 'Data Quality & Freshness', icon: ShieldCheck },
    { id: 'experiment', label: 'FinOps Experiment', icon: FlaskConical },
    { id: 'change-review', label: 'Change Review & Rollback', icon: GitPullRequest },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'edge-cases', label: 'Failure / Edge Cases', icon: AlertTriangle },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
    { id: 'evaluation', label: 'Evaluation Checklist', icon: CheckSquare },
    { id: 'privacy', label: 'Privacy & Governance', icon: Lock },
  ];

  const roleTitle =
    currentRole === DemoRole.Executive
      ? 'Chief Financial Officer'
      : currentRole === DemoRole.FinOpsAnalyst
      ? 'Lead FinOps Manager'
      : currentRole === DemoRole.ProductOwner
      ? 'Business Unit Owner'
      : currentRole === DemoRole.CloudEngineer
      ? 'Principal Cloud Infrastructure Engineer'
      : 'Compliance & Audit Lead';

  const roleInitials =
    currentRole === DemoRole.Executive
      ? 'CFO'
      : currentRole === DemoRole.FinOpsAnalyst
      ? 'FO'
      : currentRole === DemoRole.ProductOwner
      ? 'BU'
      : currentRole === DemoRole.CloudEngineer
      ? 'ENG'
      : 'AUD';

  return (
    <aside id="sidebar-nav" className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            HC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">Hospital Cloud</h1>
            <p className="text-xs text-emerald-400 font-medium tracking-wide">Cost Intelligence</p>
          </div>
        </div>
        <div className="mt-3 px-2.5 py-1 bg-slate-800/80 rounded-md text-[11px] text-slate-400 flex items-center justify-between border border-slate-700/60">
          <span>Attribution Target:</span>
          <span className="font-semibold text-emerald-400">85.0% Target</span>
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
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Profile Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-700 shrink-0">
            {roleInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{roleTitle}</p>
            <p className="text-[10px] text-slate-400 truncate capitalize">
              Role: {currentRole.toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
