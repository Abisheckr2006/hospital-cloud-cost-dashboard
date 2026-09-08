# Hospital Cloud Cost Attribution Dashboard

> **Enterprise Cloud FinOps & Unit-Economics Intelligence for Multi-Account Hospital Workloads**  
> Tracks spend attribution, clinical throughput metrics, pipeline data quality, and change management governance across medical imaging archives, operational telemetry, data lake backups, and patient-facing applications.

---

## Executive Summary

Hospital healthcare environments typically suffer from low cloud cost visibility—often allocating less than 40% of their gross cloud expenditure due to untagged storage buckets, multi-tenant Kubernetes clusters, and shared data pipelines. 

This platform implements a **Multi-Tier Waterfall Attribution Engine** that connects infrastructure spend directly to clinical activity volume and business units. In formal A/B experimentation, it improved cost attribution from a **36.8% Baseline** (naive billing tags) to **92.57% Treatment**, exceeding the organization's **85.0% allocation target** (+7.57% above target) and recovering **$404,334.60** from cost blind spots.

---

## Key Features

### 1. Executive FinOps Dashboard
- **Dynamic KPIs**: Total Cloud Spend ($724,892.60), Attributed Spend ($671,034.60), Unallocated Spend ($53,858.00), Allocation Rate (92.57%), Target (85.0%), and Pipeline Health.
- **10 Interactive Visualizations**: Powered by Recharts, charting spend by Business Unit, Product, Micro-Feature, Cloud Service, Cloud Account, Monthly Trajectory (Allocated vs. Unallocated), Allocation Confidence Distribution, and Top Cost Drivers.
- **Global Filter Bar**: Slice metrics by billing month (Jan–Jun 2026), Business Unit, Product, and Cloud Account.
- **Anomaly Detection**: Statistical detection highlighting resources with &gt; 125% variance over baseline (e.g., GPU model inference spikes).

### 2. Multi-Tier Allocation Engine & Provenance Inspector
- **5-Tier Hierarchical Waterfall**:
  1. **Level 1 — Direct Cloud Account**: Dedicated accounts (e.g., `ACCT-IMAGING`, `ACCT-PORTAL`) mapped with High Confidence.
  2. **Level 2 — Resource Governance Tag**: Matched against IaC Terraform or Cloud resource tags (`bu`, `product`, `feature`).
  3. **Level 3 — Usage Telemetry Correlation**: Shared services (logs, S3 storage, compute nodes) allocated proportionally based on operational metrics (GB, CPU hours).
  4. **Level 4 — Product Activity Proportional**: Micro-features attributed based on business activity volume.
  5. **Level 5 — Unallocated Pool**: Untagged or orphan resources isolated with automated remediation alerts.
- **Evidence Inspector ("Why?")**: Line-item provenance modal detailing the raw provider invoice, matched tags, telemetry readings, and deterministic allocation justification.
- **Hierarchy Drill-Down**: Interactive breadcrumb navigation: `Organization -> Business Unit -> Product -> Feature -> Account -> Resource`.

### 3. Clinical & Operational Unit Economics
- **Activity-Based Cost Attribution**:
  - **Medical Imaging Platform**: `$0.7029 / image` (120,000 diagnostic DICOM images processed)
  - **Patient Portal**: `$0.5186 / session` (80,000 patient portal sessions)
  - **Clinical Analytics**: `$9.5746 / report` (5,000 analytical reports generated)
  - **Backup & Recovery Vault**: `$0.7952 / GB` (50,000 GB encrypted backups)
  - **Hospital Logging Platform**: `$1.3193 / GB` (30,000 GB operational telemetry logs)
- **Zero-Guard Mathematical Protection**: Explicit verification preventing division-by-zero errors on inactive or standby products.
- **Historical Efficiency Trends**: 6-month trajectory tracking cost-per-unit evolution over time.

### 4. Data Quality & Pipeline Freshness Auditing
- **Dataset Health Matrix**: Auditing Billing Records, Usage Telemetry, Allocation Tags, and Product Activity for validity, missing tags, duplicates, and stale records.
- **Data Freshness Monitors**: Live pipeline tracking classifying feeds as `FRESH` (&lt; 24h), `STALE` (24–72h), or `MISSING` (&gt; 72h).
- **Proactive Warning Banners**:
  - **Missing Tag Warning**: Identifies untagged resources ($53,858 affected) with IaC remediation recommendations.
  - **Stale Telemetry Alert**: Flags delayed feeds (96+ hours) and automatically downgrades attribution confidence.

