# Hospital Cloud Cost Attribution & Unit-Economics Dashboard
## Entity-Relationship (ER) Diagram

### 1. Overview

The following Entity-Relationship diagram documents all entities and relationships in the `hospital_finops.sqlite` database schema.

---

### 2. Mermaid ER Diagram

```mermaid
erDiagram
    BUSINESS_UNITS ||--o{ PRODUCTS : owns
    PRODUCTS ||--o{ FEATURES : contains
    CLOUD_ACCOUNTS ||--o{ RESOURCES : hosts
    CLOUD_ACCOUNTS ||--o{ BILLING_RECORDS : bills
    RESOURCES ||--o{ BILLING_RECORDS : generates
    RESOURCES ||--o{ ALLOCATION_TAGS : configured_by
    RESOURCES ||--o{ USAGE_TELEMETRY : produces
    PRODUCTS ||--o{ PRODUCT_ACTIVITY : tracks
    BILLING_RECORDS ||--o{ ALLOCATION_RESULTS : attributes
    BILLING_RECORDS ||--o{ DATA_VALIDATION_ERRORS : flags
    RESOURCES ||--o{ CHANGE_REQUESTS : targets
    CHANGE_REQUESTS ||--o{ AUDIT_LOGS : records

    BUSINESS_UNITS {
        int id PK
        string name UK
        string code UK
        string description
        string lead_manager
    }

    PRODUCTS {
        int id PK
        string name UK
        string code UK
        int business_unit_id FK
        string description
    }

    FEATURES {
        int id PK
        string name
        string code
        int product_id FK
        string description
    }

    CLOUD_ACCOUNTS {
        int id PK
        string account_id UK
        string name
        string provider
        string environment
    }

    RESOURCES {
        int id PK
        string resource_id UK
        string cloud_account_id FK
        string service
        string region
        string usage_type
    }

    BILLING_RECORDS {
        int id PK
        string billing_id UK
        string billing_date
        string cloud_provider
        string cloud_account_id FK
        string service
        string region
        string resource_id FK
        string usage_type
        double cost
        string currency
        string allocation_tag
        string product_id
        string feature_id
        string business_unit
        string billing_status
        string timestamp
    }

    USAGE_TELEMETRY {
        int id PK
        string telemetry_id UK
        string timestamp
        string cloud_account_id FK
        string resource_id FK
        string product_id
        string feature_id
        string business_unit
        string usage_type
        double usage_quantity
        string unit
        string freshness_timestamp
    }

    ALLOCATION_TAGS {
        int id PK
        string resource_id FK
        string cloud_account_id FK
        string business_unit
        string product_id
        string feature_id
        string allocation_status
        string tag_last_updated
        string tag_source
    }

    PRODUCT_ACTIVITY {
        int id PK
        string activity_id UK
        string date
        string business_unit
        string product_id
        string feature_id
        string activity_type
        double activity_volume
        string unit
    }

    ALLOCATION_RESULTS {
        int id PK
        string allocation_id UK
        string billing_id FK
        string business_unit
        string product_id
        string feature_id
        double allocated_amount
        string allocation_method
        string confidence
        string evidence_source
        string evidence_timestamp
        string allocation_status
        string reason
    }

    AUDIT_LOGS {
        int id PK
        string audit_id UK
        string timestamp
        string user
        string role
        string action
        string object_type
        string object_id
        string old_value
        string new_value
        string reason
        string status
        double impact_amount
    }

    CHANGE_REQUESTS {
        int id PK
        string change_id UK
        string requester
        string role
        string product
        string business_unit
        string resource_id FK
        string old_allocation
        string proposed_allocation
        double cost_impact
        string reason
        string created_at
        string status
        string reviewer
        string reviewed_at
        string previous_state_json
    }

    EXPERIMENTS {
        int id PK
        string run_at
        double baseline_total_cost
        double baseline_allocated_cost
        double baseline_unallocated_cost
        double baseline_allocation_pct
        double treatment_total_cost
        double treatment_allocated_cost
        double treatment_unallocated_cost
        double treatment_allocation_pct
        double target_allocation_pct
        double pp_improvement
        double rel_improvement_pct
        string status
    }

    DATA_VALIDATION_ERRORS {
        int id PK
        string record_id
        string source
        string field
        string issue_type
        string reason
        double affected_cost
        string timestamp
    }
```

---

### 3. Entity Relationships Summary

1. **Organizational Hierarchy**:
   - `BUSINESS_UNITS` owns 1:N `PRODUCTS`.
   - `PRODUCTS` contains 1:N `FEATURES`.

2. **Infrastructure & Billing**:
   - `CLOUD_ACCOUNTS` hosts 1:N `RESOURCES`.
   - `CLOUD_ACCOUNTS` generates 1:N `BILLING_RECORDS`.
   - `RESOURCES` relates 1:N to `BILLING_RECORDS`, `ALLOCATION_TAGS`, `USAGE_TELEMETRY`, and `CHANGE_REQUESTS`.

3. **Attribution Engine Outputs**:
   - `BILLING_RECORDS` maps 1:N to `ALLOCATION_RESULTS` (each line item is attributed to business units/products).
   - `BILLING_RECORDS` and `ALLOCATION_TAGS` generate `DATA_VALIDATION_ERRORS` for anomalies, duplicate billing, stale telemetry, missing tags, or conflicting tags.

4. **Governance & Audit**:
   - `CHANGE_REQUESTS` targets specific resources and produces `AUDIT_LOGS` entries for approval, rejection, and operational rollback.
