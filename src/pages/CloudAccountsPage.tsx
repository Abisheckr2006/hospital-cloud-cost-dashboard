import React, { useState, useEffect } from 'react';
import { Cloud, Server, ShieldCheck, AlertTriangle, CheckCircle2, Building, ExternalLink } from 'lucide-react';
import { api } from '../services/api.js';
import { CloudAccount } from '../types/index.js';

export const CloudAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [filterEnv, setFilterEnv] = useState('ALL');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getCloudAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching cloud accounts:', err);
      }
    };
    fetchAccounts();
  }, []);

  const filteredAccounts = filterEnv === 'ALL'
    ? accounts
    : accounts.filter((a) => a.environment.toLowerCase().includes(filterEnv.toLowerCase()));

  const totalCloudSpend = accounts.reduce((acc, a) => acc + a.total_spend, 0);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cloud className="w-7 h-7 text-emerald-600" />
            Cloud Accounts &amp; Multi-Cloud Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise AWS, Azure, and GCP multi-account cost attribution, resource counts, and attribution health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="ALL">All Environments</option>
            <option value="Production">Production Clinical</option>
            <option value="Disaster Recovery">Disaster Recovery Archive</option>
          </select>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Multi-Account Overview</div>
          <div className="text-2xl font-extrabold tracking-tight">
            ${totalCloudSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total Portfolio Spend
          </div>
          <p className="text-xs text-slate-400">
            Monitored across 3 active cloud billing subscriptions spanning 2,370 infrastructure resources.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-xs text-slate-400">AWS Attribution</div>
            <div className="text-lg font-bold text-emerald-400">93.1% Rate</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">GCP Attribution</div>
            <div className="text-lg font-bold text-amber-400">79.5% Rate</div>
          </div>
        </div>
      </div>

      {/* Cloud Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => {
          const isHealthy = account.status === 'HEALTHY';
          const isWarning = account.status === 'WARNING';
          return (
            <div
              key={account.account_id}
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
            >
              <div>
                {/* Provider Badge & Health */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {account.provider} • {account.account_id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isHealthy
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {isHealthy && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isWarning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {!isHealthy && !isWarning && <AlertTriangle className="w-3 h-3 text-red-600" />}
                    {account.status}
                  </span>
                </div>

                {/* Account Name */}
                <h3 className="text-lg font-bold text-slate-900 mt-4 tracking-tight">{account.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{account.environment} Account</p>

                {/* Metrics */}
                <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Monthly Cloud Spend</span>
                    <span className="font-bold text-slate-900">${account.total_spend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Allocated Spend</span>
                    <span className="font-semibold text-emerald-600">${account.allocated_spend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Unallocated Spend</span>
                    <span className="font-semibold text-amber-600">${account.unallocated_spend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Active Resources</span>
                    <span className="font-semibold text-slate-800">{account.resource_count} resources</span>
                  </div>
                </div>

                {/* Progress Bar for Allocation Rate */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Attribution Coverage</span>
                    <span className="font-bold text-slate-800">{account.allocation_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        account.allocation_rate >= 90
                          ? 'bg-emerald-500'
                          : account.allocation_rate >= 80
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${account.allocation_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer">
                  View Account Cost Drivers <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
