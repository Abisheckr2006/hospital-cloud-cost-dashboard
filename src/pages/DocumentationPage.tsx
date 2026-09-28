import React, { useState } from 'react';
import { BookOpen, Layers, Shield, FileText, CheckCircle2, AlertTriangle, Users, Calculator, Sparkles } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'methodology' | 'formulas' | 'stakeholders' | 'risks'>('architecture');

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center space-x-2.5">
          <BookOpen className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Documentation &amp; Architecture</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Engineering specifications, multi-tier attribution mechanics, mathematical formulas, risk register, and stakeholder sign-offs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSection('architecture')}
          className={`px-3 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'architecture' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          1. Architecture &amp; Pipeline
        </button>
        <button
          onClick={() => setActiveSection('methodology')}
          className={`px-3 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'methodology' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          2. Allocation Methodology
        </button>
        <button
          onClick={() => setActiveSection('formulas')}
          className={`px-3 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'formulas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          3. FinOps Formulas &amp; Math
        </button>
        <button
          onClick={() => setActiveSection('stakeholders')}
          className={`px-3 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'stakeholders' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. Stakeholder Sign-Offs
        </button>
        <button
          onClick={() => setActiveSection('risks')}
          className={`px-3 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'risks' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          5. Risk Register
        </button>
      </div>

      {activeSection === 'architecture' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">System Architecture &amp; Data Pipeline</h3>
          <p>
            The Hospital Cloud Cost Attribution Engine ingests cloud billing line items, infrastructure resource tags,
            operational usage telemetry (GB logged, CPU seconds), and product activity events (diagnostic images processed,
            portal sessions, analytics queries). Data is normalized in an in-memory or file-backed SQLite database (`sql.js`)
            and evaluated through an auditable multi-tier attribution waterfall.
          </p>

          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-[11px] space-y-2">
            <div className="text-emerald-400 font-bold">// High-Level Pipeline Architecture</div>
            <div>[Cloud Providers: AWS / GCP / Azure] &rarr; Raw Billing Ingestion (CUR CSV)</div>
            <div>[Terraform IaC &amp; Resource CMDB] &rarr; Resource Governance Tag Repository</div>
            <div>[CloudWatch / DataDog Telemetry] &rarr; Storage GB &amp; Compute Telemetry Pipeline</div>
            <div>[Clinical PACS / EMR Applications] &rarr; Product Activity Volume Feeds</div>
            <div className="text-emerald-400">&darr; Ingestion &amp; Schema Integrity Validation Engine</div>
            <div className="text-amber-400">&darr; Multi-Tier Allocation Waterfall (Levels 1 &rarr; 5)</div>
            <div className="text-cyan-400">&darr; SQLite Database (hospital_finops.sqlite)</div>
            <div>&darr; Express REST API (/api/dashboard, /api/allocation, /api/forecasting, /api/optimization)</div>
            <div>&darr; React 19 + Recharts + Tailwind UI (Real-Time Observability &amp; FinOps Copilot)</div>
          </div>
        </div>
      )}

      {activeSection === 'methodology' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">Multi-Tier Allocation Waterfall Methodology</h3>
          <p>
            Standard cloud cost tools fail in healthcare because over 50% of infrastructure is untagged or shared across
            multiple hospital departments. The engine applies an authoritative 5-level hierarchical cascade:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-900 text-xs">Level 1: Direct Cloud Account Mapping (High Confidence)</h4>
              <p className="text-emerald-800 mt-0.5">
                If a cloud account is dedicated to a single product (e.g., `Production-Clinical`), 100% of line items are directly attributed.
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-900 text-xs">Level 2: Resource Governance Tag Matching (High Confidence)</h4>
              <p className="text-blue-800 mt-0.5">
                Resources carrying verified IaC Terraform tags (`business_unit`, `product`, `feature`) are mapped directly to the matching cost center.
              </p>
            </div>

            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <h4 className="font-bold text-teal-900 text-xs">Level 3: Usage Telemetry Correlation (Medium Confidence)</h4>
              <p className="text-teal-800 mt-0.5">
                Shared resources (e.g. central DICOM buckets or logging clusters) are correlated with usage telemetry to calculate proportional cost shares.
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-900 text-xs">Level 4: Product Activity Proportional (Medium Confidence)</h4>
              <p className="text-purple-800 mt-0.5">
                When telemetry is unavailable, costs are allocated proportionally based on business throughput (e.g., number of diagnostic scans).
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <h4 className="font-bold text-rose-900 text-xs">Level 5: Unallocated Pool (Action Required)</h4>
              <p className="text-rose-800 mt-0.5">
                Resources lacking any attribution evidence fall into the Unallocated pool with automated alerts to enforce tagging remediation.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'formulas' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">Authoritative FinOps Mathematical Formulas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-sm">1. Attribution Completeness Identity</div>
              <p className="font-mono text-emerald-700 font-bold bg-white p-2 rounded border border-slate-200 mt-1">
                Allocated Spend + Unallocated Spend = Total Cloud Spend
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Guarantees zero lost or unaccounted invoice dollars ($671,034.60 + $53,858.00 = $724,892.60).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-sm">2. Allocation Coverage Percentage</div>
              <p className="font-mono text-emerald-700 font-bold bg-white p-2 rounded border border-slate-200 mt-1">
                Allocation Rate (%) = (Allocated Spend / Total Cloud Spend) &times; 100
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Evaluated against the 85.0% enterprise attribution target (Current: 92.57%).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-sm">3. Clinical Unit Economics Metric</div>
              <p className="font-mono text-emerald-700 font-bold bg-white p-2 rounded border border-slate-200 mt-1">
                Cost per Unit = Cloud Spend / Workload Activity Volume
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes zero-volume mathematical guards `(volume &gt; 0 ? spend / volume : 0)`.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-sm">4. Potential Annual Savings</div>
              <p className="font-mono text-emerald-700 font-bold bg-white p-2 rounded border border-slate-200 mt-1">
                Annual Savings = Potential Monthly Savings &times; 12
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Calculated across idle GPU rightsizing and storage tiering ($38,420 &times; 12 = $461,040).
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'stakeholders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">Stakeholder Validation &amp; Governance Sign-Offs</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">Hospital Finance (CFO / Controller)</h4>
              <p className="text-slate-600 mt-1">
                Reviews monthly gross cloud spend, target allocation coverage (85.0%), and unit economics trends.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validated Monthly Allocation Model</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">Lead FinOps Manager</h4>
              <p className="text-slate-600 mt-1">
                Oversees tag governance, pipeline freshness, cost anomaly investigations, and holds authorization to approve or rollback change requests.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Change Workflow &amp; Audit Certified</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">Business Unit Owner (PACS / EMR)</h4>
              <p className="text-slate-600 mt-1">
                Tracks product-level unit economics ($/study, $/session), identifies feature cost drivers, and submits reallocation change proposals.
              </p>
              <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unit Economics Specs Approved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'risks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs text-slate-700">
          <h3 className="text-base font-bold text-slate-900">FinOps Risk Register &amp; Mitigation Strategy</h3>
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
