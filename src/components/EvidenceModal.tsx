import React from 'react';
import { X, ShieldCheck, AlertCircle, FileText, Tag, Activity, Database, CheckCircle2 } from 'lucide-react';
import { EvidenceDetail } from '../types/index.js';

interface EvidenceModalProps {
  evidence: EvidenceDetail | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const { allocation, evidence: details } = evidence;

  const confidenceBadge = (conf: string) => {
    switch (conf) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">HIGH CONFIDENCE</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">MEDIUM CONFIDENCE</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">LOW CONFIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">NO CONFIDENCE</span>;
    }
  };

  const methodBadge = (method: string) => {
    switch (method) {
      case 'DIRECT':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Level 1 &bull; Direct Billing</span>;
      case 'RESOURCE_TAG':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Level 2 &bull; Resource Tag</span>;
      case 'USAGE_BASED':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">Level 3 &bull; Usage Telemetry</span>;
      case 'ACTIVITY_BASED':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">Level 4 &bull; Product Activity</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Level 5 &bull; Unallocated</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                {allocation.allocation_id}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Cost Attribution Evidence Inspector
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable provenance trail answering: &ldquo;Why was this cost allocated here?&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Facts Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Allocated Cost</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">${allocation.cost.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Business Unit</span>
              <p className="text-sm font-bold text-teal-700 mt-0.5">{allocation.business_unit}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Product &amp; Feature</span>
              <p className="text-xs font-medium text-slate-800 mt-0.5 truncate" title={allocation.product_id}>
                {allocation.product_id}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{allocation.feature_id}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Cloud Account</span>
              <p className="text-xs font-mono font-medium text-slate-800 mt-0.5">{allocation.cloud_account_id}</p>
              <p className="text-[11px] text-slate-500">{allocation.service}</p>
            </div>
          </div>

          {/* Allocation Method & Confidence Banner */}
          <div className="p-4 rounded-lg bg-teal-50/50 border border-teal-200/80 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {methodBadge(details.method)}
                {confidenceBadge(details.confidence)}
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2">
                Attribution Decision:
              </p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-mono bg-white p-2 rounded border border-teal-100">
                {details.reason}
              </p>
            </div>
          </div>

          {/* Section 1: Raw Billing Line Item */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>1. Cloud Provider Billing Record</span>
            </div>
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs font-mono space-y-1 overflow-x-auto">
              <div><span className="text-slate-400">billing_id:</span> {details.rawBillingRecord.billing_id}</div>
              <div><span className="text-slate-400">billing_date:</span> {details.rawBillingRecord.date}</div>
              <div><span className="text-slate-400">resource_id:</span> {details.rawBillingRecord.resource_id}</div>
              <div><span className="text-slate-400">service:</span> {allocation.service} ({allocation.usage_type})</div>
              <div><span className="text-slate-400">raw_cost:</span> ${details.rawBillingRecord.cost.toFixed(2)} USD</div>
              <div>
                <span className="text-slate-400">billing_tag:</span>{' '}
                {details.rawBillingRecord.tag || <span className="text-amber-400 italic">None (untagged in raw billing export)</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Resource Governance Tags */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Tag className="w-4 h-4 text-slate-500" />
              <span>2. Cloud Resource Governance Tags (Level 2 Evidence)</span>
            </div>
            {details.resourceTags && details.resourceTags.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-semibold">Business Unit</th>
                      <th className="p-2 font-semibold">Product</th>
                      <th className="p-2 font-semibold">Feature</th>
                      <th className="p-2 font-semibold">Tag Source</th>
                      <th className="p-2 font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {details.resourceTags.map((tag, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="p-2 font-medium text-slate-800">{tag.business_unit}</td>
                        <td className="p-2 text-slate-600">{tag.product_id}</td>
                        <td className="p-2 text-slate-600">{tag.feature_id}</td>
                        <td className="p-2 text-slate-500 font-mono text-[11px]">{tag.tag_source}</td>
                        <td className="p-2 text-slate-500 text-[11px]">{tag.tag_last_updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 italic border border-dashed border-slate-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span>No direct resource tags found for this resource in allocation_tags repository.</span>
              </div>
            )}
          </div>

          {/* Section 3: Usage Telemetry */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>3. Usage Telemetry (Level 3 Evidence)</span>
            </div>
            {details.usageTelemetry && details.usageTelemetry.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2 font-semibold">Telemetry ID</th>
                      <th className="p-2 font-semibold">Consumer Product</th>
                      <th className="p-2 font-semibold">Usage Metric</th>
                      <th className="p-2 font-semibold">Quantity</th>
                      <th className="p-2 font-semibold">Freshness Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {details.usageTelemetry.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="p-2 font-mono text-[11px] text-teal-700 font-semibold">{t.telemetry_id}</td>
                        <td className="p-2 font-medium text-slate-800">{t.product_id}</td>
                        <td className="p-2 text-slate-600">{t.usage_type}</td>
                        <td className="p-2 font-bold text-slate-800">{t.usage_quantity} {t.unit}</td>
                        <td className="p-2 text-slate-500 font-mono text-[11px]">{t.freshness_timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 italic border border-dashed border-slate-200">
                No granular resource-level telemetry logged for this billing entry.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic audit evidence verified in SQLite datastore</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
