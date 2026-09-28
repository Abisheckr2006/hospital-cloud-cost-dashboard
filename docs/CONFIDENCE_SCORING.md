# Hospital Cloud Cost Attribution & Unit-Economics Dashboard
## Mathematical Model & Confidence Scoring Formulation

### 1. Overview & General Mathematical Formulation

The Hospital FinOps Attribution Engine uses a multi-tier allocation waterfall to map cloud costs down to clinical business units, products, and features. To ensure governance integrity and financial transparency, every allocated line item is assigned an explicit **Confidence Level** (\(\mathbf{HIGH}\), \(\mathbf{MEDIUM}\), \(\mathbf{LOW}\), or \(\mathbf{NONE}\)).

The final confidence score \( C_{\text{final}} \in [0.0, 1.0] \) is determined by the multiplicative product of four underlying factors:

\[
C_{\text{final}} = C_{\text{base}} \times Q \times F \times E
\]

Where:
- **\( C_{\text{base}} \)**: Base confidence factor determined by the attribution waterfall level.
- **\( Q \)**: Data Quality factor (\(1.0\) for clean metadata; \(0.0\) for conflicting tags or invalid product IDs).
- **\( F \)**: Telemetry Freshness factor (\(1.0\) for fresh data \(\le 72\text{h}\); \(0.5\) for stale telemetry \(> 72\text{h}\)).
- **\( E \)**: Evidence Completeness factor (\(1.0\) when usage/activity volume \( > 0 \); \(0.0\) when volume is zero or missing).

---

### 2. Confidence Level Categorical Mapping

The numerical score \( C_{\text{final}} \) maps deterministically into the categorical confidence enum:

| Numerical Range | Categorical Confidence | Enum Value | Description |
| :--- | :--- | :--- | :--- |
| \( 0.90 \le C_{\text{final}} \le 1.00 \) | **HIGH** | `ConfidenceLevel.High` | Valid direct billing export tag or single IaC resource tag |
| \( 0.60 \le C_{\text{final}} < 0.90 \) | **MEDIUM** | `ConfidenceLevel.Medium` | Fresh usage telemetry or product business activity split |
| \( 0.10 \le C_{\text{final}} < 0.60 \) | **LOW** | `ConfidenceLevel.Low` | Usage telemetry older than 72-hour freshness threshold |
| \( C_{\text{final}} < 0.10 \) | **NONE** | `ConfidenceLevel.None` | Conflicting tags, invalid product IDs, or missing evidence |

---

### 3. Detailed Formulation by Waterfall Level

#### LEVEL 1 — DIRECT ACCOUNT & BILLING TAGS
- **Mechanism**: Raw billing export line item contains valid `business_unit`, `product_id`, and `feature_id`.
- **Formulas**:
  - Allocated Cost:
    \[
    \text{Allocation} = \text{BilledCost}
    \]
  - Parameters: \( C_{\text{base}} = 1.0 \), \( Q = 1.0 \), \( F = 1.0 \), \( E = 1.0 \)
  - Final Confidence Score:
    \[
    C_{\text{final}} = 1.0 \times 1.0 \times 1.0 \times 1.0 = 1.00 \implies \mathbf{HIGH}
    \]
- **Evidence Provenance**: `"Billing Export Tags"`

---

#### LEVEL 2 — RESOURCE GOVERNANCE TAGS (IaC)
- **Mechanism**: Dedicated resource has resource tags configured in `allocation_tags`.
- **Formulas & Edge Cases**:
  - **Case 2a: Valid Single Resource Tag**
    - Parameters: \( C_{\text{base}} = 1.0 \), \( Q = 1.0 \), \( F = 1.0 \), \( E = 1.0 \)
    - \( C_{\text{final}} = 1.00 \implies \mathbf{HIGH} \)
  - **Case 2b: Conflicting Resource Tags**
    - Condition: Multiple resource tags with distinct `business_unit` values.
    - Quality Factor: \( Q = 0.0 \) (Triggers `CONFLICTING_TAGS` error).
    - \( C_{\text{final}} = 1.0 \times 0.0 \times 1.0 \times 1.0 = 0.00 \implies \mathbf{NONE} \)
    - Status: Entered into Unallocated Pool with `REVIEW_REQUIRED`.
  - **Case 2c: Invalid Product ID Tag**
    - Condition: Resource tag contains unknown product ID.
    - Quality Factor: \( Q = 0.0 \) (Triggers `INVALID_PRODUCT_ID` error).
    - \( C_{\text{final}} = 1.0 \times 0.0 \times 1.0 \times 1.0 = 0.00 \implies \mathbf{NONE} \)
    - Status: Entered into Unallocated Pool with `REVIEW_REQUIRED`.

