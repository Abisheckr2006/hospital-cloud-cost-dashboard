# Hospital Cloud Cost Attribution & Unit-Economics Dashboard
## API Endpoint Contracts Documentation

### Overview

Base API Path: `/api`  
Data Format: `JSON`  
Server: Express HTTP Server

---

### Endpoints Reference

#### 1. System Health Check
`GET /api/health`

- **Purpose**: Verify backend API server health and timestamp.
- **Authentication / RBAC**: None (Public)
- **Request Parameters**: None
- **Response HTTP 200**:
```json
{
  "status": "ok",
  "service": "Hospital Cloud Cost Intelligence API",
  "timestamp": "2026-09-28T14:40:00.000Z"
}
```

---

#### 2. Dashboard Executive Summary & KPI Overview
`GET /api/dashboard`

- **Purpose**: Retrieve high-level FinOps KPIs, allocation rates, spend breakdowns, monthly trends, confidence distributions, and top cost drivers.
- **Authentication / RBAC**: Executive, FinOps Analyst, Product Owner
- **Query Parameters**:
  - `bu` (optional): Filter by business unit name (e.g. `Radiology`)
  - `product` (optional): Filter by product name (e.g. `Medical Imaging Platform`)
  - `account` (optional): Filter by cloud account ID (e.g. `ACCT-IMAGING`)
  - `service` (optional): Filter by cloud service (e.g. `Compute`)
  - `dateRange` (optional): Year-Month prefix filter (e.g. `2026-05`)
- **Response HTTP 200**:
```json
{
  "kpis": {
    "totalCost": 724892.6,
    "allocatedCost": 671034.6,
    "unallocatedCost": 53858.0,
    "allocationRate": 92.57,
    "targetAllocationPct": 85.0,
    "gapToTarget": -7.57,
    "freshnessStatus": "FRESH",
    "dataQualityScore": 98.2,
    "monthlySavingsOpportunity": 38420.0,
    "annualSavingsOpportunity": 461040.0,
    "nextMonthForecast": 145200.0,
    "forecastConfidencePct": 87
  },
  "spendByBU": [
    { "business_unit": "Radiology", "cost": 312450.0 }
  ],
  "spendByProduct": [
    { "product_id": "Medical Imaging Platform", "cost": 312450.0 }
  ],
  "spendByFeature": [
    { "feature_id": "Image Storage", "cost": 145200.0 }
  ],
  "spendByService": [
    { "service": "Compute", "cost": 289400.0 }
  ],
  "spendByAccount": [
    { "cloud_account_id": "ACCT-IMAGING", "cost": 312450.0 }
  ],
  "monthlyTrend": [
    { "month": "2026-05", "total": 142000.0, "allocated": 131500.0, "unallocated": 10500.0 }
  ],
  "confidenceBreakdown": [
    { "confidence": "HIGH", "cost": 498200.0, "count": 1450 }
  ],
  "methodBreakdown": [
    { "allocation_method": "DIRECT", "cost": 420000.0, "count": 1200 }
  ],
  "topCostDrivers": [
    {
      "resource_id": "res-img-comp-001",
      "service": "Compute",
      "bu": "Radiology",
      "prod": "Medical Imaging Platform",
      "total_cost": 24800.0
    }
  ]
}
```

---

#### 3. FinOps Forecasting
`GET /api/forecasting`

- **Purpose**: Retrieve historical trend and predictive run-rate budget forecast.
- **Authentication / RBAC**: All roles
- **Response HTTP 200**:
```json
{
  "historical": [
    { "month": "2026-05", "actual": 138000, "forecast": 136000 },
    { "month": "2026-06", "actual": 0, "forecast": 145200 }
  ],
  "forecastConfidence": 87,
  "nextMonthForecast": 145200,
  "forecastStatus": "ABOVE",
  "budget": 138500,
  "variancePct": 4.8
}
```

---

#### 4. Cost Optimization Opportunities
`GET /api/optimization`

