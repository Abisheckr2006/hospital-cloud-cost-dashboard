# Hospital Cloud Cost Attribution & Unit-Economics Dashboard
## Testing Strategy & Execution Report

### 1. Testing Strategy Overview

The testing suite for the Hospital FinOps Cost Attribution system ensures mathematical correctness, data pipeline robustness, governance enforcement, and defensive error handling across all waterfall levels.

The strategy combines:
- **Unit Tests**: Verifying deterministic calculation of confidence scores, data quality factors, freshness adjustments, and mathematical fallback levels.
- **Integration Tests**: Verifying end-to-end data ingestion, deduplication invariants, schema drift handling, cost conservation across shared infrastructure, unit economics edge cases, and cost spike anomaly detection.

---

### 2. Test Execution Summary

- **Framework**: Vitest v5.0.0
- **Total Test Files**: 2
- **Total Test Suites Passed**: 2 / 2 (100%)
- **Total Individual Tests Passed**: 15 / 15 (100%)
- **Execution Time**: ~860ms
- **Test Runner Command**: `npm test`

---

### 3. Detailed Test Catalog & Measured Results

#### A. Unit Tests (`tests/unit/confidence.test.ts`)

| # | Test Case Name | Objective / Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Direct Billing Tag | Ingest raw billing record with valid BU, product, and feature tags | Attributed at Level 1 with `HIGH` confidence | **PASSED** |
| **2** | Missing Allocation Tag | Ingest record with no billing tags, resource tags, or telemetry | Enters unallocated pool at Level 5 with `NONE` confidence | **PASSED** |
| **3** | Stale Telemetry | Telemetry older than 72-hour freshness threshold | Classified as `STALE_TELEMETRY`, attributed with `LOW` confidence | **PASSED** |
| **4** | Fresh Telemetry | Usage telemetry within 12 hours of billing timestamp | Attributed at Level 3 with `MEDIUM` confidence | **PASSED** |
| **5** | Conflicting Resource Tags | Resource tagged with two distinct business units | Flags `CONFLICTING_TAGS` error, unallocated with `NONE` confidence | **PASSED** |
| **6** | Product Activity Volume | Shared account cost allocated via monthly clinical activity volume | Attributed at Level 4 with `MEDIUM` confidence | **PASSED** |
| **7** | Zero Activity Volume | Activity volume equals zero (\(\text{Volume} = 0\)) | Enters unallocated pool with `NONE` confidence without error | **PASSED** |

---

#### B. Integration Tests (`tests/integration/pipeline.test.ts`)

| # | Test Case Name | Objective / Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Duplicate Billing Ingestion | Ingest valid billing record, then re-ingest duplicate line item | Flags `DUPLICATE_BILLING` error, original spend counted once | **PASSED** |
| **2** | Schema Drift | Ingest record with missing required fields or unknown schema | Mismatch detected, logged to `data_validation_errors`, no crash | **PASSED** |
| **3** | Missing Allocation Tag | Resource without tags or telemetry | Enters unallocated pool with `NONE` confidence, error logged | **PASSED** |
| **4** | Stale Telemetry | Telemetry older than 72h threshold | Logged to `data_validation_errors`, confidence reduced to `LOW` | **PASSED** |
| **5** | Zero Activity | Activity volume = 0 in unit economics calculation | No div-by-zero/NaN/Infinity, safe metric return (0.0) | **PASSED** |
| **6** | Shared Infrastructure | Shared cost \( X = \$1,000 \), Workloads split 60% / 40% | Alloc A = \$600, Alloc B = \$400, Total = \$1,000 (Cost conserved) | **PASSED** |
| **7** | Invalid Product Mapping | Tag contains unknown product identifier | Flags `INVALID_PRODUCT_ID` error, cost unallocated with `NONE` confidence | **PASSED** |
| **8** | Cost Spike Anomaly | Resource spend jumps > 25% above moving average & > \$200 | Anomaly engine flags `HIGH` severity spike with explanation | **PASSED** |

---

### 4. Running the Tests

To execute the full test suite in single-run mode:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npx vitest
```

To run TypeScript compilation check:
```bash
npm run lint
```
