import React, { useState } from 'react';
import { BookOpen, Layers, Shield, FileText, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'methodology' | 'stakeholders' | 'risks'>('architecture');

  return (
    <div className="p-8 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Documentation &amp; Architecture</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Engineering specifications, multi-tier attribution mechanics, risk register, and stakeholder sign-offs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('architecture')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'architecture' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          1. Architecture &amp; Data Flow
        </button>
        <button
          onClick={() => setActiveSection('methodology')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'methodology' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          2. Allocation Methodology
        </button>
        <button
          onClick={() => setActiveSection('stakeholders')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'stakeholders' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          3. Stakeholder Validation
        </button>
        <button
          onClick={() => setActiveSection('risks')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeSection === 'risks' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. FinOps Risk Register
        </button>
      </div>

      {activeSection === 'architecture' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900">System Architecture &amp; Data Pipeline</h3>
          <p>
            The Hospital Cloud Cost Attribution Engine ingests cloud billing line items, infrastructure resource tags,
            operational usage telemetry (GB logged, CPU seconds), and product activity events (diagnostic images processed,
            portal sessions, analytics queries). Data is normalized in a high-performance SQLite datastore via `sql.js`
            and evaluated through an auditable multi-tier attribution waterfall.
          </p>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-2">
            <div className="text-teal-400 font-bold">// High-Level Pipeline Architecture</div>
            <div>[Cloud Providers: AWS / GCP / Azure] &rarr; Raw Billing CSV / CUR Ingestion</div>
            <div>[Terraform IaC &amp; Resource CMDB] &rarr; Resource Governance Tag Repository</div>
            <div>[CloudWatch / DataDog Telemetry] &rarr; Storage GB &amp; Compute Telemetry Pipeline</div>
            <div>[Clinical PACS / EMR Applications] &rarr; Product Activity Volume Feeds</div>
            <div className="text-emerald-400">&darr; Ingestion &amp; Schema Integrity Validation Engine</div>
            <div className="text-amber-400">&darr; Multi-Tier Allocation Waterfall (Levels 1 &rarr; 5)</div>
            <div className="text-cyan-400">&darr; SQLite In-Memory / File Persistent Database (hospital_finops.sqlite)</div>
            <div>&darr; Express REST API (/api/dashboard, /api/allocation, /api/experiment)</div>
            <div>&darr; React + Recharts + Tailwind UI (Real-Time Observability &amp; Change Governance)</div>
          </div>
        </div>
      )}

      {activeSection === 'methodology' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900">Multi-Tier Allocation Waterfall Methodology</h3>
          <p>
            Standard cloud cost tools fail in healthcare because over 50% of infrastructure is untagged or shared across
            multiple hospital departments. The engine applies an authoritative 5-level hierarchical cascade:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-900 text-xs">Level 1: Direct Cloud Account Mapping (High Confidence)</h4>
              <p className="text-emerald-800 mt-0.5">
                If a cloud account is strictly dedicated to a single product (e.g. ACCT-IMAGING &rarr; Radiology / Medical Imaging Platform),
                100% of line items are directly attributed.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-900 text-xs">Level 2: Resource Governance Tag Matching (High Confidence)</h4>
              <p className="text-blue-800 mt-0.5">
                Resources carrying verified IaC Terraform or Cloud tags (`business_unit`, `product`, `feature`) are mapped
                directly to the matching organizational cost center.
              </p>
            </div>

            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <h4 className="font-bold text-teal-900 text-xs">Level 3: Usage Telemetry Correlation (Medium Confidence)</h4>
              <p className="text-teal-800 mt-0.5">
                Shared resources (e.g. central S3 buckets or logging clusters) are correlated with operational usage logs
                (GB transferred, node hours) to calculate proportional cost shares.
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-900 text-xs">Level 4: Product Activity Proportional (Medium Confidence)</h4>
              <p className="text-purple-800 mt-0.5">
                When telemetry is unavailable, costs are allocated proportionally based on business throughput (e.g., number
                of medical images ingested vs total volume).
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <h4 className="font-bold text-rose-900 text-xs">Level 5: Unallocated Pool (Action Required)</h4>
              <p className="text-rose-800 mt-0.5">
                Resources lacking any attribution evidence fall into the Unallocated pool with automated alerts to enforce
                tagging remediation.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'stakeholders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900">Stakeholder Validation &amp; Governance Sign-Offs</h3>
          <p>
            Three key stakeholder personas participate in the cost governance lifecycle:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900">Hospital Finance (CFO / Controller)</h4>
              <p className="text-slate-600 mt-1">
                Reviews monthly gross cloud spend, target allocation coverage (85.0%), and unit economics trends across
                clinical service lines.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validated Monthly Allocation Model</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900">Lead FinOps Engineer</h4>
              <p className="text-slate-600 mt-1">
                Oversees tag governance, pipeline freshness, cost anomaly investigations, and holds authorization to
                Approve or Rollback change requests &ge; $5,000.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Change Workflow &amp; Audit Certified</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900">Product Owner (PACS / Portal)</h4>
              <p className="text-slate-600 mt-1">
                Tracks product-level unit economics ($/image, $/session), identifies feature cost drivers, and submits
                reallocation change proposals.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unit Economics &amp; Tag Specs Approved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'risks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs text-slate-700">
          <h3 className="text-sm font-bold text-slate-900">FinOps Risk Register &amp; Mitigation Strategy</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-semibold">Risk Identifier</th>
                  <th className="p-2.5 font-semibold">Likelihood / Impact</th>
                  <th className="p-2.5 font-semibold">Potential Consequence</th>
                  <th className="p-2.5 font-semibold">Engineering Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">RISK-01: Stale Telemetry Delay</td>
                  <td className="p-2.5 text-amber-700 font-semibold">Medium / High</td>
                  <td className="p-2.5">Shared cluster costs allocated on outdated usage ratios.</td>
                  <td className="p-2.5 text-slate-600">Automated freshness monitor flags STALE feeds and reduces confidence to LOW.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">RISK-02: Erroneous Manual Reallocation</td>
                  <td className="p-2.5 text-rose-700 font-semibold">Low / Critical</td>
                  <td className="p-2.5">Incorrectly shifting $10k+ budget across hospital departments.</td>
                  <td className="p-2.5 text-slate-600">Approval gate for &ge; $5,000 changes with one-click atomic ROLLBACK button.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">RISK-03: Division by Zero on Inactive Products</td>
                  <td className="p-2.5 text-emerald-700 font-semibold">Low / Low</td>
                  <td className="p-2.5">Application crashes or displays NaN in financial reports.</td>
                  <td className="p-2.5 text-slate-600">Explicit zero-guard math check sets unit cost safely to $0.00 with standby flag.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
