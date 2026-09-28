import React from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, FileCheck, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Healthcare Privacy, Security &amp; Compliance Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Zero-PHI synthetic operational design adhering to HIPAA, HITECH, and hospital cloud isolation standards.
        </p>
      </div>

      {/* Zero PHI Certified Banner */}
      <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 flex items-start space-x-4">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-emerald-900 uppercase">
              100% Synthetic Healthcare Data &bull; No Real PHI
            </h3>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
              HIPAA Safe-Harbor
            </span>
          </div>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            This cost intelligence platform operates exclusively on synthetic cloud infrastructure metadata, aggregated
            billing telemetry, and generated workload counters. Under no circumstances is patient health information (PHI),
            electronic medical records (EMR), patient names, medical history, or clinical diagnostic imagery ingested, stored,
            or processed.
          </p>
        </div>
      </div>

      {/* Compliance Architecture Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <EyeOff className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">1. Metadata-Only Processing</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            The engine processes only technical cloud primitives: Amazon S3 bucket names, EC2 instance IDs, Google Cloud Storage
            byte counts, and BigQuery query runtimes. Clinical payload data is strictly isolated within encrypted medical accounts.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">2. Multi-Account Boundary Isolation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Production clinical workloads (ACCT-IMAGING) and external-facing patient systems (ACCT-PORTAL) run inside distinct,
            air-gapped cloud accounts. Billing consolidation uses IAM read-only billing export roles with zero permission to read data.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <FileCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">3. Immutable FinOps Audit Trail</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every change to cost allocation tags or billing rules is recorded in an immutable audit ledger (`audit_logs`) tracking
            the actor, timestamp, prior value, and financial impact for SOC 2 and hospital internal audit compliance.
          </p>
        </div>
      </div>

      {/* Regulated Account Architecture Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase">Hospital Multi-Account Isolation Architecture</h4>
          <span className="text-[11px] text-slate-500">6 Distinct Organizational Units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Account Identifier</th>
                <th className="p-3 font-semibold">Account Purpose</th>
                <th className="p-3 font-semibold">Data Classification</th>
                <th className="p-3 font-semibold">Cost Attribution Level</th>
                <th className="p-3 font-semibold text-center">Isolation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-mono font-bold text-teal-700">ACCT-IMAGING</td>
                <td className="p-3 font-medium text-slate-800">PACS Archive &amp; GPU Model Inference</td>
                <td className="p-3 text-slate-600">Encrypted Synthetic DICOM Objects</td>
                <td className="p-3 text-emerald-700 font-semibold">Level 1: 100% Direct to Radiology</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Air-Gapped</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-teal-700">ACCT-PORTAL</td>
                <td className="p-3 font-medium text-slate-800">Patient Web &amp; Mobile Experience</td>
                <td className="p-3 text-slate-600">Synthetic Web Sessions &amp; APIs</td>
                <td className="p-3 text-emerald-700 font-semibold">Level 1: 100% Direct to Patient Portal</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">DMZ Segregated</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-teal-700">ACCT-ANALYTICS</td>
                <td className="p-3 font-medium text-slate-800">Clinical Analytics &amp; Reporting Cluster</td>
                <td className="p-3 text-slate-600">De-identified Data Warehouse</td>
                <td className="p-3 text-blue-700 font-semibold">Level 2: Tag &amp; Level 3 Telemetry</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">VPC Peered</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-teal-700">ACCT-SHARED</td>
                <td className="p-3 font-medium text-slate-800">Shared Kubernetes Ingress &amp; Logging</td>
                <td className="p-3 text-slate-600">Centralized Infrastructure Logs</td>
                <td className="p-3 text-teal-700 font-semibold">Level 3: Proportional Telemetry Split</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Shared Multi-Tenant</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
