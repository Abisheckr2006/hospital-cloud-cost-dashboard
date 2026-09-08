// Domain types for Hospital Cloud Cost Attribution & FinOps System

export enum BusinessUnitName {
  Radiology = 'Radiology',
  EmergencyServices = 'Emergency Services',
  ClinicalAnalytics = 'Clinical Analytics',
  PatientPortal = 'Patient Portal',
  Infrastructure = 'Infrastructure',
  Research = 'Research',
}

export enum ProductName {
  MedicalImaging = 'Medical Imaging Platform',
  PatientPortal = 'Patient Portal',
  ClinicalAnalytics = 'Clinical Analytics Platform',
  BackupRecovery = 'Backup & Recovery',
  HospitalLogging = 'Hospital Logging Platform',
}

export enum FeatureName {
  // Medical Imaging
  ImageUpload = 'Image Upload',
  ImageProcessing = 'Image Processing',
  ImageStorage = 'Image Storage',
  ImageRetrieval = 'Image Retrieval',

  // Patient Portal
  PatientLogin = 'Patient Login',
  AppointmentManagement = 'Appointment Management',
  Notifications = 'Notifications',
  DocumentAccess = 'Document Access',

  // Clinical Analytics
  DataProcessing = 'Data Processing',
  ReportGeneration = 'Report Generation',
  AnalyticsQueries = 'Analytics Queries',

  // Backup & Recovery
  BackupCreation = 'Backup Creation',
  BackupStorage = 'Backup Storage',
  DisasterRecovery = 'Disaster Recovery',

  // Logging
  LogIngestion = 'Log Ingestion',
  LogStorage = 'Log Storage',
  LogAnalytics = 'Log Analytics',
}

export enum CloudAccountId {
  Imaging = 'ACCT-IMAGING',
  Portal = 'ACCT-PORTAL',
  Analytics = 'ACCT-ANALYTICS',
  Backup = 'ACCT-BACKUP',
  Logging = 'ACCT-LOGGING',
  Shared = 'ACCT-SHARED',
}

export enum CloudService {
  ObjectStorage = 'Object Storage',
  Compute = 'Compute',
  Database = 'Database',
  ContainerPlatform = 'Container Platform',
  DataTransfer = 'Data Transfer',
  Logging = 'Logging',
  Backup = 'Backup',
  Serverless = 'Serverless',
}

export enum AllocationMethod {
  Direct = 'DIRECT',
  ResourceTag = 'RESOURCE_TAG',
  UsageBased = 'USAGE_BASED',
  ActivityBased = 'ACTIVITY_BASED',
  Unallocated = 'UNALLOCATED',
}

export enum ConfidenceLevel {
  High = 'HIGH',
  Medium = 'MEDIUM',
  Low = 'LOW',
  None = 'NONE',
}

export enum AllocationStatus {
  Allocated = 'ALLOCATED',
  Unallocated = 'UNALLOCATED',
  PartiallyAllocated = 'PARTIALLY_ALLOCATED',
  ReviewRequired = 'REVIEW_REQUIRED',
}

export enum FreshnessStatus {
  Fresh = 'FRESH',      // < 24 hrs
  Stale = 'STALE',      // 24-72 hrs
  Missing = 'MISSING',  // > 72 hrs or unavailable
}

export enum DemoRole {
  Executive = 'EXECUTIVE',
  FinOpsAnalyst = 'FINOPS_ANALYST',
  ProductOwner = 'PRODUCT_OWNER',
}

export enum ChangeStatus {
  Proposed = 'PROPOSED',
  PendingReview = 'PENDING_REVIEW',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Applied = 'APPLIED',
  RolledBack = 'ROLLED_BACK',
}

export interface BillingRecord {
  id: number;
  billing_id: string;
  billing_date: string;
  cloud_provider: string;
  cloud_account_id: string;
  service: string;
  region: string;
  resource_id: string;
  usage_type: string;
  cost: number;
  currency: string;
  allocation_tag: string;
  product_id: string;
  feature_id: string;
  business_unit: string;
  billing_status: string;
  timestamp: string;
}

export interface UsageTelemetry {
  id: number;
  telemetry_id: string;
  timestamp: string;
  cloud_account_id: string;
  resource_id: string;
  product_id: string;
  feature_id: string;
  business_unit: string;
  usage_type: string;
  usage_quantity: number;
  unit: string;
  freshness_timestamp: string;
}

export interface AllocationTag {
  id: number;
  resource_id: string;
  cloud_account_id: string;
  business_unit: string;
  product_id: string;
  feature_id: string;
  allocation_status: string;
  tag_last_updated: string;
  tag_source: string;
}

export interface ProductActivity {
  id: number;
  activity_id: string;
  date: string;
  business_unit: string;
  product_id: string;
  feature_id: string;
  activity_type: string;
  activity_volume: number;
  unit: string;
}

export interface AllocationResult {
  id: number;
  allocation_id: string;
  billing_id: string;
  business_unit: string;
  product_id: string;
  feature_id: string;
  allocated_amount: number;
  allocation_method: AllocationMethod;
  confidence: ConfidenceLevel;
  evidence_source: string;
  evidence_timestamp: string;
  allocation_status: AllocationStatus;
  reason: string;
}

export interface AuditLog {
  id: number;
  audit_id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  object_type: string;
  object_id: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: string;
  impact_amount: number;
}

export interface ChangeRequest {
  id: number;
  change_id: string;
  requester: string;
  role: string;
  product: string;
  business_unit: string;
  resource_id: string;
  old_allocation: string;
  proposed_allocation: string;
  cost_impact: number;
  reason: string;
  created_at: string;
  status: ChangeStatus;
  reviewer: string | null;
  reviewed_at: string | null;
  previous_state_json: string | null;
}

export interface UnitEconomicsMetric {
  product: string;
  activity_type: string;
  activity_volume: number;
  cloud_cost: number;
  cost_per_unit: number;
  unit_name: string;
  allocation_confidence: string;
}

export interface DataFreshnessItem {
  dataset: string;
  last_updated: string;
  age_hours: number;
  status: FreshnessStatus;
  affected_records: number;
  affected_cost: number;
}

export interface DataQualityReport {
  dataset: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  missing_records: number;
  duplicate_records: number;
  stale_records: number;
  affected_cost: number;
  health_score: number;
}

export interface AnomalyItem {
  id: string;
  detected_at: string;
  product: string;
  service: string;
  business_unit: string;
  resource_id: string;
  current_cost: number;
  expected_cost: number;
  variance_pct: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface RecommendationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  affected_cost: number;
  potential_savings_or_allocated: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_action: string;
}
