import React, { useState, useEffect } from 'react';
import { Search, X, Server, Building2, Package, AlertTriangle, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const mockIndex = [
    {
      id: 'res-analytics-db-003',
      title: 'res-analytics-db-003',
      subtitle: 'GPU Analytics Database Node • Cost: $1,053.18/day',
      category: 'Resource',
      icon: Server,
      tab: 'cost-allocation',
      badge: 'ANOMALY DETECTED',
      badgeColor: 'bg-red-100 text-red-700',
    },
    {
      id: 'bu-imaging',
      title: 'Medical Imaging',
      subtitle: 'Business Unit • Spend: $185,200/mo • 94.2% Allocated',
      category: 'Business Unit',
      icon: Building2,
      tab: 'business-units',
    },
    {
      id: 'prod-pacs',
      title: 'Enterprise PACS Platform',
      subtitle: 'Product • Spend: $185,200 • Unit Cost: $0.42/study',
      category: 'Product',
      icon: Package,
      tab: 'products',
    },
    {
      id: 'cr-demo-001',
      title: 'CR-DEMO-001',
      subtitle: 'Reallocate GPU database cost from Unallocated to Analytics',
      category: 'Change Request',
      icon: AlertTriangle,
      tab: 'change-review',
      badge: 'PENDING APPROVAL',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'res-pacs-node-014',
      title: 'res-pacs-node-014',
      subtitle: 'PACS Storage & Render Node • Spend: $18,450/mo',
      category: 'Resource',
      icon: Server,
      tab: 'cost-allocation',
    },
    {
      id: 'bu-lab',
      title: 'Laboratory Services',
      subtitle: 'Business Unit • Spend: $124,000/mo • Unit Cost: $0.18/test',
      category: 'Business Unit',
      icon: Building2,
      tab: 'business-units',
    },
  ];

  const results = searchTerm.trim()
    ? mockIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mockIndex;

  const handleSelect = (tab: string) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources, business units, products, change requests, anomalies..."
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-100 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching resources, business units, or records found for "{searchTerm}".
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.tab)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{item.title}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-emerald-600 font-medium">
                    <span>Jump to {item.category}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Enterprise Global FinOps Index</span>
          <span className="text-[11px] text-slate-400">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
