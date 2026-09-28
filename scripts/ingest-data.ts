import fs from 'fs';
import path from 'path';
import { getDb, run, saveDb } from '../backend/src/database/db.js';
import { generateSyntheticData } from './generate-data.js';
import { runAllocationEngine } from '../backend/src/allocation/engine.js';
import { ChangeStatus, DemoRole } from '../backend/src/types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');

function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let inQuotes = false;
    let current = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          current += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ? values[idx].trim() : '';
    });
    records.push(record);
  }

  return records;
}

export async function ingestData() {
  console.log('Starting ingestion and database population...');

  // Ensure CSVs exist
  const billingCsvPath = path.join(DATA_DIR, 'billing_exports.csv');
  if (!fs.existsSync(billingCsvPath)) {
    console.log('CSVs not found. Generating synthetic datasets first...');
    generateSyntheticData();
  }

  const db = await getDb();

  // 1. Seed Reference Data
  console.log('Seeding reference dimensions (BUs, Products, Features, Accounts)...');
  run(db, 'DELETE FROM business_units');
  run(db, 'DELETE FROM products');
  run(db, 'DELETE FROM features');
  run(db, 'DELETE FROM cloud_accounts');
  run(db, 'DELETE FROM resources');
  run(db, 'DELETE FROM billing_records');
  run(db, 'DELETE FROM usage_telemetry');
  run(db, 'DELETE FROM allocation_tags');
  run(db, 'DELETE FROM product_activity');
  run(db, 'DELETE FROM change_requests');
  run(db, 'DELETE FROM audit_logs');

  const bus = [
    ['Radiology', 'BU-RAD', 'Diagnostic imaging, MRI, CT, and X-ray storage and AI compute', 'Dr. Sarah Jenkins'],
    ['Emergency Services', 'BU-EMERG', 'Critical care, ED triage telemetry, and rapid access imaging', 'Marcus Vance'],
    ['Clinical Analytics', 'BU-ANALYTICS', 'Predictive clinical modeling, patient outcomes, and ML queries', 'Elena Rostova'],
    ['Patient Portal', 'BU-PORTAL', 'Digital front door, medical records access, scheduling, messaging', 'David Kim'],
    ['Infrastructure', 'BU-INFRA', 'Core networking, cloud governance, backups, and security logging', 'Rachel Patel'],
    ['Research', 'BU-RESEARCH', 'Genomic pipelines, research clinical trials, and data sandboxes', 'Prof. Arthur Pendelton'],
  ];

  bus.forEach(([name, code, desc, mgr]) => {
    run(db, 'INSERT INTO business_units (name, code, description, lead_manager) VALUES (?, ?, ?, ?)', [name, code, desc, mgr]);
  });

  const products = [
    ['Medical Imaging Platform', 'PROD-IMG', 1, 'DICOM image store, rendering pipeline, and PACS integration'],
    ['Patient Portal', 'PROD-PORTAL', 4, 'Secure web & mobile portal for patient health information'],
    ['Clinical Analytics Platform', 'PROD-ANALYTICS', 3, 'Enterprise clinical warehouse and healthcare analytics'],
    ['Backup & Recovery', 'PROD-BACKUP', 5, 'Disaster recovery and cross-region cold storage snapshots'],
    ['Hospital Logging Platform', 'PROD-LOGGING', 5, 'HIPAA audit trail, system telemetry, and SIEM security logs'],
  ];

  products.forEach(([name, code, buId, desc]) => {
    run(db, 'INSERT INTO products (name, code, business_unit_id, description) VALUES (?, ?, ?, ?)', [name, code, buId, desc]);
  });

  const features = [
    ['Image Upload', 'FEAT-IMG-01', 1, 'Ingest DICOM study from hospital modality scanners'],
    ['Image Processing', 'FEAT-IMG-02', 1, 'GPU 3D reconstruction and compression processing'],
    ['Image Storage', 'FEAT-IMG-03', 1, 'Multi-tier cloud object storage archive'],
    ['Image Retrieval', 'FEAT-IMG-04', 1, 'Low-latency viewer streaming cache'],

    ['Patient Login', 'FEAT-PORTAL-01', 2, 'Federated identity & MFA authentication'],
    ['Appointment Management', 'FEAT-PORTAL-02', 2, 'Doctor scheduling and slot availability'],
    ['Notifications', 'FEAT-PORTAL-03', 2, 'SMS, push notifications, and email alerts'],
    ['Document Access', 'FEAT-PORTAL-04', 2, 'Lab results and discharge notes download'],

    ['Data Processing', 'FEAT-ANALYTICS-01', 3, 'ETL data pipeline execution'],
    ['Report Generation', 'FEAT-ANALYTICS-02', 3, 'Executive quality metrics and clinical reports'],
    ['Analytics Queries', 'FEAT-ANALYTICS-03', 3, 'Ad-hoc data queries on clinical warehouse'],

    ['Backup Creation', 'FEAT-BACKUP-01', 4, 'Scheduled snapshot creation'],
    ['Backup Storage', 'FEAT-BACKUP-02', 4, 'Immutable vault archive storage'],
    ['Disaster Recovery', 'FEAT-BACKUP-03', 4, 'Cross-region failover rehearsal environments'],

    ['Log Ingestion', 'FEAT-LOG-01', 5, 'High-volume log streaming pipeline'],
    ['Log Storage', 'FEAT-LOG-02', 5, 'Tiered searchable log indexing'],
    ['Log Analytics', 'FEAT-LOG-03', 5, 'Security anomaly detection and compliance reporting'],
  ];

  features.forEach(([name, code, prodId, desc]) => {
    run(db, 'INSERT INTO features (name, code, product_id, description) VALUES (?, ?, ?, ?)', [name, code, prodId, desc]);
  });

  const accounts = [
    ['ACCT-IMAGING', 'Radiology PACS Account', 'AWS', 'Production'],
    ['ACCT-PORTAL', 'Patient Portal Account', 'AWS', 'Production'],
    ['ACCT-ANALYTICS', 'Clinical Analytics Account', 'AWS', 'Production'],
    ['ACCT-BACKUP', 'Disaster Recovery Vault Account', 'AWS', 'Production'],
    ['ACCT-LOGGING', 'Audit Logging & SIEM Account', 'AWS', 'Production'],
    ['ACCT-SHARED', 'Core Shared Services Account', 'AWS', 'Production'],
  ];

  accounts.forEach(([acct, name, prov, env]) => {
    run(db, 'INSERT INTO cloud_accounts (account_id, name, provider, environment) VALUES (?, ?, ?, ?)', [acct, name, prov, env]);
  });

  // 2. Ingest Resources
  const resourcesCsv = fs.readFileSync(path.join(DATA_DIR, 'synthetic_resources.csv'), 'utf-8');
  const resRecords = parseCSV(resourcesCsv);
  resRecords.forEach((r) => {
    run(db, 'INSERT INTO resources (resource_id, cloud_account_id, service, region, usage_type) VALUES (?, ?, ?, ?, ?)', [
      r.resource_id,
      r.cloud_account_id,
      r.service,
      r.region,
      r.usage_type,
    ]);
  });

  // 3. Ingest Allocation Tags
  const tagsCsv = fs.readFileSync(path.join(DATA_DIR, 'allocation_tags.csv'), 'utf-8');
  const tagRecords = parseCSV(tagsCsv);
  tagRecords.forEach((t) => {
    run(db, `
      INSERT INTO allocation_tags (resource_id, cloud_account_id, business_unit, product_id, feature_id, allocation_status, tag_last_updated, tag_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      t.resource_id,
      t.cloud_account_id,
      t.business_unit,
      t.product_id,
      t.feature_id,
      t.allocation_status,
      t.tag_last_updated,
      t.tag_source,
    ]);
  });

  // 4. Ingest Billing Records
  const billCsv = fs.readFileSync(path.join(DATA_DIR, 'billing_exports.csv'), 'utf-8');
  const billRecords = parseCSV(billCsv);
  billRecords.forEach((b) => {
    run(db, `
      INSERT INTO billing_records (
        billing_id, billing_date, cloud_provider, cloud_account_id, service, region,
        resource_id, usage_type, cost, currency, allocation_tag, product_id, feature_id,
        business_unit, billing_status, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      b.billing_id,
      b.billing_date,
      b.cloud_provider,
      b.cloud_account_id,
      b.service,
      b.region,
      b.resource_id,
      b.usage_type,
      parseFloat(b.cost) || 0,
      b.currency,
      b.allocation_tag,
      b.product_id,
      b.feature_id,
      b.business_unit,
      b.billing_status,
      b.timestamp,
    ]);
  });

  // 5. Ingest Usage Telemetry
  const telCsv = fs.readFileSync(path.join(DATA_DIR, 'usage_telemetry.csv'), 'utf-8');
  const telRecords = parseCSV(telCsv);
  telRecords.forEach((t) => {
    run(db, `
      INSERT INTO usage_telemetry (
        telemetry_id, timestamp, cloud_account_id, resource_id, product_id,
        feature_id, business_unit, usage_type, usage_quantity, unit, freshness_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      t.telemetry_id,
      t.timestamp,
      t.cloud_account_id,
      t.resource_id,
      t.product_id,
      t.feature_id,
      t.business_unit,
      t.usage_type,
      parseFloat(t.usage_quantity) || 0,
      t.unit,
      t.freshness_timestamp,
    ]);
  });

  // 6. Ingest Product Activity
  const actCsv = fs.readFileSync(path.join(DATA_DIR, 'product_activity.csv'), 'utf-8');
  const actRecords = parseCSV(actCsv);
  actRecords.forEach((a) => {
    run(db, `
      INSERT INTO product_activity (
        activity_id, date, business_unit, product_id, feature_id,
        activity_type, activity_volume, unit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      a.activity_id,
      a.date,
      a.business_unit,
      a.product_id,
      a.feature_id,
      a.activity_type,
      parseFloat(a.activity_volume) || 0,
      a.unit,
    ]);
  });

  // 7. Run Allocation Engine to populate allocation_results
  console.log('Running Allocation Engine...');
  const result = runAllocationEngine(db);
  console.log(`Allocation complete!
  - Total records: ${result.totalProcessed}
  - Allocated Spend: $${result.allocatedCost.toLocaleString()}
  - Unallocated Spend: $${result.unallocatedCost.toLocaleString()}
  - Allocation Rate: ${result.allocationRatePct}%
  - Validation Errors: ${result.errorsDetected}`);

  // 8. Seed Demo Change Request (High Impact >= $5,000) for reviewer demonstration
  console.log('Seeding demo high-impact change request for evaluation review...');
  run(db, `
    INSERT INTO change_requests (
      change_id, requester, role, product, business_unit, resource_id,
      old_allocation, proposed_allocation, cost_impact, reason, created_at,
      status, reviewer, reviewed_at, previous_state_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'CR-DEMO-001',
    'sarah.jenkins@hospital.org',
    DemoRole.ProductOwner,
    'Medical Imaging Platform',
    'Radiology',
    'res-spike-imaging-gpu-004',
    'Radiology / Medical Imaging Platform',
    'Clinical Analytics / Clinical Analytics Platform',
    8250.00,
    'GPU processing cluster was reassigned to Clinical Analytics for deep neural network patient prognosis model training during Q2.',
    '2026-06-26T14:20:00Z',
    ChangeStatus.PendingReview,
    null,
    null,
    JSON.stringify({
      resource_id: 'res-spike-imaging-gpu-004',
      old_business_unit: 'Radiology',
      old_product: 'Medical Imaging Platform',
    }),
  ]);

  // Seed sample approved change request with rollback history
  run(db, `
    INSERT INTO change_requests (
      change_id, requester, role, product, business_unit, resource_id,
      old_allocation, proposed_allocation, cost_impact, reason, created_at,
      status, reviewer, reviewed_at, previous_state_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'CR-DEMO-002',
    'elena.rostova@hospital.org',
    DemoRole.ProductOwner,
    'Clinical Analytics Platform',
    'Clinical Analytics',
    'res-analytics-node-001',
    'Infrastructure / Hospital Logging Platform',
    'Clinical Analytics / Clinical Analytics Platform',
    5400.00,
    'Analytics cluster was improperly tagged to logging infrastructure.',
    '2026-06-15T09:00:00Z',
    ChangeStatus.Applied,
    'marcus.finops@hospital.org',
    '2026-06-16T11:00:00Z',
    JSON.stringify({
      resource_id: 'res-analytics-node-001',
      old_business_unit: 'Infrastructure',
      old_product: 'Hospital Logging Platform',
    }),
  ]);

  // Seed Audit Logs
  run(db, `
    INSERT INTO audit_logs (
      audit_id, timestamp, user, role, action, object_type, object_id,
      old_value, new_value, reason, status, impact_amount
    ) VALUES 
    ('AUDIT-INIT-001', '2026-06-01T08:00:00Z', 'system', 'SYSTEM', 'INITIAL_DATA_INGESTION', 'database', 'hospital_finops', null, 'VERSION_1.0', 'Initial automated dataset sync', 'SUCCESS', 0),
    ('AUDIT-INIT-002', '2026-06-15T09:00:00Z', 'elena.rostova@hospital.org', 'PRODUCT_OWNER', 'CREATE_CHANGE_REQUEST', 'change_requests', 'CR-DEMO-002', 'Infrastructure', 'Clinical Analytics', 'Reallocation request submitted', 'PENDING_REVIEW', 5400),
    ('AUDIT-INIT-003', '2026-06-16T11:00:00Z', 'marcus.finops@hospital.org', 'FINOPS_ANALYST', 'APPROVE_CHANGE_REQUEST', 'change_requests', 'CR-DEMO-002', 'Infrastructure', 'Clinical Analytics', 'Verified analytics workload telemetry', 'APPLIED', 5400),
    ('AUDIT-INIT-004', '2026-06-26T14:20:00Z', 'sarah.jenkins@hospital.org', 'PRODUCT_OWNER', 'CREATE_CHANGE_REQUEST', 'change_requests', 'CR-DEMO-001', 'Radiology', 'Clinical Analytics', 'GPU training reassignment', 'PENDING_REVIEW', 8250)
  `);

  saveDb(db);
  console.log('Database successfully saved to data/hospital_finops.sqlite!');
}

if (process.argv[1]?.includes('ingest-data')) {
  ingestData().catch((err) => {
    console.error('Ingestion failed:', err);
    process.exit(1);
  });
}
