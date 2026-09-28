# Hospital Cloud Cost Attribution & Unit-Economics Dashboard

An enterprise-grade FinOps intelligence platform designed for healthcare organizations to attribute multi-cloud infrastructure spend down to clinical business units, products, and features with deterministic confidence scoring and defensive failure handling.

---

## 🏛️ Architecture Overview

The platform uses a decoupled client-server architecture with an in-memory SQLite database and disk persistence:

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Recharts, Lucide Icons.
- **Backend API**: Node.js, Express, SQLite (`sql.js`).
- **Attribution Engine**: 5-tiered waterfall processing pipeline executing deterministic rules, proportional telemetry allocation, and clinical activity splits.
- **Governance**: RBAC role switching (`EXECUTIVE`, `FINOPS_ANALYST`, `PRODUCT_OWNER`), two-person approval workflows for tag reassignments, operational rollback, and immutable audit logs.

---

## 📚 Technical Documentation

Complete architectural documentation is available in the [`docs/`](./docs) directory:

- [📄 Database Schema Documentation](docs/DATABASE_SCHEMA.md) — Comprehensive overview of all 14 SQLite tables, columns, constraints, data types, indexes, and data flows.
- [📊 Entity-Relationship (ER) Diagram](docs/ER_DIAGRAM.md) — Mermaid ER diagram illustrating structural entity relationships across clinical dimensions, billing records, allocation results, and audit trails.
- [🔌 API Endpoint Contracts](docs/API_CONTRACTS.md) — Full specification of Express API routes, request parameters, response schemas, HTTP status codes, and JSON response examples.
- [🧮 Mathematical Model & Confidence Scoring](docs/CONFIDENCE_SCORING.md) — Concrete mathematical formulations for confidence ratings (\(C_{\text{final}} = C_{\text{base}} \times Q \times F \times E\)) across all 5 waterfall levels.
- [🧪 Testing Strategy & Execution Report](docs/TESTING.md) — Detailed catalog of unit tests, automated integration test suites, failure-case handling, and execution metrics.

---

## 🌊 Attribution Waterfall

The allocation engine processes raw cloud billing records through a 5-tier waterfall:

```
[ Raw Billing Line Item ]
           │
           ├── Level 1: Direct Account / Billing Tag  ───> (HIGH Confidence)
           │     Valid business unit, product, and feature in export
           │
           ├── Level 2: Resource Governance Tag (IaC)  ───> (HIGH / NONE Confidence)
           │     Dedicated resource tag mapping from Terraform
           │
           ├── Level 3: Usage Telemetry Allocation  ───────> (MEDIUM / LOW Confidence)
           │     Proportional CPU/Storage telemetry split across workloads
           │
           ├── Level 4: Product Business Activity  ───────> (MEDIUM Confidence)
           │     Proportional split based on DICOM images/portal sessions
           │
           └── Level 5: Unallocated Pool  ────────────────> (NONE Confidence)
                 Fallback for untagged spend; flags validation errors
```

---

## 🧮 Confidence Scoring Formulation

Every allocation result receives a deterministic confidence rating (\(\mathbf{HIGH}\), \(\mathbf{MEDIUM}\), \(\mathbf{LOW}\), or \(\mathbf{NONE}\)) computed via:

\[
C_{\text{final}} = C_{\text{base}} \times Q \times F \times E
\]

- **\( C_{\text{base}} \)**: Base confidence factor (Level 1/2 = 1.0; Level 3 = 0.75; Level 4 = 0.70; Level 5 = 0.0).
- **\( Q \)**: Data Quality multiplier (1.0 for valid metadata; 0.0 for conflicting tags or invalid product IDs).
- **\( F \)**: Telemetry Freshness multiplier (1.0 if age \(\le 72\text{h}\); 0.5 if age \(> 72\text{h}\)).
- **\( E \)**: Evidence Completeness multiplier (1.0 if volume \(> 0\); 0.0 if zero volume or missing).

---

## 🛡️ Failure-Case Handling & Edge Cases

The platform implements defensive handlers for common enterprise FinOps failures:

1. **Duplicate Billing Ingestion**: Detects duplicate billing IDs, records errors in `data_validation_errors`, and preserves total cost conservation without double-counting.
2. **Schema Drift**: Safely isolates records with missing or unexpected fields without crashing the pipeline.
3. **Missing Allocation Tags**: Prevents arbitrary guessing; routes untagged spend to the Unallocated pool with `NONE` confidence and logs remediation items.
4. **Stale Telemetry**: Identifies telemetry older than 72 hours, flags `STALE_TELEMETRY`, and downgrades confidence to `LOW`.
5. **Zero Activity Volume**: Prevents division-by-zero or `NaN`/`Infinity` errors, returning a safe unit cost metric (0.0).
6. **Shared Infrastructure Split**: Enforces total cost conservation (\(\sum \text{Allocation}_i = \text{BilledCost}\)) across proportional usage splits.
7. **Invalid Product Mapping**: Identifies unregistered product tags, flags `INVALID_PRODUCT_ID`, and places cost into review.
8. **Cost Spike Detection**: Identifies spend increases \( > 25\% \) above moving averages and \( > \$200 \), raising high-severity alerts.

---

## 🧪 Testing Strategy

The repository includes comprehensive automated unit and integration tests powered by Vitest:

- **Unit Tests (`tests/unit/confidence.test.ts`)**: Validate confidence calculation determinism, tag conflict handling, stale telemetry downgrades, and unallocated fallbacks.
- **Integration Tests (`tests/integration/pipeline.test.ts`)**: Validate end-to-end data pipeline operations, duplicate billing deduplication, schema drift safety, zero activity stability, and shared infrastructure cost conservation.

### Running Tests

Execute the test suite:
```bash
npm test
```

Execute TypeScript type check:
```bash
npm run lint
```

---

## 🚀 Getting Started & Reproducibility

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate synthetic datasets & seed SQLite database**:
   ```bash
   npm run seed
   ```

3. **Run automated test suite**:
   ```bash
   npm test
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Compliance

All data in this repository is **synthetic and synthetic-only**. No real patient health information (PHI) or protected medical records are present.
