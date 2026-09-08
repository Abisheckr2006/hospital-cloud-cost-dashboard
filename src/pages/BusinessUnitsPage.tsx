import React, { useState, useEffect } from 'react';
import { Building2, User, CheckCircle2, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { api } from '../services/api.js';

export const BusinessUnitsPage: React.FC<{ onSelectBU?: (bu: string) => void }> = ({ onSelectBU }) => {
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getBusinessUnits()
      .then((data) => setBusinessUnits(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Business Unit Financials...</p>
      </div>
    );
  }

  const totalOrgCost = businessUnits.reduce((acc, bu) => acc + (bu.total_cost || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Unit Spend Accountability</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Accountable clinical and operational divisions with total allocated cloud budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businessUnits.map((bu, idx) => {
          const share = totalOrgCost > 0 ? ((bu.total_cost / totalOrgCost) * 100).toFixed(1) : '0';
          const isUnallocated = bu.name === 'Unallocated';

          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                isUnallocated ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isUnallocated ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{bu.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">{bu.code}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isUnallocated ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {share}% of spend
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {bu.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Accountable Manager:</span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{bu.lead_manager}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attributed Cloud Spend:</span>
                    <span className="text-base font-black text-slate-900">
                      ${(bu.total_cost || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Products Supported:</span>
                    <span className="font-bold text-teal-700">{bu.product_count} products</span>
                  </div>
                </div>
              </div>

              {onSelectBU && (
                <button
                  onClick={() => onSelectBU(bu.name)}
                  className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <span>Inspect Cost Breakdown</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
