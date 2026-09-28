# Hospital Cloud Cost Attribution & Unit-Economics Dashboard
## Database Schema Documentation

### 1. Database Overview

The Hospital Cloud Cost Intelligence system uses an in-memory SQLite database powered by `sql.js` with disk persistence stored at `data/hospital_finops.sqlite`.

The database acts as the single source of truth for raw cloud billing exports, resource metadata, allocation tags, usage telemetry, product business activity metrics, allocation output results, governance audit trails, change management workflow requests, and FinOps experiment telemetry.

---

### 2. Table Schemas

#### 2.1 `business_units`
Stores the top-level hospital organizational units (e.g., Radiology, Emergency Services) that own clinical applications and cloud spend.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `name` | `TEXT` | `NOT NULL UNIQUE` | No | Business unit name (e.g., "Radiology") |
| `code` | `TEXT` | `NOT NULL UNIQUE` | No | Short code identifier (e.g., "BU-RAD") |
| `description` | `TEXT` | - | Yes | Overview of clinical scope |
| `lead_manager` | `TEXT` | - | Yes | Accountable lead executive/manager |

---

#### 2.2 `products`
Defines clinical software platforms and applications owned by hospital business units.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `name` | `TEXT` | `NOT NULL UNIQUE` | No | Product name (e.g., "Medical Imaging Platform") |
| `code` | `TEXT` | `NOT NULL UNIQUE` | No | Product code (e.g., "PROD-IMG") |
| `business_unit_id` | `INTEGER` | `FOREIGN KEY (business_units.id)` | Yes | Parent business unit ID |
| `description` | `TEXT` | - | Yes | Clinical platform description |

---

#### 2.3 `features`
Granular functional modules within a clinical product used for activity-proportional allocation.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `name` | `TEXT` | `NOT NULL` | No | Feature name (e.g., "Image Processing") |
| `code` | `TEXT` | `NOT NULL` | No | Feature code (e.g., "FEAT-IMG-02") |
| `product_id` | `INTEGER` | `FOREIGN KEY (products.id)` | Yes | Parent product ID |
| `description` | `TEXT` | - | Yes | Functional module description |

---

#### 2.4 `cloud_accounts`
Cloud provider accounts (AWS/Azure/GCP) hosting hospital infrastructure.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `account_id` | `TEXT` | `NOT NULL UNIQUE` | No | Cloud account ID (e.g., "ACCT-IMAGING", "ACCT-SHARED") |
| `name` | `TEXT` | `NOT NULL` | No | Descriptive account title |
| `provider` | `TEXT` | `NOT NULL` | No | Cloud provider ("AWS", "Azure", "GCP") |
| `environment` | `TEXT` | `NOT NULL` | No | Environment ("Production", "Staging", "Dev") |

---

#### 2.5 `resources`
Inventory of cloud infrastructure components and services.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `resource_id` | `TEXT` | `NOT NULL UNIQUE` | No | Unique cloud resource identifier |
| `cloud_account_id` | `TEXT` | `NOT NULL` | No | Cloud account identifier |
| `service` | `TEXT` | `NOT NULL` | No | Cloud service type (e.g., "Compute", "Object Storage") |
| `region` | `TEXT` | `NOT NULL` | No | Deployment region (e.g., "us-east-1") |
| `usage_type` | `TEXT` | - | Yes | Specific cloud usage metric |

---

