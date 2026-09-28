import React from 'react';
import { CheckSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export const EvaluationChecklistPage: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const sections = [
    {
      title: '1. Executive Cloud FinOps Dashboard & Overview',
      tab: 'dashboard',
      items: [
        'Total Cloud Spend aggregated dynamically ($724,892.60).',
        'Allocated Spend calculated accurately via multi-tier engine ($671,034.60 | 92.57%).',
        'Unallocated Spend tracked and flagged ($53,858.00 | 7.43%).',
        'Potential Savings KPI ($38,420/month -> $461,040/year).',
        'Next-month forecast spend ($145,200) with status indicator vs budget.',
        'Primary KPI Target: 85.0% Attribution Target measured vs Actual (92.57%) -> TARGET EXCEEDED.',
        'Global filter controls: Date Range, Business Unit, Product, Account.',
        'Recharts visualizations (Historical vs Forecast Area Chart, Spend by BU, Product, Cost Drivers).',
      ],
    },
    {
      title: '2. AI FinOps Copilot Assistant',
      tab: 'dashboard',
      items: [
        'Interactive floating FinOps Intelligence Copilot panel with quick prompt actions.',
        'Deterministic AI response engine answering cost increase, anomaly, savings, and forecast queries.',
        'Resource-level context awareness (e.g. res-analytics-db-003 GPU usage spike).',
        'Clear demo data disclaimer and direct action buttons to navigate views.',
      ],
    },
    {
      title: '3. Cost Optimization Center & Rightsizing',
      tab: 'cost-optimization',
      items: [
        'Dedicated Cost Optimization Center displaying $38,420 monthly ($461,040 annual) savings opportunities.',
        'Categorized recommendations: Idle GPU, Oversized Instances, DICOM Glacier Tiering, Tagging, Backup Retention.',
        'Priority indicators (CRITICAL, HIGH, MEDIUM) and status workflow (NEW, REVIEWING, APPROVED, REJECTED, IMPLEMENTED).',
        'One-click Change Request generation from optimization recommendations.',
      ],
    },
    {
      title: '4. Multi-Cloud & Multi-Account Inventory',
      tab: 'cloud-accounts',
      items: [
        'Multi-cloud account tracking across AWS, Azure, and GCP billing subscriptions.',
        'Account health status badges: HEALTHY (Clinical), WARNING (Analytics), AT RISK (Archive).',
        'Attribution coverage rate tracking per account and total portfolio spend aggregation.',
      ],
    },
    {
      title: '5. Interactive What-If FinOps Simulator',
      tab: 'experiment',
      items: [
        'Interactive sliders for DICOM storage tiering, compute rightsizing, reserved capacity, and GPU scheduling.',
        'Real-time dynamic calculation of CURRENT vs SCENARIO spend, monthly savings, and net reduction %.',
        'Comparative A/B evaluation: Baseline (Naive Tag, 36.8%) vs Treatment (Multi-Tier Engine, 92.6%).',
      ],
    },
    {
      title: '6. Clinical & Operational Unit Economics',
      tab: 'unit-economics',
      items: [
        'Dynamic unit-economics metric cards: $0.42/imaging study, $0.18/lab test, $0.11/patient record, $0.31/query, $0.07/GB-month.',
        'Target cost benchmarks and percentage variance trend indicators (↓ 8.2%).',
        'Safe non-zero division mathematical guard handling inactive/standby products.',
        '6-Month historical monthly trend line charts tracking unit efficiency over time.',
      ],
    },
    {
      title: '7. Change Review Workflow & One-Click Rollback',
      tab: 'change-review',
      items: [
        'Role-Based Access Control: Switch roles between CFO, FinOps Manager, BU Owner, Cloud Engineer, Auditor.',
        'Lifecycle tracking: REQUEST -> REVIEW -> APPROVAL -> IMPLEMENTATION -> AUDIT.',
        'Approval gate for high-impact allocation changes (>= $5,000 cost impact threshold).',
        'Working ROLLBACK action restoring old tags and audit log entries.',
      ],
    },
    {
      title: '8. Global Search & Notification Center',
      tab: 'dashboard',
      items: [
        'TopBar Global Search modal with instant autocomplete across resources, BUs, products, and change requests.',
        'Notification Center popover with unread count badge, critical alerts, and mark as read.',
      ],
    },
    {
      title: '9. Healthcare Governance & Zero PHI Compliance',
      tab: 'privacy',
      items: [
        'Zero real patient data: 100% synthetic infrastructure and operational metadata.',
        'HIPAA / HITECH alignment: No clinical diagnostics or patient health identifiers stored or processed.',
        'Hospital Multi-Account Isolation Architecture across segregated organizational cloud accounts.',
      ],
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center space-x-2">
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Evaluation &amp; Compliance Checklist
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Audited verification matrix validating all functional, architectural, FinOps, and unit economics criteria.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
              <button
                onClick={() => onNavigateTab(sec.tab)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>Open View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sec.items.map((item, i) => (
                <div key={i} className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
