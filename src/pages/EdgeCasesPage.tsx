import React, { useState } from 'react';
import {
  AlertTriangle,
  Tag,
  Clock,
  Shuffle,
  Split,
  Layers,
  FileWarning,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const EdgeCasesPage: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<number>(1);

  const edgeCases = [
    {
      id: 1,
      title: 'Missing Allocation Tags',
      category: 'Tag Governance',
      icon: Tag,
      severity: 'Medium',
      description: 'Cloud resource has no business unit, product, or feature tags in raw billing export.',
      impact: 'Without multi-tier engine, 100% of these resources fall into the unallocated blind spot ($53,858 affected).',
      howHandled: 'Multi-tier engine falls back to Level 3 (telemetry correlation) or Level 4 (proportional activity). If no telemetry exists, it is placed into Level 5 (Unallocated) with an actionable tagging alert.',
      evidenceCode: 'BILL-UNTAGGED-S3-001 -> Level 5 Unallocated (Confidence: NONE) -> Flags missing tag remediation task.',
      status: 'Verified Safe Fallback',
    },
    {
      id: 2,
      title: 'Stale Telemetry Feed',
      category: 'Pipeline Integrity',
      icon: Clock,
      severity: 'Medium',
      description: 'Usage telemetry stream is delayed or pipeline is down (> 72 hours age).',
      impact: 'Clinical Analytics cluster (ACCT-ANALYTICS) telemetry is 96 hours old ($4,250 spend affected).',
      howHandled: 'The system computes allocation using the last-known telemetry distribution, but automatically applies a data staleness penalty, downgrading confidence from HIGH to LOW and triggering a pipeline warning.',
      evidenceCode: 'freshness_timestamp: 2026-06-25 -> Age: 96h -> Confidence downgraded to LOW -> Flagged STALE in UI.',
      status: 'Verified Graceful Degradation',
    },
    {
      id: 3,
      title: 'Invalid Product Mapping',
      category: 'Schema Validation',
      icon: FileWarning,
      severity: 'Low',
      description: 'A developer tagged a resource with product "Legacy-PACS-V1" which does not exist in the active product catalog.',
      impact: 'Spend cannot map to a valid unit-economics metric.',
      howHandled: 'System validates product against canonical domain registry. If unknown, it preserves the Business Unit (Radiology) attribution, sets product to "Uncategorized/Catalog Unknown", and logs an audit validation error.',
      evidenceCode: 'Catalog Validation Error: "Unknown product Legacy-PACS-V1" -> Fallback to BU-level Radiology attribution.',
      status: 'Verified Hierarchy Fallback',
    },
    {
      id: 4,
      title: 'Conflicting Allocation Tags',
      category: 'Tag Governance',
      icon: Shuffle,
      severity: 'High',
      description: 'AWS Console tag specifies BU="Radiology" while Terraform IaC specifies BU="Research".',
      impact: 'Contested ownership between department cost centers.',
      howHandled: 'Engine strictly enforces tag source hierarchy: IaC Terraform Tag > Cloud Console Tag > Default Rule. Discrepancy is logged to audit logs for FinOps review.',
      evidenceCode: 'Conflict detected on r-storage-conflicted -> Terraform precedence applied (Radiology) -> Audit logged.',
      status: 'Verified Precedence Resolution',
    },
    {
      id: 5,
      title: 'Shared Infrastructure Cluster',
      category: 'Multi-Tenant Allocation',
      icon: Split,
      severity: 'High',
      description: 'Shared Kubernetes node cluster or central data lake bucket used concurrently by 3 hospital products.',
      impact: '$42,100 multi-tenant shared spend cannot be directly tagged to a single product.',
      howHandled: 'Engine queries usage telemetry for cpu_seconds and gb_ingress, calculating fractional share: Medical Imaging (55%), Analytics (35%), Portal (10%). Line items are split proportionally.',
      evidenceCode: 'ACCT-SHARED cluster -> Split into 3 proportional attribution rows with Level 3 Telemetry evidence.',
      status: 'Verified Dynamic Split',
    },
    {
      id: 6,
      title: 'Zero Activity Volume in Period',
      category: 'Unit Economics',
      icon: Layers,
      severity: 'Low',
      description: 'Research product has $3,400 in cloud standby costs but 0 clinical query executions in the month.',
      impact: 'Naive formula (Cost / Activity) produces fatal Division-by-Zero (NaN / Infinity).',
      howHandled: 'Unit economics engine verifies volume > 0 before division. If volume === 0, unit cost is safely set to $0.00 with a descriptive status flag: "Zero Activity in Period (Fixed Standby Cost)".',
      evidenceCode: 'activity_volume === 0 ? cost_per_unit = 0 : cost / volume -> Division by zero prevented safely.',
      status: 'Verified Safe Math Handling',
    },
    {
      id: 7,
      title: 'Duplicate Cloud Billing Records',
      category: 'Data Ingestion',
      icon: FileWarning,
      severity: 'High',
      description: 'Cloud billing export file contains re-transmitted duplicate invoice entries for the same billing_id and date.',
      impact: 'Risk of double-counting hospital cloud expenditure.',
      howHandled: 'Ingestion pipeline applies compound unique key constraint (`billing_id` + `date` + `resource_id`). Duplicates are rejected with deduplication log and not imported into active ledger.',
      evidenceCode: 'Duplicate billing_id detected in batch -> Skipped -> Ingestion report records duplicate_records: +1.',
      status: 'Verified Idempotent Ingestion',
    },
    {
      id: 8,
      title: 'Cost Spike Anomaly (> 125% Variance)',
      category: 'Anomaly Detection',
      icon: TrendingUp,
      severity: 'Critical',
      description: 'GPU inference server spend jumps from historical $3,800/mo to $18,450/mo due to model re-training run.',
      impact: 'Unbudgeted department expense spike.',
      howHandled: 'Statistical anomaly engine calculates 3-month rolling baseline and flags variance > 125%. Dashboard immediately displays high-priority warning card and initiates Change Request review.',
      evidenceCode: 'Resource i-imaging-gpu-001 variance: +385% -> Anomaly trigger generated -> Change Request CR-DEMO-001 linked.',
      status: 'Verified Automated Alerting',
    },
  ];

  const current = edgeCases.find((c) => c.id === selectedCase) || edgeCases[0];
  const CurrentIcon = current.icon;

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Failure &amp; Edge Case Demonstrations (8 Scenarios)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited resilience testing for tag gaps, stale pipelines, schema drift, multi-tenancy, and anomalous spend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Case Selector List */}
        <div className="space-y-2">
          {edgeCases.map((ec) => {
            const Icon = ec.icon;
            const isSelected = ec.id === selectedCase;
            return (
              <button
                key={ec.id}
                onClick={() => setSelectedCase(ec.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{ec.id}. {ec.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      ec.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : ec.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ec.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{ec.category}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Case Inspection Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scenario #{current.id} &bull; {current.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
              </div>
            </div>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{current.status}</span>
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Problem Description</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                {current.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Business &amp; FinOps Impact</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                {current.impact}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                How Hospital FinOps Engine Handles It
              </h4>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-teal-50/40 p-3 rounded-lg border border-teal-200/80">
                {current.howHandled}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Audit &amp; Evidence Trail</h4>
              <div className="mt-1 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                {current.evidenceCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