#### 2.6 `billing_records`
Raw line-item cloud billing records ingested from cloud provider export files.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `billing_id` | `TEXT` | `NOT NULL UNIQUE` | No | Invoiced line item identifier |
| `billing_date` | `TEXT` | `NOT NULL` | No | Billing cycle date (YYYY-MM-DD) |
| `cloud_provider` | `TEXT` | `NOT NULL` | No | Cloud vendor |
| `cloud_account_id` | `TEXT` | `NOT NULL` | No | Source account ID |
| `service` | `TEXT` | `NOT NULL` | No | Service category |
| `region` | `TEXT` | `NOT NULL` | No | Cloud region |
| `resource_id` | `TEXT` | `NOT NULL` | No | Target resource ID |
| `usage_type` | `TEXT` | `NOT NULL` | No | Provider usage type |
| `cost` | `REAL` | `NOT NULL` | No | Raw billed cost in USD |
| `currency` | `TEXT` | `NOT NULL` | No | Currency code (USD) |
| `allocation_tag` | `TEXT` | - | Yes | Raw tag present on billing line item |
| `product_id` | `TEXT` | - | Yes | Raw product tag on billing export |
| `feature_id` | `TEXT` | - | Yes | Raw feature tag on billing export |
| `business_unit` | `TEXT` | - | Yes | Raw business unit tag on billing export |
| `billing_status` | `TEXT` | `NOT NULL` | No | Ingestion status ("BILLED", "PENDING") |
| `timestamp` | `TEXT` | `NOT NULL` | No | Ingestion timestamp (ISO-8601) |

---

#### 2.7 `usage_telemetry`
Infrastructure-level performance and usage telemetry for proportional allocation (Level 3).

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `telemetry_id` | `TEXT` | `NOT NULL UNIQUE` | No | Telemetry metric point ID |
| `timestamp` | `TEXT` | `NOT NULL` | No | Observation timestamp |
| `cloud_account_id` | `TEXT` | `NOT NULL` | No | Cloud account |
| `resource_id` | `TEXT` | `NOT NULL` | No | Resource monitored |
| `product_id` | `TEXT` | - | Yes | Associated product |
| `feature_id` | `TEXT` | - | Yes | Associated feature |
| `business_unit` | `TEXT` | - | Yes | Associated business unit |
| `usage_type` | `TEXT` | `NOT NULL` | No | Metric name (e.g., "CPU_Hours", "Storage_GB") |
| `usage_quantity` | `REAL` | `NOT NULL` | No | Measured volume |
| `unit` | `TEXT` | `NOT NULL` | No | Unit of measurement |
| `freshness_timestamp` | `TEXT` | `NOT NULL` | No | Timestamp when scraper recorded metric |

---

#### 2.8 `allocation_tags`
Cloud governance tags managed via Infrastructure-as-Code (Terraform) or manual FinOps reviews (Level 2).

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `resource_id` | `TEXT` | `NOT NULL` | No | Tagged resource ID |
| `cloud_account_id` | `TEXT` | `NOT NULL` | No | Account ID |
| `business_unit` | `TEXT` | `NOT NULL` | No | Assigned business unit |
| `product_id` | `TEXT` | `NOT NULL` | No | Assigned product |
| `feature_id` | `TEXT` | `NOT NULL` | No | Assigned feature |
| `allocation_status` | `TEXT` | `NOT NULL` | No | Tag status ("TAGGED", "REVIEW") |
| `tag_last_updated` | `TEXT` | `NOT NULL` | No | Modification timestamp |
| `tag_source` | `TEXT` | `NOT NULL` | No | Origin ("Terraform-IaC", "Manual-FinOps-Approved") |

---

#### 2.9 `product_activity`
Application workload business metrics (images processed, portal sessions) for shared-tier allocation (Level 4).

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `activity_id` | `TEXT` | `NOT NULL UNIQUE` | No | Activity record ID |
| `date` | `TEXT` | `NOT NULL` | No | Activity date (YYYY-MM-DD) |
| `business_unit` | `TEXT` | `NOT NULL` | No | Associated business unit |
| `product_id` | `TEXT` | `NOT NULL` | No | Associated product |
| `feature_id` | `TEXT` | `NOT NULL` | No | Associated feature |
| `activity_type` | `TEXT` | `NOT NULL` | No | Clinical activity type |
| `activity_volume` | `REAL` | `NOT NULL` | No | Metric volume (e.g. 15,000 DICOM images) |
| `unit` | `TEXT` | `NOT NULL` | No | Unit name |

