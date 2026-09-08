import React, { useState, useEffect } from 'react';
import { Package, Layers, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Products &amp; Feature Cost Attribution</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Granular cost allocation mapped down to micro-features and operational capabilities.
        </p>
      </div>

      <div className="space-y-4">
        {products.map((prod, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">{prod.name}</h3>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {prod.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Owned by: <strong className="text-teal-700">{prod.business_unit}</strong> &bull; {prod.description}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Product Spend:</span>
                <span className="text-xl font-black text-slate-900">${prod.total_cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Features list breakdown */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Underlying Features ({prod.features?.length || 0})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {prod.features && prod.features.map((feat: any, fIdx: number) => {
                  const featShare = prod.total_cost > 0 ? ((feat.cost / prod.total_cost) * 100).toFixed(1) : 0;
                  return (
                    <div key={fIdx} className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800 truncate" title={feat.name}>
                          {feat.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{feat.code}</span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-sm font-bold text-teal-700">${feat.cost.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{featShare}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
