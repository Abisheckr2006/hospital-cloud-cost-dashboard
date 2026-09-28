import React, { useState, useEffect } from 'react';
import { Package, Layers, DollarSign, CheckCircle2, ArrowRight, Calculator, PiggyBank } from 'lucide-react';
import { api } from '../services/api.js';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading Product Catalog &amp; Features...</p>
      </div>
    );
  }

  // Metadata mappings for unit economics & savings
  const productMeta: Record<string, { unitCost: string; allocation: string; savings: string }> = {
    'Medical Imaging Platform': { unitCost: '$0.42 / study', allocation: '96.1%', savings: '$8,420/mo' },
    'Patient Portal': { unitCost: '$0.18 / session', allocation: '98.4%', savings: '$3,100/mo' },
    'Clinical Analytics Platform': { unitCost: '$0.31 / query', allocation: '88.2%', savings: '$3,200/mo' },
    'Backup & Recovery': { unitCost: '$0.07 / GB', allocation: '79.5%', savings: '$8,200/mo' },
    'Hospital Logging Platform': { unitCost: '$0.05 / GB', allocation: '91.2%', savings: '$2,100/mo' },
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Package className="w-7 h-7 text-emerald-600" />
          Products &amp; Feature Cost Attribution
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Granular cost allocation mapped down to micro-features, clinical unit metrics, and workload coverage.
        </p>
      </div>

      <div className="space-y-6">
        {products.map((prod, idx) => {
          const meta = productMeta[prod.name] || { unitCost: '$0.15 / unit', allocation: '92.0%', savings: '$2,500/mo' };
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">{prod.name}</h3>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {prod.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Division: <strong className="text-emerald-700">{prod.business_unit}</strong> &bull; {prod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 shrink-0">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Unit Cost</span>
                    <span className="text-sm font-bold text-emerald-600">{meta.unitCost}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Allocation</span>
                    <span className="text-sm font-bold text-slate-800">{meta.allocation}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase block">Monthly Spend</span>
                    <span className="text-xl font-extrabold text-slate-900">${prod.total_cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Features list breakdown */}
              <div className="mt-5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Underlying Feature Allocations ({prod.features?.length || 0})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {prod.features &&
                    prod.features.map((feat: any, fIdx: number) => {
                      const featShare = prod.total_cost > 0 ? ((feat.cost / prod.total_cost) * 100).toFixed(1) : 0;
                      return (
                        <div key={fIdx} className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-800 truncate" title={feat.name}>
                              {feat.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{feat.code}</span>
                          </div>
                          <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="text-sm font-bold text-emerald-700">${feat.cost.toLocaleString()}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{featShare}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