---

#### 2.10 `allocation_results`
Output generated by the 5-tiered Allocation Waterfall engine.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `allocation_id` | `TEXT` | `NOT NULL UNIQUE` | No | Generated allocation result ID |
| `billing_id` | `TEXT` | `NOT NULL` | No | Originating billing record ID |
| `business_unit` | `TEXT` | `NOT NULL` | No | Attributed business unit |
| `product_id` | `TEXT` | `NOT NULL` | No | Attributed product |
| `feature_id` | `TEXT` | `NOT NULL` | No | Attributed feature |
| `allocated_amount` | `REAL` | `NOT NULL` | No | Dollar amount attributed (USD) |
| `allocation_method` | `TEXT` | `NOT NULL` | No | Method (`DIRECT`, `RESOURCE_TAG`, `USAGE_BASED`, `ACTIVITY_BASED`, `UNALLOCATED`) |
| `confidence` | `TEXT` | `NOT NULL` | No | Confidence rating (`HIGH`, `MEDIUM`, `LOW`, `NONE`) |
| `evidence_source` | `TEXT` | `NOT NULL` | No | Evidence provenance |
| `evidence_timestamp` | `TEXT` | `NOT NULL` | No | Timestamp of underlying evidence |
| `allocation_status` | `TEXT` | `NOT NULL` | No | Status (`ALLOCATED`, `UNALLOCATED`, `REVIEW_REQUIRED`) |
| `reason` | `TEXT` | `NOT NULL` | No | Detailed justification explanation |

---

#### 2.11 `audit_logs`
Immutable compliance audit trail tracking all governance actions, approvals, and rollbacks.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `audit_id` | `TEXT` | `NOT NULL UNIQUE` | No | Unique audit log ID |
| `timestamp` | `TEXT` | `NOT NULL` | No | Event timestamp (ISO-8601) |
| `user` | `TEXT` | `NOT NULL` | No | User principal executing action |
| `role` | `TEXT` | `NOT NULL` | No | RBAC role (`EXECUTIVE`, `FINOPS_ANALYST`, `PRODUCT_OWNER`) |
| `action` | `TEXT` | `NOT NULL` | No | Action code |
| `object_type` | `TEXT` | `NOT NULL` | No | Entity type modified |
| `object_id` | `TEXT` | `NOT NULL` | No | Target entity ID |
| `old_value` | `TEXT` | - | Yes | Pre-change value |
| `new_value` | `TEXT` | - | Yes | Post-change value |
| `reason` | `TEXT` | - | Yes | Business rationale |
| `status` | `TEXT` | `NOT NULL` | No | Result status |
| `impact_amount` | `REAL` | `NOT NULL DEFAULT 0` | No | Financial cost impact in USD |

---