---

#### LEVEL 3 — USAGE TELEMETRY ALLOCATION
- **Mechanism**: Shared cloud resources split cost proportionally based on observed system telemetry in `usage_telemetry`.
- **Proportional Allocation Formula**:
  \[
  \text{Allocation}_i = \text{BilledCost} \times \frac{\text{Usage}_i}{\sum_{j=1}^{N} \text{Usage}_j}
  \]
  Subject to conservation of total cost:
  \[
  \sum_{i=1}^{N} \text{Allocation}_i = \text{BilledCost}
  \]
- **Freshness & Confidence Adjustments**:
  - Base Confidence: \( C_{\text{base}} = 0.75 \) (`MEDIUM`).
  - **Fresh Telemetry** (\( \Delta t = t_{\text{billing}} - t_{\text{telemetry}} \le 72 \text{ hours} \)):
    - \( F = 1.0 \implies C_{\text{final}} = 0.75 \times 1.0 \times 1.0 \times 1.0 = 0.75 \implies \mathbf{MEDIUM} \)
  - **Stale Telemetry** (\( \Delta t > 72 \text{ hours} \)):
    - Freshness Factor: \( F = 0.5 \) (Triggers `STALE_TELEMETRY` error).
    - \( C_{\text{final}} = 0.75 \times 1.0 \times 0.5 \times 1.0 = 0.375 \implies \mathbf{LOW} \)

---

#### LEVEL 4 — PRODUCT BUSINESS ACTIVITY ALLOCATION
- **Mechanism**: Shared cloud accounts (e.g. `ACCT-SHARED`) without telemetry split costs based on monthly clinical workload activity volume in `product_activity` (e.g., DICOM images processed, portal logins).
- **Proportional Activity Formula**:
  \[
  \text{Allocation}_i = \text{BilledCost} \times \frac{\text{ActivityVolume}_i}{\sum_{j=1}^{K} \text{ActivityVolume}_j}
  \]
- **Confidence Formulation**:
  - Base Confidence: \( C_{\text{base}} = 0.70 \).
  - Parameters: \( Q = 1.0 \), \( F = 1.0 \), \( E = 1.0 \).
  - \( C_{\text{final}} = 0.70 \times 1.0 \times 1.0 \times 1.0 = 0.70 \implies \mathbf{MEDIUM} \)

---

#### LEVEL 5 — UNALLOCATED POOL
- **Mechanism**: Default fallback when no valid billing tags, resource tags, usage telemetry, or activity metrics exist.
- **Formulas**:
  - Parameters: \( C_{\text{base}} = 0.0 \), \( Q = 0.0 \), \( F = 0.0 \), \( E = 0.0 \).
  - \( C_{\text{final}} = 0.00 \implies \mathbf{NONE} \).
- **Governance Requirement**: Unallocated costs are never arbitrary guesses. They trigger a `MISSING_ALLOCATION_TAG` entry in `data_validation_errors` for FinOps remediation.

---

### 4. Summary Table of Confidence Ratings

| Level | Method Name | Data Quality (\(Q\)) | Freshness (\(F\)) | Evidence (\(E\)) | Final Score (\(C_{\text{final}}\)) | Final Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Direct Billing Tag | 1.0 | 1.0 | 1.0 | 1.00 | **HIGH** |
| **Level 2** | Resource Tag (IaC) | 1.0 | 1.0 | 1.0 | 1.00 | **HIGH** |
| **Level 2** | Conflicting Tags | 0.0 | 1.0 | 1.0 | 0.00 | **NONE** |
| **Level 2** | Invalid Product Tag | 0.0 | 1.0 | 1.0 | 0.00 | **NONE** |
| **Level 3** | Fresh Telemetry (\(\le 72\text{h}\)) | 1.0 | 1.0 | 1.0 | 0.75 | **MEDIUM** |
| **Level 3** | Stale Telemetry (\(> 72\text{h}\)) | 1.0 | 0.5 | 1.0 | 0.38 | **LOW** |
| **Level 4** | Product Activity Volume | 1.0 | 1.0 | 1.0 | 0.70 | **MEDIUM** |
| **Level 5** | Unallocated Fallback | 0.0 | 0.0 | 0.0 | 0.00 | **NONE** |