- **Purpose**: Retrieve actionable cost-saving recommendations (idle instances, oversized compute, cold storage tiering).
- **Authentication / RBAC**: All roles
- **Response HTTP 200**:
```json
{
  "potentialMonthlySavings": 38420,
  "potentialAnnualSavings": 461040,
  "items": [
    {
      "id": "OPT-001",
      "title": "Idle GPU Resource Sizing",
      "category": "IDLE_RESOURCE",
      "resource_id": "res-analytics-db-003",
      "current_cost": 10531,
      "estimated_savings": 3200,
      "utilization_pct": 18,
      "priority": "CRITICAL",
      "business_unit": "Analytics & Research",
      "product": "Population Health Analytics",
      "recommendation": "Downsize GPU instance or implement automated off-peak scheduling",
      "status": "NEW"
    }
  ]
}
```

---

#### 5. Raw Cloud Billing Export Records
`GET /api/costs`

- **Purpose**: Query raw line-item cloud billing records.
- **Authentication / RBAC**: FinOps Analyst, Executive
- **Response HTTP 200**: Array of `BillingRecord` objects (up to 500 items).

---

#### 6. Business Units Attribution Summary
`GET /api/business-units`

- **Purpose**: List hospital business units with allocated vs unallocated spend, allocation rates, and owned products.
- **Authentication / RBAC**: All roles
- **Response HTTP 200**:
```json
[
  {
    "name": "Radiology",
    "code": "BU-RAD",
    "description": "Diagnostic imaging, MRI, CT, and X-ray storage and AI compute",
    "lead_manager": "Dr. Sarah Jenkins",
    "total_cost": 312450.0,
    "allocated_cost": 305000.0,
    "unallocated_cost": 7450.0,
    "product_count": 1,
    "allocation_rate": 97.6
  }
]
```

---

#### 7. Clinical Products Summary
`GET /api/products`

- **Purpose**: List products with cost totals and nested features breakdown.
- **Authentication / RBAC**: All roles
- **Response HTTP 200**:
```json
[
  {
    "name": "Medical Imaging Platform",
    "code": "PROD-IMG",
    "description": "DICOM image store, rendering pipeline, and PACS integration",
    "business_unit": "Radiology",
    "total_cost": 312450.0,
    "feature_count": 4,
    "allocation_records_count": 850,
    "features": [
      { "name": "Image Storage", "code": "FEAT-IMG-03", "cost": 145200.0 }
    ]
  }
]
```

---

#### 8. Cost Allocation Line Items & Filtering
`GET /api/allocation`

- **Purpose**: Query paginated allocation results with filter criteria.
- **Query Parameters**:
  - `bu`: Business Unit filter
  - `product`: Product filter
  - `method`: Allocation Method filter (`DIRECT`, `RESOURCE_TAG`, `USAGE_BASED`, `ACTIVITY_BASED`, `UNALLOCATED`)
  - `confidence`: Confidence Level filter (`HIGH`, `MEDIUM`, `LOW`, `NONE`)
  - `status`: Status filter (`ALLOCATED`, `UNALLOCATED`, `REVIEW_REQUIRED`)
  - `search`: Keyword search on billing ID, resource ID, or reason
  - `limit`: Number of records (default: 100)
  - `offset`: Pagination offset (default: 0)
- **Response HTTP 200**:
```json
{
  "total": 1250,
  "items": [
    {
      "id": 1,
      "allocation_id": "ALLOC-000001",
      "billing_id": "BILL-202605-0001",
      "billing_date": "2026-05-01",
      "cloud_account_id": "ACCT-IMAGING",
      "service": "Compute",
      "resource_id": "res-img-comp-001",
      "usage_type": "c5.4xlarge-Hour",
      "cost": 245.5,
      "business_unit": "Radiology",
      "product_id": "Medical Imaging Platform",
      "feature_id": "Image Processing",
      "allocation_method": "DIRECT",
      "confidence": "HIGH",
      "allocation_status": "ALLOCATED",
      "evidence_source": "Billing Export Tags",
      "evidence_timestamp": "2026-05-01T00:00:00Z",
      "reason": "Directly mapped from validated billing export tags"
    }
  ]
}
```

---

#### 9. Allocation Item Details
`GET /api/allocation/:id`