#### 2.12 `change_requests`
Two-person control governance requests for modifying resource allocation tags.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `change_id` | `TEXT` | `NOT NULL UNIQUE` | No | Change request ID (e.g., "CR-DEMO-001") |
| `requester` | `TEXT` | `NOT NULL` | No | User submitting request |
| `role` | `TEXT` | `NOT NULL` | No | Requester RBAC role |
| `product` | `TEXT` | `NOT NULL` | No | Target product |
| `business_unit` | `TEXT` | `NOT NULL` | No | Target business unit |
| `resource_id` | `TEXT` | `NOT NULL` | No | Resource ID to reassign |
| `old_allocation` | `TEXT` | `NOT NULL` | No | Previous mapping string |
| `proposed_allocation` | `TEXT` | `NOT NULL` | No | Proposed mapping string |
| `cost_impact` | `REAL` | `NOT NULL` | No | Financial impact ($) |
| `reason` | `TEXT` | `NOT NULL` | No | Reassignment rationale |
| `created_at` | `TEXT` | `NOT NULL` | No | Request creation timestamp |
| `status` | `TEXT` | `NOT NULL` | No | Workflow status (`PROPOSED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `APPLIED`, `ROLLED_BACK`) |
| `reviewer` | `TEXT` | - | Yes | Approving/rejecting FinOps analyst |
| `reviewed_at` | `TEXT` | - | Yes | Approval/rejection timestamp |
| `previous_state_json` | `TEXT` | - | Yes | Serialized JSON snapshot for rollback |

---

#### 2.13 `experiments`
Records results of baseline vs treatment FinOps allocation experiments.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `run_at` | `TEXT` | `NOT NULL` | No | Execution timestamp |
| `baseline_total_cost` | `REAL` | `NOT NULL` | No | Total baseline cost ($) |
| `baseline_allocated_cost` | `REAL` | `NOT NULL` | No | Baseline allocated amount ($) |
| `baseline_unallocated_cost` | `REAL` | `NOT NULL` | No | Baseline unallocated amount ($) |
| `baseline_allocation_pct` | `REAL` | `NOT NULL` | No | Baseline allocation rate (%) |
| `treatment_total_cost` | `REAL` | `NOT NULL` | No | Total treatment cost ($) |
| `treatment_allocated_cost` | `REAL` | `NOT NULL` | No | Treatment allocated amount ($) |
| `treatment_unallocated_cost` | `REAL` | `NOT NULL` | No | Treatment unallocated amount ($) |
| `treatment_allocation_pct` | `REAL` | `NOT NULL` | No | Treatment allocation rate (%) |
| `target_allocation_pct` | `REAL` | `NOT NULL DEFAULT 85.0` | No | FinOps target rate (%) |
| `pp_improvement` | `REAL` | `NOT NULL` | No | Percentage point improvement |
| `rel_improvement_pct` | `REAL` | `NOT NULL` | No | Relative improvement (%) |
| `status` | `TEXT` | `NOT NULL` | No | Run status ("COMPLETED") |

---

#### 2.14 `data_validation_errors`
Catches edge-case anomalies, duplicate billing items, stale telemetry, missing tags, and invalid product tags.

| Column | Data Type | Constraints | Nullable | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | No | Internal surrogate key |
| `record_id` | `TEXT` | `NOT NULL` | No | Identifier of affected record |
| `source` | `TEXT` | `NOT NULL` | No | Source table name |
| `field` | `TEXT` | - | Yes | Specific field triggering issue |
| `issue_type` | `TEXT` | `NOT NULL` | No | Error classification (`DUPLICATE_BILLING`, `MISSING_ALLOCATION_TAG`, `STALE_TELEMETRY`, `INVALID_PRODUCT_ID`, `CONFLICTING_TAGS`) |
| `reason` | `TEXT` | `NOT NULL` | No | Diagnostic explanation |
| `affected_cost` | `REAL` | `DEFAULT 0` | Yes | Dollar amount impacted |
| `timestamp` | `TEXT` | `NOT NULL` | No | Detection timestamp |

---

### 3. Database Indexes

- `idx_billing_resource`: On `billing_records(resource_id)`
- `idx_billing_bu`: On `billing_records(business_unit)`
- `idx_billing_product`: On `billing_records(product_id)`
- `idx_alloc_results_billing`: On `allocation_results(billing_id)`
- `idx_alloc_tags_resource`: On `allocation_tags(resource_id)`
- `idx_telemetry_resource`: On `usage_telemetry(resource_id)`

---

### 4. Data Flow Architecture

```
[ Cloud Billing Exports ] ──> billing_records
                                    │
                                    ▼
                          [ Allocation Waterfall ]
                            ├── Level 1: Direct Billing Tags
                            ├── Level 2: allocation_tags (IaC)
                            ├── Level 3: usage_telemetry
                            ├── Level 4: product_activity
                            └── Level 5: Unallocated Pool
                                    │
                                    ├───> allocation_results
                                    └───> data_validation_errors
```