### 5. Change Management & One-Click Rollback Governance
- **Role-Based Access Control (RBAC)**: Switch between **Executive (CFO)**, **FinOps Analyst (Admin)**, and **Product Owner** profiles.
- **Approval Gate**: Requires FinOps Analyst sign-off for high-impact attribution changes (&ge; $5,000 threshold).
- **One-Click Rollback**: Authorized reviewers can revert applied changes back to baseline, automatically re-running the attribution engine and logging `ROLLBACK_EXECUTED` to the immutable audit trail.
- **Propose Change Dialog**: Enables product owners to request reallocation with business justifications.

### 6. Immutable Audit Trail
- Cryptographic append-only ledger stored in SQLite (`audit_logs` table) tracking every administrative action (`CHANGE_PROPOSED`, `CHANGE_APPROVED`, `CHANGE_REJECTED`, `ROLLBACK_EXECUTED`, `EXPERIMENT_RUN`) with actor, timestamp, prior state, new state, and financial impact.

### 7. Resilience Across 8 Healthcare Edge Cases
Dedicated demonstrations validating robust handling of:
1. **Missing Tags** &rarr; Fallback to telemetry or unallocated pool with alert.
2. **Stale Telemetry** &rarr; Graceful degradation with confidence downgrade penalty.
3. **Invalid Product Mapping** &rarr; Preserves Business Unit attribution; logs validation issue.
4. **Conflicting Tags** &rarr; Strict precedence resolution (Terraform IaC &gt; Console tag).
5. **Shared Infrastructure** &rarr; Proportional fractional split based on telemetry.
6. **Zero Activity in Period** &rarr; Safe zero-guard division preventing NaN/Infinity errors.
7. **Duplicate Billing Records** &rarr; Idempotent compound unique key deduplication.
8. **Cost Spike Anomaly** &rarr; Automated statistical alert initiating review workflow.

### 8. Healthcare Privacy & Zero-PHI Compliance
- **100% Synthetic Healthcare Data**: Zero Protected Health Information (PHI) or real clinical records.
- **Metadata-Only Processing**: Only technical cloud primitives (resource IDs, bucket names, compute hours, GB metrics) are ingested.
- **Multi-Account Isolation**: Segregated account architecture across 6 distinct hospital domains (`ACCT-IMAGING`, `ACCT-PORTAL`, `ACCT-ANALYTICS`, `ACCT-BACKUP`, `ACCT-LOGGING`, `ACCT-SHARED`).

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide React, Motion.
- **Backend**: Node.js, Express, `sql.js` (WebAssembly SQLite engine with in-memory & file persistence).
- **Tooling**: Vite, `tsx`, `esbuild`, Vitest.

---

## Project Structure