- **Purpose**: Fetch details of a single allocation record by database ID or `allocation_id`.
- **Response HTTP 200**: Single allocation record object.
- **Response HTTP 404**: `{ "error": "Allocation record not found" }`

---

#### 10. Audit Evidence Panel
`GET /api/evidence/:id`

- **Purpose**: Retrieve full mathematical evidence chain for an allocation item, including raw billing records, IaC resource tags, usage telemetry, and product activity metrics.
- **Response HTTP 200**:
```json
{
  "allocation": {
    "allocation_id": "ALLOC-000001",
    "allocated_amount": 245.5,
    "allocation_method": "DIRECT",
    "confidence": "HIGH"
  },
  "evidence": {
    "method": "DIRECT",
    "confidence": "HIGH",
    "source": "Billing Export Tags",
    "timestamp": "2026-05-01T00:00:00Z",
    "reason": "Directly mapped from validated billing export tags",
    "rawBillingRecord": {
      "billing_id": "BILL-202605-0001",
      "date": "2026-05-01",
      "resource_id": "res-img-comp-001",
      "cost": 245.5,
      "tag": "bu:Radiology|prod:PROD-IMG|feat:FEAT-IMG-02"
    },
    "resourceTags": [],
    "usageTelemetry": [],
    "productActivity": []
  }
}
```

---

#### 11. Data Quality Health Report
`GET /api/data-quality`

- **Purpose**: Retrieve data quality statistics across all 4 datasets (Billing Records, Usage Telemetry, Resource Tags, Product Activity) and active validation errors.
- **Response HTTP 200**:
```json
{
  "reports": [
    {
      "dataset": "Billing Records",
      "total_records": 1250,
      "valid_records": 1210,
      "invalid_records": 0,
      "missing_records": 40,
      "duplicate_records": 0,
      "stale_records": 0,
      "affected_cost": 53858.0,
      "health_score": 96.8
    }
  ],
  "overallQualityScore": 98.2,
  "validationErrors": []
}
```

---

#### 12. Data Freshness Status
`GET /api/data-freshness`

- **Purpose**: Check freshness age (in hours) and status for all data sources against SLAs.
- **Response HTTP 200**:
```json
{
  "overallStatus": "FRESH",
  "items": [
    {
      "dataset": "Cloud Billing Exports",
      "last_updated": "2026-06-30T10:00:00Z",
      "age_hours": 2,
      "status": "FRESH",
      "affected_records": 1250,
      "affected_cost": 0
    }
  ]
}
```

---

#### 13. Workload Unit Economics
`GET /api/unit-economics`

- **Purpose**: Calculate cost per hospital workload unit (cost per image, cost per portal session, cost per clinical report, cost per backup GB) and monthly trends.
- **Response HTTP 200**:
```json
{
  "metrics": [
    {
      "product": "Medical Imaging Platform",
      "activity_type": "DICOM Image Studies Processed",
      "activity_volume": 450000,
      "cloud_cost": 312450.0,
      "cost_per_unit": 0.6943,
      "unit_name": "images",
      "allocation_confidence": "HIGH"
    }
  ],
  "monthlyTrend": [
    {
      "month": "2026-05",
      "imagingCostPerImage": 0.6943,
      "portalCostPerSession": 0.1245,
      "analyticsCostPerReport": 2.854,
      "backupCostPerGB": 0.0215,
      "loggingCostPerGB": 0.0105
    }
  ]
}
```

---

#### 14. FinOps Experimentation (A/B Test Engine)
`GET /api/experiment` or `POST /api/experiment/run`

