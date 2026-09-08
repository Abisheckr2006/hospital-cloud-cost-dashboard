# Hospital Cloud Cost Attribution — Data Dictionary

## Overview
This document describes the schema, data types, constraints, and definitions for all datasets used in the Hospital Cloud Cost Attribution & Unit-Economics FinOps System.

> **Privacy & Ethics Statement:**
> All data in these datasets is 100% synthetically generated.
> - Absolutely NO real hospital data.
> - NO real patient names, IDs, dates of birth, or Social Security numbers.
> - NO Protected Health Information (PHI) or medical records.
> - NO clinical diagnoses or procedure records.
> - NO real cloud account credentials, private keys, or API secrets.
> - NO real hospital enterprise identifiers.

---

## 1. `billing_exports.csv` / Table `billing_records`
Primary monthly cloud provider billing exports (AWS / Multi-cloud format).

| Column | Type | Nullable | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `billing_id` | String (PK) | No | Unique billing line-item identifier | `BILL-2026-00102` |
| `billing_date` | Date (YYYY-MM-DD) | No | Date of billing line item | `2026-04-15` |
| `cloud_provider` | String | No | Cloud infrastructure vendor | `AWS` |
| `cloud_account_id` | String (FK) | No | Linked cloud account identifier | `ACCT-IMAGING` |
| `service` | String | No | High-level cloud service family | `Object Storage`, `Compute` |
| `region` | String | No | Cloud region deployment | `us-east-1` |
| `resource_id` | String (FK) | No | Cloud resource unique identifier | `res-img-storage-001` |
| `usage_type` | String | No | Specific billing rate descriptor | `Standard-Storage-GB` |
| `cost` | Float | No | Net billed amount in USD | `482.50` |
| `currency` | String | No | Currency ISO code | `USD` |
| `allocation_tag` | String | Yes | Raw provider tag string (if present) | `env=prod;bu=Radiology` |
| `product_id` | String | Yes | Directly mapped product (Level 1) | `Medical Imaging Platform` |
| `feature_id` | String | Yes | Directly mapped feature (Level 1) | `Image Storage` |
| `business_unit` | String | Yes | Directly mapped business unit (Level 1)| `Radiology` |
| `billing_status` | String | No | Finalized or estimated billing status | `FINAL` |
| `timestamp` | ISO-8601 | No | Record generation timestamp | `2026-04-15T23:59:59Z` |

---

## 2. `usage_telemetry.csv` / Table `usage_telemetry`
Operational resource telemetry for shared or multi-tenant infrastructure.

| Column | Type | Nullable | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `telemetry_id` | String (PK) | No | Unique telemetry metric identifier | `TEL-00045` |
| `timestamp` | ISO-8601 | No | Timestamp of telemetry sampling | `2026-04-15T12:00:00Z` |
| `cloud_account_id` | String (FK) | No | Cloud account hosting the resource | `ACCT-SHARED` |
| `resource_id` | String (FK) | No | Cloud resource monitored | `res-shared-k8s-cluster-01` |
| `product_id` | String | No | Product consuming resource capacity | `Medical Imaging Platform` |
| `feature_id` | String | No | Feature consuming resource capacity | `Image Processing` |
| `business_unit` | String | No | Attributed business unit | `Radiology` |
| `usage_type` | String | No | Metric name / consumption metric | `Shared-K8s-Node-Hours` |
| `usage_quantity` | Float | No | Metric quantity consumed | `450.0` |
| `unit` | String | No | Unit of measurement | `Node-Hours`, `GB` |
| `freshness_timestamp` | ISO-8601 | No | Telemetry pipeline sync timestamp | `2026-04-15T12:05:00Z` |

---

## 3. `allocation_tags.csv` / Table `allocation_tags`
Enterprise cloud governance tags synchronized from Infrastructure-as-Code (Terraform) and cloud resource metadata.

| Column | Type | Nullable | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `resource_id` | String (FK) | No | Cloud resource unique identifier | `res-portal-app-002` |
| `cloud_account_id` | String | No | Cloud account hosting the resource | `ACCT-PORTAL` |
| `business_unit` | String | No | Governance assigned Business Unit | `Patient Portal` |
| `product_id` | String | No | Governance assigned Product | `Patient Portal` |
| `feature_id` | String | No | Governance assigned Feature | `Patient Login` |
| `allocation_status` | String | No | Tag state (`TAGGED`, `INVALID_MAPPING`) | `TAGGED` |
| `tag_last_updated` | ISO-8601 | No | When tag was last applied | `2026-04-15T14:30:00Z` |
| `tag_source` | String | No | Originating source of tag | `AWS-Tags-Automation` |

---

## 4. `product_activity.csv` / Table `product_activity`
Application-level business throughput metrics used for Unit-Economics calculations.

| Column | Type | Nullable | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `activity_id` | String (PK) | No | Unique activity record identifier | `ACT-00012` |
| `date` | Date (YYYY-MM-DD) | No | Month / Date of activity | `2026-04-01` |
| `business_unit` | String | No | Accountable business unit | `Radiology` |
| `product_id` | String | No | Accountable product | `Medical Imaging Platform` |
| `feature_id` | String | No | Associated feature | `Image Processing` |
| `activity_type` | String | No | Business volume metric name | `images processed` |
| `activity_volume` | Float | No | Total volume during the cycle | `124500` |
| `unit` | String | No | Business measurement unit | `images`, `sessions`, `reports`, `GB` |

---

## 5. `synthetic_resources.csv` / Table `resources`
Inventory of cloud resources across all accounts and services.

| Column | Type | Description |
| :--- | :--- | :--- |
| `resource_id` | String (PK) | Cloud resource ARN/ID |
| `cloud_account_id` | String | Parent cloud account |
| `service` | String | Cloud service category |
| `region` | String | Deployment region |
| `usage_type` | String | Primary usage unit |