```
.
├── backend/
│   └── src/
│       ├── allocation/
│       │   └── engine.ts          # 5-tier allocation waterfall engine
│       ├── analytics/
│       │   ├── anomalies.ts       # Cost spike anomaly detection
│       │   ├── freshness.ts       # Pipeline freshness monitoring
│       │   ├── quality.ts         # Data quality & schema validation
│       │   ├── recommendations.ts # Automated FinOps savings suggestions
│       │   └── unit-economics.ts  # Clinical throughput & unit economics math
│       ├── database/
│       │   └── db.ts              # SQLite database initialization & schema
│       ├── routes/
│       │   └── api.ts             # Express REST API endpoints
│       ├── services/
│       │   ├── change-management.ts # Review, approval & rollback logic
│       │   └── experiment.ts      # A/B Baseline vs Treatment evaluator
│       └── types/
│           └── index.ts           # Shared domain types & FinOps interfaces
├── data/
│   ├── data_dictionary.md         # Schema & data field documentation
│   └── synthetic/                 # Generated synthetic CSV datasets
├── scripts/
│   ├── generate-data.ts           # Synthetic generator for billing, tags & telemetry
│   ├── ingest-data.ts             # CSV ingestion pipeline into SQLite
│   └── run-experiment.ts          # CLI experiment evaluation runner
├── src/
│   ├── components/
│   │   ├── EvidenceModal.tsx      # Provenance inspector modal
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   └── TopBar.tsx             # Role selector & freshness header
│   ├── pages/
│   │   ├── DashboardPage.tsx      # Main executive dashboard
│   │   ├── CostAllocationPage.tsx # Table & drill-down allocation view
│   │   ├── BusinessUnitsPage.tsx  # Accountable BU cards & budgets
│   │   ├── ProductsPage.tsx       # Product & feature catalog breakdown
│   │   ├── UnitEconomicsPage.tsx  # Workload throughput & unit economics
│   │   ├── DataQualityPage.tsx    # Health scores & validation log
│   │   ├── ExperimentPage.tsx     # Baseline vs. Treatment A/B experiment
│   │   ├── ChangeReviewPage.tsx   # Change approval & rollback governance
│   │   ├── AuditPage.tsx          # Append-only immutable audit trail
│   │   ├── EdgeCasesPage.tsx      # 8 Failure & edge case demonstrations
│   │   ├── DocumentationPage.tsx  # System architecture & risk register
│   │   ├── PrivacyPage.tsx        # Zero-PHI healthcare compliance
│   │   └── EvaluationChecklistPage.tsx # 72-criteria interactive checklist
│   ├── services/
│   │   └── api.ts                 # Frontend API client service
│   ├── types/
│   │   └── index.ts               # UI types & role definitions
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React entry point
├── server.ts                      # Express API server with Vite middleware
├── package.json                   # Dependencies and scripts
└── metadata.json                  # Application metadata
```

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate synthetic hospital cloud datasets**:
   ```bash
   npm run generate-data
   ```
   *Generates realistic multi-account billing records, resource governance tags, telemetry logs, and clinical activity volume.*

3. **Ingest data into SQLite**:
   ```bash
   npm run seed
   ```
   *Validates schemas, deduplicates entries, creates the SQLite tables, and runs the initial allocation pass.*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   *Starts the full-stack server on `http://localhost:3000` serving both the Express REST API and Vite frontend.*

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server on port 3000 via `tsx server.ts` |
| `npm run build` | Builds client assets and bundles server to `dist/server.cjs` |
| `npm start` | Runs the compiled production server |
| `npm run generate-data` | Generates 6-month synthetic multi-account datasets |
| `npm run seed` | Seeds SQLite database from generated CSV files |
| `npm run run-experiment` | CLI script executing A/B attribution experiment |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Runs unit tests via Vitest |

---

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Service health status and timestamp |
| `/api/dashboard` | `GET` | Aggregated KPIs, breakdown charts, trends & cost drivers |
| `/api/allocation` | `GET` | Paginated allocation line items with filtering |
| `/api/evidence/:id` | `GET` | Detailed allocation provenance answering "Why was this cost allocated here?" |
| `/api/business-units` | `GET` | Business units with total spend and product counts |
| `/api/products` | `GET` | Products catalog with micro-features and cost breakdown |
| `/api/unit-economics` | `GET` | Unit cost metrics per image, session, report, and GB |
| `/api/data-quality` | `GET` | Health scores, record counts, and validation errors |
| `/api/data-freshness` | `GET` | Pipeline age and feed status (`FRESH`, `STALE`, `MISSING`) |
| `/api/experiment` | `GET` | Baseline vs Treatment comparative experiment metrics |
| `/api/experiment/run` | `POST` | Re-evaluates attribution engine and synchronizes metrics |
| `/api/anomalies` | `GET` | Cost spike anomalies exceeding statistical variance threshold |
| `/api/recommendations` | `GET` | Automated FinOps optimization recommendations |
| `/api/change-requests` | `GET` | Active and historical allocation change requests |
| `/api/change-requests` | `POST` | Submits a new allocation change request |
| `/api/change-requests/:id/approve` | `POST` | Approves and applies change (FinOps Analyst role required) |
| `/api/change-requests/:id/reject` | `POST` | Rejects change request with audit log |
| `/api/change-requests/:id/rollback` | `POST` | Restores prior allocation and logs `ROLLBACK_EXECUTED` |
| `/api/audit` | `GET` | Immutable audit log trail |

---

## Compliance & Safe Harbor Disclaimer

This project is built strictly for operational demonstration and FinOps benchmarking. All patient encounters, DICOM image volumes, clinical reports, and infrastructure usage records are **100% synthetically generated**. No real Protected Health Information (PHI) or identifiable hospital records are utilized or stored.
