import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, ChevronLeft, ChevronRight, Layers, AlertTriangle, CheckCircle2, Cpu, HardDrive, Server, X } from 'lucide-react';
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

  // Anomaly Drawer state
  const [isAnomalyDrawerOpen, setIsAnomalyDrawerOpen] = useState<boolean>(false);
  const [anomalyStatus, setAnomalyStatus] = useState<'CRITICAL' | 'INVESTIGATED' | 'RESOLVED'>('CRITICAL');

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
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Active Anomaly Investigation Callout Banner */}
      <div className="bg-gradient-to-r from-red-900 to-slate-900 text-white rounded-xl p-5 shadow-md border border-red-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Active Cost Anomaly: res-analytics-db-003</h3>
              <span className="text-[10px] font-extrabold bg-red-500 text-white px-2 py-0.5 rounded-full">
                {anomalyStatus}
              </span>
            </div>
            <p className="text-xs text-red-200 mt-1">
              Spike detected: Actual spend <strong>$1,053.18/day</strong> vs expected <strong>$638.47/day</strong> (+65% variance against +25% threshold).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAnomalyDrawerOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          Inspect Anomaly Center →
        </button>
      </div>

      {/* Header & Drill-down Breadcrumb */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cloud Cost Attribution &amp; Audit Records</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Line-item allocation provenance across cloud billing exports, tags, and operational telemetry.
        </p>

        {/* Drill-down breadcrumb */}
        <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hierarchy Drill-Down:</span>
          <button
            onClick={() => {
              setDrillBu(null);
              setDrillProduct(null);
              setDrillResource(null);
            }}
            className="hover:text-emerald-700 underline text-slate-800 cursor-pointer"
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
                className="hover:text-emerald-700 underline text-emerald-700 cursor-pointer"
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
                className="hover:text-emerald-700 underline text-emerald-700 cursor-pointer"
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
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
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
          <option value="Medical Imaging">Medical Imaging</option>
          <option value="Laboratory Services">Laboratory Services</option>
          <option value="Patient Management">Patient Management</option>
          <option value="Analytics & Research">Analytics &amp; Research</option>
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
                <th className="p-3 font-semibold text-center">Confidence</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    Loading allocation ledger...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No cost records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-900">{alloc.billing_id}</td>
                    <td className="p-3 text-slate-600">{alloc.billing_date}</td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold text-slate-800">{alloc.cloud_account_id}</div>
                      <div className="text-[10px] text-slate-400">{alloc.service}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-800 font-medium">{alloc.resource_id}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 text-right">
                      ${alloc.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-medium text-slate-800">{alloc.business_unit}</td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold text-slate-800">{alloc.product_id}</div>
                      <div className="text-[10px] text-slate-400">{alloc.feature_id}</div>
                    </td>
                    <td className="p-3">{methodTag(alloc.allocation_method)}</td>
                    <td className="p-3 text-center">{confidenceTag(alloc.confidence)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleInspectEvidence(alloc.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Evidence</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} ({total} Total Items)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Inspection Modal */}
      {selectedEvidence && (
        <EvidenceModal evidenceDetail={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
      )}

      {/* Anomaly Investigation Drawer */}
      {isAnomalyDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-[600px] max-w-full bg-white h-full shadow-2xl overflow-y-auto flex flex-col p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Cost Anomaly Investigation</h3>
                  <p className="text-xs text-slate-500">Resource res-analytics-db-003</p>
                </div>
              </div>
              <button
                onClick={() => setIsAnomalyDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Actual Spend (Daily)</span>
                <div className="text-xl font-bold text-red-600 mt-1">$1,053.18</div>
              </div>
              <div>
                <span className="text-slate-500">Expected Baseline</span>
                <div className="text-xl font-bold text-slate-800 mt-1">$638.47</div>
              </div>
              <div>
                <span className="text-slate-500">Cost Variance</span>
                <div className="text-sm font-bold text-red-600 mt-1">+65% (+ $414.71)</div>
              </div>
              <div>
                <span className="text-slate-500">Anomaly Threshold</span>
                <div className="text-sm font-bold text-slate-700 mt-1">+25%</div>
              </div>
            </div>

            {/* Telemetry Detail */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Telemetry &amp; Utilization Snapshot</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <Cpu className="w-4 h-4 text-slate-400" /> GPU Utilization
                  </span>
                  <span className="font-bold text-red-600">18% (Over-provisioned)</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <Server className="w-4 h-4 text-slate-400" /> CPU Core Utilization
                  </span>
                  <span className="font-bold text-slate-800">42%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <HardDrive className="w-4 h-4 text-slate-400" /> Network IO Bandwidth
                  </span>
                  <span className="font-bold text-slate-800">1.4 GB/s</span>
                </div>
              </div>
            </div>

            {/* Root Cause & Action */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-bold text-red-900 text-sm">Possible Root Cause</h4>
              <p className="text-red-800 leading-relaxed">
                GPU compute utilization remained active during overnight off-peak batch execution without automated downscaling rules.
              </p>

              <h4 className="font-bold text-red-900 text-sm pt-2">Recommended Action</h4>
              <p className="text-red-800 leading-relaxed">
                Implement automated off-peak GPU schedule via Terraform or rightsize instance from g5.4xlarge to g5.2xlarge.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setAnomalyStatus('INVESTIGATED');
                  setIsAnomalyDrawerOpen(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer text-center"
              >
                Mark as Investigated
              </button>
              <button
                onClick={() => setIsAnomalyDrawerOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