- **Purpose**: Execute baseline (billing-only) vs treatment (multi-tiered attribution) experiment and return quantitative comparison metrics.
- **Response HTTP 200**:
```json
{
  "baseline": {
    "totalCost": 724892.6,
    "allocatedCost": 420000.0,
    "unallocatedCost": 304892.6,
    "allocationPct": 57.94,
    "unallocatedPct": 42.06
  },
  "treatment": {
    "totalCost": 724892.6,
    "allocatedCost": 671034.6,
    "unallocatedCost": 53858.0,
    "allocationPct": 92.57,
    "unallocatedPct": 7.43
  },
  "targetPct": 85.0,
  "gapToTarget": -7.57,
  "percentagePointImprovement": 34.63,
  "relativeImprovementPct": 59.77,
  "unallocatedCostReduction": 251034.6,
  "unallocatedReductionPct": 82.34,
  "costCoveragePct": 92.57,
  "breakdown": {
    "level1DirectCost": 420000.0,
    "level2ResourceTagCost": 185000.0,
    "level3UsageBasedCost": 42000.0,
    "level4ActivityBasedCost": 24034.6,
    "level5UnallocatedCost": 53858.0
  },
  "errorAnalysis": []
}
```

---

#### 15. Anomaly Detection
`GET /api/anomalies`

- **Purpose**: Detect resources with spend jumping > 25% above 5-month moving average and > $200 absolute increase.
- **Response HTTP 200**: Array of `AnomalyItem` objects.

---

#### 16. Optimization Recommendations
`GET /api/recommendations`

- **Purpose**: Generate automated cost reduction recommendations based on resource utilization and missing tag policies.
- **Response HTTP 200**: Array of `RecommendationItem` objects.

---

#### 17. Governance Audit Log
`GET /api/audit`

- **Purpose**: Retrieve immutable audit log history.
- **Response HTTP 200**: Array of `AuditLog` objects.

---

#### 18. Change Request Governance Workflow

##### a. List Change Requests
`GET /api/change-requests`
- **Response HTTP 200**: Array of `ChangeRequest` objects.

##### b. Create Change Request
`POST /api/change-requests`
- **Request Body**:
```json
{
  "requester": "sarah.jenkins@hospital.org",
  "role": "PRODUCT_OWNER",
  "product": "Medical Imaging Platform",
  "business_unit": "Radiology",
  "resource_id": "res-img-comp-004",
  "proposed_allocation": "Clinical Analytics / Clinical Analytics Platform",
  "reason": "GPU processing cluster reassigned for deep learning model training."
}
```
- **Response HTTP 201**: Newly created `ChangeRequest` object.
- **Response HTTP 400**: `{ "error": "Missing required change request parameters" }`

##### c. Approve Change Request
`POST /api/change-requests/:id/approve`
- **RBAC Constraint**: `FINOPS_ANALYST` role required.
- **Request Body**:
```json
{
  "reviewer": "marcus.finops@hospital.org",
  "role": "FINOPS_ANALYST"
}
```
- **Response HTTP 200**:
```json
{
  "success": true,
  "message": "Change request CR-DEMO-001 approved and applied successfully. Re-allocation completed.",
  "changeRequest": { ... }
}
```
- **Response HTTP 400**:
```json
{
  "success": false,
  "message": "Forbidden: Only FinOps Analyst can approve change requests"
}
```

##### d. Reject Change Request
`POST /api/change-requests/:id/reject`
- **RBAC Constraint**: `FINOPS_ANALYST` role required.
- **Request Body**:
```json
{
  "reviewer": "marcus.finops@hospital.org",
  "role": "FINOPS_ANALYST",
  "reason": "Invalid business unit mapping provided."
}
```
- **Response HTTP 200**: `{ "success": true, "message": "Change request CR-DEMO-001 has been rejected.", ... }`

##### e. Operational Rollback
`POST /api/change-requests/:id/rollback`
- **RBAC Constraint**: `FINOPS_ANALYST` role required.
- **Purpose**: Rollback an applied allocation change request to its prior tagged state and trigger engine re-allocation.
- **Request Body**:
```json
{
  "user": "marcus.finops@hospital.org",
  "role": "FINOPS_ANALYST",
  "reason": "Misallocation discovered during Q3 audit"
}
```
- **Response HTTP 200**:
```json
{
  "success": true,
  "message": "Rollback executed successfully for CR-DEMO-001. Restored mapping: Radiology / Medical Imaging Platform.",
  "changeRequest": { ... }
}
```
- **Response HTTP 400**: `{ "success": false, "message": "Cannot rollback request with status PROPOSED. Only APPLIED changes can be rolled back." }`
