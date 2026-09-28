import React, { useState, useEffect } from 'react';
import { Building2, User, CheckCircle2, AlertCircle, ArrowUpRight, DollarSign, Target, PiggyBank, X } from 'lucide-react';
import { api } from '../services/api.js';

interface BusinessUnitsPageProps {
  onSelectBU?: (bu: string) => void;
}

export const BusinessUnitsPage: React.FC<BusinessUnitsPageProps> = ({ onSelectBU }) => {
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBUDetail, setSelectedBUDetail] = useState<any | null>(null);

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

  // Mock enterprise budgets & savings for business units
  const buMetaData: Record<string, { budget: number; savings: number }> = {
    'Medical Imaging': { budget: 200000, savings: 8420 },
    'Laboratory Services': { budget: 140000, savings: 5200 },
    'Patient Management': { budget: 150000, savings: 8200 },
    'Analytics & Research': { budget: 100000, savings: 3200 },
    'Corporate IT': { budget: 120000, savings: 13400 },
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building2 className="w-7 h-7 text-emerald-600" />
          Business Unit Spend Accountability
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Clinical and operational divisions, budget utilization, allocation coverage rates, and savings targets.
        </p>
      </div>

      {/* Grid of Business Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessUnits.map((bu, idx) => {
          const share = totalOrgCost > 0 ? ((bu.total_cost / totalOrgCost) * 100).toFixed(1) : '0';
          const isUnallocated = bu.name === 'Unallocated';
          const meta = buMetaData[bu.name] || { budget: 150000, savings: 4000 };
          const budgetUtil = meta.budget > 0 ? ((bu.total_cost / meta.budget) * 100).toFixed(1) : '0';

          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-6 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                isUnallocated ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isUnallocated ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{bu.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">{bu.code || 'BU-CODE'}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isUnallocated ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {share}% of Total Spend
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2">
                  {bu.description || 'Clinical division responsible for hospital cloud workloads.'}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lead Manager:</span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bu.lead_manager || 'Lead Officer'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Cloud Spend:</span>
                    <span className="text-base font-black text-slate-900">${(bu.total_cost || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Allocation Rate:</span>
                    <span className="font-bold text-emerald-600">
                      {bu.allocation_rate ? `${bu.allocation_rate}%` : '94.2%'}
                    </span>
                  </div>

                  {!isUnallocated && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Monthly Budget:</span>
                        <span className="font-semibold text-slate-800">${meta.budget.toLocaleString()}</span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Budget Utilization</span>
                          <span className="font-bold text-slate-800">{budgetUtil}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              Number(budgetUtil) > 100 ? 'bg-red-500' : Number(budgetUtil) > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Number(budgetUtil))}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedBUDetail({ ...bu, meta })}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
                >
                  <span>Detailed View</span>
                </button>
                {onSelectBU && (
                  <button
                    onClick={() => onSelectBU(bu.name)}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    <span>Allocations →</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BU Detailed Modal */}
      {selectedBUDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{selectedBUDetail.name} Overview</h3>
              </div>
              <button onClick={() => setSelectedBUDetail(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">{selectedBUDetail.description}</p>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Total Spend</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    ${(selectedBUDetail.total_cost || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Budget</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    ${(selectedBUDetail.meta?.budget || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Allocated Rate</span>
                  <div className="text-sm font-bold text-emerald-600 mt-1">
                    {selectedBUDetail.allocation_rate || 94.2}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Potential Savings</span>
                  <div className="text-sm font-bold text-emerald-600 mt-1">
                    ${(selectedBUDetail.meta?.savings || 0).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedBUDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
