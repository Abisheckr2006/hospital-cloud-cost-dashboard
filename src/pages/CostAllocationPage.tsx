import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, ChevronLeft, ChevronRight, Layers, HelpCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { AllocationItem, EvidenceDetail } from '../types/index.js';
import { EvidenceModal } from '../components/EvidenceModal.js';

export const CostAllocationPage: React.FC = () => {
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 25;

  // Filters
  const [bu, setBu] = useState<string>('All');
  const [product, setProduct] = useState<string>('All');
  const [method, setMethod] = useState<string>('All');
  const [confidence, setConfidence] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Drill-down breadcrumb path
  const [drillBu, setDrillBu] = useState<string | null>(null);
  const [drillProduct, setDrillProduct] = useState<string | null>(null);
  const [drillResource, setDrillResource] = useState<string | null>(null);

  // Evidence Modal state
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDetail | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const effectiveBu = drillBu || (bu !== 'All' ? bu : undefined);
      const effectiveProduct = drillProduct || (product !== 'All' ? product : undefined);
      const effectiveSearch = drillResource || (searchTerm ? searchTerm : undefined);

      const res = await api.getAllocations({
        bu: effectiveBu,
        product: effectiveProduct,
        method: method !== 'All' ? method : undefined,
        confidence: confidence !== 'All' ? confidence : undefined,
        status: status !== 'All' ? status : undefined,
        search: effectiveSearch,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      setAllocations(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Error loading allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [page, bu, product, method, confidence, status, searchTerm, drillBu, drillProduct, drillResource]);

  const handleInspectEvidence = async (allocId: string | number) => {
    try {
      setLoadingEvidence(true);
      const detail = await api.getEvidence(allocId);
      setSelectedEvidence(detail);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const confidenceTag = (conf: string) => {
    if (conf === 'HIGH') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">HIGH</span>;
    if (conf === 'MEDIUM') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">MEDIUM</span>;
    if (conf === 'LOW') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">LOW</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">NONE</span>;
  };

  const methodTag = (m: string) => {
    if (m === 'DIRECT') return <span className="text-[11px] font-medium text-emerald-700">Level 1 &bull; Direct</span>;
    if (m === 'RESOURCE_TAG') return <span className="text-[11px] font-medium text-indigo-700">Level 2 &bull; Tag</span>;
    if (m === 'USAGE_BASED') return <span className="text-[11px] font-medium text-teal-700">Level 3 &bull; Telemetry</span>;
    if (m === 'ACTIVITY_BASED') return <span className="text-[11px] font-medium text-cyan-700">Level 4 &bull; Activity</span>;
    return <span className="text-[11px] font-medium text-rose-700">Level 5 &bull; Unallocated</span>;
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="p-8 space-y-6">
      {/* Header & Drill-down Breadcrumb */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cloud Cost Attribution &amp; Audit Records</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Line-item allocation provenance across cloud billing exports, tags, and operational telemetry.
        </p>

        {/* Drill-down breadcrumb */}
        <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Hierarchy Drill-Down:</span>
          <button
            onClick={() => {
              setDrillBu(null);
              setDrillProduct(null);
              setDrillResource(null);
            }}
            className="hover:text-teal-700 underline text-slate-800"
          >
            All Organization Spend
          </button>
          {drillBu && (
            <>
              <span>/</span>
              <button
                onClick={() => {
                  setDrillProduct(null);
                  setDrillResource(null);
                }}
                className="hover:text-teal-700 underline text-teal-700"
              >
                {drillBu}
              </button>
            </>
          )}
          {drillProduct && (
            <>
              <span>/</span>
              <button
                onClick={() => setDrillResource(null)}
                className="hover:text-teal-700 underline text-teal-700"
              >
                {drillProduct}
              </button>
            </>
          )}
          {drillResource && (
            <>
              <span>/</span>
              <span className="text-slate-900 font-mono font-bold">{drillResource}</span>
            </>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-allocations"
            type="text"
            placeholder="Search billing ID, resource ID, or reason..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Business Unit */}
        <select
          value={bu}
          onChange={(e) => {
            setBu(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="All">All Business Units</option>
          <option value="Radiology">Radiology</option>
          <option value="Emergency Services">Emergency Services</option>
          <option value="Clinical Analytics">Clinical Analytics</option>
          <option value="Patient Portal">Patient Portal</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Research">Research</option>
          <option value="Unallocated">Unallocated</option>
        </select>

        {/* Allocation Method */}
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="All">All Allocation Methods</option>
          <option value="DIRECT">Level 1: Direct</option>
          <option value="RESOURCE_TAG">Level 2: Resource Tag</option>
          <option value="USAGE_BASED">Level 3: Usage Telemetry</option>
          <option value="ACTIVITY_BASED">Level 4: Activity Volume</option>
          <option value="UNALLOCATED">Level 5: Unallocated</option>
        </select>

        {/* Confidence */}
        <select
          value={confidence}
          onChange={(e) => {
            setConfidence(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="All">All Confidence Levels</option>
          <option value="HIGH">High Confidence</option>
          <option value="MEDIUM">Medium Confidence</option>
          <option value="LOW">Low Confidence</option>
          <option value="NONE">No Confidence</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="ALLOCATED">Allocated</option>
          <option value="UNALLOCATED">Unallocated</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
        </select>

        <span className="text-xs text-slate-500 ml-auto font-medium">
          Showing {allocations.length} of {total} records
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="table-cost-allocations" className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Billing ID</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Account / Service</th>
                <th className="p-3 font-semibold">Resource ID</th>
                <th className="p-3 font-semibold text-right">Cost</th>
                <th className="p-3 font-semibold">Business Unit</th>
                <th className="p-3 font-semibold">Product &amp; Feature</th>
                <th className="p-3 font-semibold">Method</th>
                <th className="p-3 font-semibold">Confidence</th>
                <th className="p-3 font-semibold text-center">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Loading records from SQLite database...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No matching allocation records found for the applied filter.
                  </td>
                </tr>
              ) : (
                allocations.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-medium text-slate-800">{row.billing_id}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{row.billing_date}</td>
                    <td className="p-3">
                      <div className="font-mono text-[11px] text-slate-700">{row.cloud_account_id}</div>
                      <div className="text-[11px] text-slate-500">{row.service}</div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setDrillResource(row.resource_id);
                          setSearchTerm('');
                        }}
                        className="font-mono text-[11px] text-teal-700 hover:underline text-left block truncate max-w-[180px]"
                        title={row.resource_id}
                      >
                        {row.resource_id}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-slate-900 text-right whitespace-nowrap">
                      ${row.cost.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setDrillBu(row.business_unit)}
                        className={`font-semibold hover:underline ${
                          row.business_unit === 'Unallocated' ? 'text-rose-600' : 'text-teal-700'
                        }`}
                      >
                        {row.business_unit}
                      </button>
                    </td>
                    <td className="p-3 max-w-[180px]">
                      <button
                        onClick={() => setDrillProduct(row.product_id)}
                        className="font-medium text-slate-800 hover:underline truncate block w-full text-left"
                        title={row.product_id}
                      >
                        {row.product_id}
                      </button>
                      <span className="text-[11px] text-slate-400 truncate block">{row.feature_id}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">{methodTag(row.allocation_method)}</td>
                    <td className="p-3 whitespace-nowrap">{confidenceTag(row.confidence)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleInspectEvidence(row.allocation_id || row.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition"
                        title="Open provenance and audit evidence"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Why?</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Inspector Modal */}
      <EvidenceModal evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </div>
  );
};
