import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data definitions
const BUSINESS_UNITS = [
  'Radiology',
  'Emergency Services',
  'Clinical Analytics',
  'Patient Portal',
  'Infrastructure',
  'Research',
];

const PRODUCTS: Record<string, { bu: string; features: string[] }> = {
  'Medical Imaging Platform': {
    bu: 'Radiology',
    features: ['Image Upload', 'Image Processing', 'Image Storage', 'Image Retrieval'],
  },
  'Patient Portal': {
    bu: 'Patient Portal',
    features: ['Patient Login', 'Appointment Management', 'Notifications', 'Document Access'],
  },
  'Clinical Analytics Platform': {
    bu: 'Clinical Analytics',
    features: ['Data Processing', 'Report Generation', 'Analytics Queries'],
  },
  'Backup & Recovery': {
    bu: 'Infrastructure',
    features: ['Backup Creation', 'Backup Storage', 'Disaster Recovery'],
  },
  'Hospital Logging Platform': {
    bu: 'Infrastructure',
    features: ['Log Ingestion', 'Log Storage', 'Log Analytics'],
  },
};

const ACCOUNTS = [
  'ACCT-IMAGING',
  'ACCT-PORTAL',
  'ACCT-ANALYTICS',
  'ACCT-BACKUP',
  'ACCT-LOGGING',
  'ACCT-SHARED',
];

const SERVICES = [
  'Object Storage',
  'Compute',
  'Database',
  'Container Platform',
  'Data Transfer',
  'Logging',
  'Backup',
  'Serverless',
];

const REGIONS = ['us-east-1', 'us-east-2', 'us-west-2'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSyntheticData() {
  console.log('Generating synthetic data for Hospital Cloud Cost Attribution...');

  // 1. Generate Resources
  const resources: Array<{
    resource_id: string;
    cloud_account_id: string;
    service: string;
    region: string;
    usage_type: string;
  }> = [];

  // Dedicated Imaging Resources
  for (let i = 1; i <= 25; i++) {
    resources.push({
      resource_id: `res-img-storage-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-IMAGING',
      service: 'Object Storage',
      region: 'us-east-1',
      usage_type: 'Standard-Storage-GB',
    });
    resources.push({
      resource_id: `res-img-comp-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-IMAGING',
      service: 'Compute',
      region: 'us-east-1',
      usage_type: 'vCPU-Hours',
    });
  }

  // Dedicated Portal Resources
  for (let i = 1; i <= 20; i++) {
    resources.push({
      resource_id: `res-portal-app-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-PORTAL',
      service: 'Container Platform',
      region: 'us-east-2',
      usage_type: 'Container-Hours',
    });
    resources.push({
      resource_id: `res-portal-db-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-PORTAL',
      service: 'Database',
      region: 'us-east-2',
      usage_type: 'IOPS-and-Storage',
    });
  }

  // Dedicated Analytics Resources
  for (let i = 1; i <= 20; i++) {
    resources.push({
      resource_id: `res-analytics-node-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-ANALYTICS',
      service: 'Compute',
      region: 'us-west-2',
      usage_type: 'Memory-Optimized-Hours',
    });
    resources.push({
      resource_id: `res-analytics-db-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-ANALYTICS',
      service: 'Database',
      region: 'us-west-2',
      usage_type: 'Warehouse-Compute-Credits',
    });
  }

  // Dedicated Backup & Logging
  for (let i = 1; i <= 15; i++) {
    resources.push({
      resource_id: `res-backup-vault-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-BACKUP',
      service: 'Backup',
      region: 'us-east-1',
      usage_type: 'Archive-Storage-GB',
    });
    resources.push({
      resource_id: `res-log-ingest-${String(i).padStart(3, '0')}`,
      cloud_account_id: 'ACCT-LOGGING',
      service: 'Logging',
      region: 'us-east-1',
      usage_type: 'Log-Ingested-GB',
    });
  }

  // Shared Infrastructure Resources
  for (let i = 1; i <= 15; i++) {
    resources.push({
      resource_id: `res-shared-k8s-cluster-${String(i).padStart(2, '0')}`,
      cloud_account_id: 'ACCT-SHARED',
      service: 'Container Platform',
      region: 'us-east-1',
      usage_type: 'Shared-K8s-Node-Hours',
    });
    resources.push({
      resource_id: `res-shared-gateway-${String(i).padStart(2, '0')}`,
      cloud_account_id: 'ACCT-SHARED',
      service: 'Data Transfer',
      region: 'us-east-1',
      usage_type: 'Inter-Region-Data-GB',
    });
  }

  // Unmanaged/Edge-case resources
  resources.push({
    resource_id: 'res-orphan-serverless-001',
    cloud_account_id: 'ACCT-SHARED',
    service: 'Serverless',
    region: 'us-east-1',
    usage_type: 'Function-Invocations',
  });
  resources.push({
    resource_id: 'res-conflict-storage-002',
    cloud_account_id: 'ACCT-SHARED',
    service: 'Object Storage',
    region: 'us-west-2',
    usage_type: 'Standard-Storage-GB',
  });
  resources.push({
    resource_id: 'res-corrupt-prod-003',
    cloud_account_id: 'ACCT-ANALYTICS',
    service: 'Compute',
    region: 'us-west-2',
    usage_type: 'vCPU-Hours',
  });
  resources.push({
    resource_id: 'res-spike-imaging-gpu-004',
    cloud_account_id: 'ACCT-IMAGING',
    service: 'Compute',
    region: 'us-east-1',
    usage_type: 'GPU-Processing-Hours',
  });

  // 2. Generate Allocation Tags
  const allocationTags: Array<{
    resource_id: string;
    cloud_account_id: string;
    business_unit: string;
    product_id: string;
    feature_id: string;
    allocation_status: string;
    tag_last_updated: string;
    tag_source: string;
  }> = [];

  const now = new Date('2026-06-30T12:00:00Z');

  resources.forEach((res, index) => {
    // Edge Case 1: Untagged resources (approx 15% of resources lack tags)
    if (res.resource_id.includes('orphan') || index % 7 === 0) {
      return; // No tag entry!
    }

    // Edge Case 4: Conflicting allocation tag
    if (res.resource_id === 'res-conflict-storage-002') {
      allocationTags.push({
        resource_id: res.resource_id,
        cloud_account_id: res.cloud_account_id,
        business_unit: 'Emergency Services',
        product_id: 'Patient Portal',
        feature_id: 'Document Access',
        allocation_status: 'TAGGED',
        tag_last_updated: '2026-05-10T08:00:00Z',
        tag_source: 'Terraform-CI',
      });
      allocationTags.push({
        resource_id: res.resource_id,
        cloud_account_id: res.cloud_account_id,
        business_unit: 'Radiology',
        product_id: 'Medical Imaging Platform',
        feature_id: 'Image Storage',
        allocation_status: 'TAGGED',
        tag_last_updated: '2026-05-12T10:00:00Z',
        tag_source: 'Manual-Console',
      });
      return;
    }

    // Edge Case 3: Invalid product mapping
    if (res.resource_id === 'res-corrupt-prod-003') {
      allocationTags.push({
        resource_id: res.resource_id,
        cloud_account_id: res.cloud_account_id,
        business_unit: 'Clinical Analytics',
        product_id: 'PROD-INVALID-LEGACY-SYS',
        feature_id: 'Legacy Report',
        allocation_status: 'INVALID_MAPPING',
        tag_last_updated: '2026-01-15T00:00:00Z',
        tag_source: 'Legacy-Script',
      });
      return;
    }

    // Normal mapping based on account & resource
    let bu = 'Infrastructure';
    let prod = 'Hospital Logging Platform';
    let feat = 'Log Ingestion';

    if (res.cloud_account_id === 'ACCT-IMAGING') {
      bu = 'Radiology';
      prod = 'Medical Imaging Platform';
      feat = res.service === 'Object Storage' ? 'Image Storage' : 'Image Processing';
    } else if (res.cloud_account_id === 'ACCT-PORTAL') {
      bu = 'Patient Portal';
      prod = 'Patient Portal';
      feat = res.service === 'Container Platform' ? 'Patient Login' : 'Document Access';
    } else if (res.cloud_account_id === 'ACCT-ANALYTICS') {
      bu = 'Clinical Analytics';
      prod = 'Clinical Analytics Platform';
      feat = res.service === 'Compute' ? 'Data Processing' : 'Analytics Queries';
    } else if (res.cloud_account_id === 'ACCT-BACKUP') {
      bu = 'Infrastructure';
      prod = 'Backup & Recovery';
      feat = 'Backup Storage';
    } else if (res.cloud_account_id === 'ACCT-SHARED') {
      bu = 'Infrastructure';
      prod = 'Shared Platform';
      feat = 'Container Cluster';
    }

    allocationTags.push({
      resource_id: res.resource_id,
      cloud_account_id: res.cloud_account_id,
      business_unit: bu,
      product_id: prod,
      feature_id: feat,
      allocation_status: 'TAGGED',
      tag_last_updated: '2026-04-15T14:30:00Z',
      tag_source: 'AWS-Tags-Automation',
    });
  });

  // 3. Generate 600+ Billing Records spanning Jan 2026 - Jun 2026
  const billingRecords: Array<{
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
  }> = [];

  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

  let billingCounter = 1;

  months.forEach((m, mIdx) => {
    resources.forEach((res, rIdx) => {
      // Base monthly cost varies by service
      let baseCost = 0;
      if (res.service === 'Object Storage') baseCost = randomFloat(250, 850);
      else if (res.service === 'Compute') baseCost = randomFloat(400, 1400);
      else if (res.service === 'Database') baseCost = randomFloat(300, 1100);
      else if (res.service === 'Container Platform') baseCost = randomFloat(350, 950);
      else if (res.service === 'Backup') baseCost = randomFloat(180, 600);
      else if (res.service === 'Logging') baseCost = randomFloat(150, 500);
      else baseCost = randomFloat(100, 400);

      // Edge Case 8: Cost Spike anomaly in June for res-spike-imaging-gpu-004 (>140% spike)
      if (res.resource_id === 'res-spike-imaging-gpu-004') {
        if (m === '2026-06') {
          baseCost = 6450.0; // Huge spike from normal ~1800
        } else {
          baseCost = randomFloat(1700, 1950);
        }
      }

      // Determine baseline tag state in the raw billing export:
      // In baseline billing exports, approx 50-55% of records have direct tags embedded.
      // The rest are blank or untagged in the raw bill!
      let directTag = '';
      let directBu = '';
      let directProd = '';
      let directFeat = '';

      // Direct billing tagging exists for some straightforward accounts
      const hasDirectTag = (rIdx % 2 === 0 && !res.resource_id.includes('orphan') && res.cloud_account_id !== 'ACCT-SHARED');

      if (hasDirectTag) {
        if (res.cloud_account_id === 'ACCT-IMAGING') {
          directBu = 'Radiology';
          directProd = 'Medical Imaging Platform';
          directFeat = res.service === 'Object Storage' ? 'Image Storage' : 'Image Processing';
          directTag = 'env=prod;bu=Radiology;product=Imaging';
        } else if (res.cloud_account_id === 'ACCT-PORTAL') {
          directBu = 'Patient Portal';
          directProd = 'Patient Portal';
          directFeat = 'Appointment Management';
          directTag = 'env=prod;bu=PatientPortal;product=Portal';
        } else if (res.cloud_account_id === 'ACCT-ANALYTICS') {
          directBu = 'Clinical Analytics';
          directProd = 'Clinical Analytics Platform';
          directFeat = 'Report Generation';
          directTag = 'env=prod;bu=Analytics;product=ClinicalData';
        }
      }

      const billDate = `${m}-${String(randomInt(10, 28)).padStart(2, '0')}`;
      const bId = `BILL-2026-${String(billingCounter).padStart(5, '0')}`;
      billingCounter++;

      billingRecords.push({
        billing_id: bId,
        billing_date: billDate,
        cloud_provider: 'AWS',
        cloud_account_id: res.cloud_account_id,
        service: res.service,
        region: res.region,
        resource_id: res.resource_id,
        usage_type: res.usage_type,
        cost: baseCost,
        currency: 'USD',
        allocation_tag: directTag,
        product_id: directProd,
        feature_id: directFeat,
        business_unit: directBu,
        billing_status: 'FINAL',
        timestamp: `${billDate}T23:59:59Z`,
      });

      // Edge Case 7: Duplicate Billing Record in May
      if (m === '2026-05' && res.resource_id === 'res-img-storage-001') {
        billingRecords.push({
          billing_id: `BILL-2026-DUP-001`,
          billing_date: billDate,
          cloud_provider: 'AWS',
          cloud_account_id: res.cloud_account_id,
          service: res.service,
          region: res.region,
          resource_id: res.resource_id,
          usage_type: res.usage_type,
          cost: baseCost,
          currency: 'USD',
          allocation_tag: directTag,
          product_id: directProd,
          feature_id: directFeat,
          business_unit: directBu,
          billing_status: 'FINAL',
          timestamp: `${billDate}T23:59:59Z`,
        });
      }
    });
  });

  // 4. Generate Usage Telemetry
  const usageTelemetry: Array<{
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
  }> = [];

  let telCounter = 1;

  months.forEach((m) => {
    // Shared cluster telemetry (Level 3 usage breakdown between products!)
    // Shared cluster k8s is consumed by:
    // - Medical Imaging: 45%
    // - Patient Portal: 35%
    // - Clinical Analytics: 20%
    for (let k = 1; k <= 5; k++) {
      const clusterId = `res-shared-k8s-cluster-0${k}`;
      const telDate = `${m}-15`;

      usageTelemetry.push({
        telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
        timestamp: `${telDate}T12:00:00Z`,
        cloud_account_id: 'ACCT-SHARED',
        resource_id: clusterId,
        product_id: 'Medical Imaging Platform',
        feature_id: 'Image Processing',
        business_unit: 'Radiology',
        usage_type: 'Shared-K8s-Node-Hours',
        usage_quantity: 450,
        unit: 'Node-Hours',
        freshness_timestamp: `${telDate}T12:05:00Z`,
      });

      usageTelemetry.push({
        telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
        timestamp: `${telDate}T12:00:00Z`,
        cloud_account_id: 'ACCT-SHARED',
        resource_id: clusterId,
        product_id: 'Patient Portal',
        feature_id: 'Notifications',
        business_unit: 'Patient Portal',
        usage_type: 'Shared-K8s-Node-Hours',
        usage_quantity: 350,
        unit: 'Node-Hours',
        freshness_timestamp: `${telDate}T12:05:00Z`,
      });

      usageTelemetry.push({
        telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
        timestamp: `${telDate}T12:00:00Z`,
        cloud_account_id: 'ACCT-SHARED',
        resource_id: clusterId,
        product_id: 'Clinical Analytics Platform',
        feature_id: 'Data Processing',
        business_unit: 'Clinical Analytics',
        usage_type: 'Shared-K8s-Node-Hours',
        usage_quantity: 200,
        unit: 'Node-Hours',
        freshness_timestamp: `${telDate}T12:05:00Z`,
      });
    }

    // Shared Gateway Data Transfer Telemetry
    for (let g = 1; g <= 3; g++) {
      const gwId = `res-shared-gateway-0${g}`;
      const telDate = `${m}-20`;

      usageTelemetry.push({
        telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
        timestamp: `${telDate}T10:00:00Z`,
        cloud_account_id: 'ACCT-SHARED',
        resource_id: gwId,
        product_id: 'Medical Imaging Platform',
        feature_id: 'Image Retrieval',
        business_unit: 'Radiology',
        usage_type: 'Inter-Region-Data-GB',
        usage_quantity: 1250,
        unit: 'GB',
        freshness_timestamp: `${telDate}T10:05:00Z`,
      });

      usageTelemetry.push({
        telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
        timestamp: `${telDate}T10:00:00Z`,
        cloud_account_id: 'ACCT-SHARED',
        resource_id: gwId,
        product_id: 'Emergency Services',
        feature_id: 'Document Access',
        business_unit: 'Emergency Services',
        usage_type: 'Inter-Region-Data-GB',
        usage_quantity: 750,
        unit: 'GB',
        freshness_timestamp: `${telDate}T10:05:00Z`,
      });
    }

    // Edge Case 2: Stale telemetry for Clinical Analytics node in June (freshness timestamp is 96 hours old!)
    usageTelemetry.push({
      telemetry_id: `TEL-${String(telCounter++).padStart(5, '0')}`,
      timestamp: `2026-06-25T08:00:00Z`,
      cloud_account_id: 'ACCT-ANALYTICS',
      resource_id: 'res-analytics-node-005',
      product_id: 'Clinical Analytics Platform',
      feature_id: 'Data Processing',
      business_unit: 'Clinical Analytics',
      usage_type: 'Memory-Optimized-Hours',
      usage_quantity: 680,
      unit: 'Hours',
      freshness_timestamp: '2026-06-21T02:15:00Z', // STALE (> 96 hours old!)
    });
  });

  // 5. Generate Product Activity (Level 4 activity-based driver & Unit Economics)
  const productActivity: Array<{
    activity_id: string;
    date: string;
    business_unit: string;
    product_id: string;
    feature_id: string;
    activity_type: string;
    activity_volume: number;
    unit: string;
  }> = [];

  let actCounter = 1;

  months.forEach((m) => {
    // Medical Imaging: images processed
    productActivity.push({
      activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
      date: `${m}-01`,
      business_unit: 'Radiology',
      product_id: 'Medical Imaging Platform',
      feature_id: 'Image Processing',
      activity_type: 'images processed',
      activity_volume: randomInt(115000, 135000),
      unit: 'images',
    });

    // Patient Portal: portal sessions
    productActivity.push({
      activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
      date: `${m}-01`,
      business_unit: 'Patient Portal',
      product_id: 'Patient Portal',
      feature_id: 'Patient Login',
      activity_type: 'portal sessions',
      activity_volume: randomInt(75000, 92000),
      unit: 'sessions',
    });

    // Clinical Analytics: reports generated
    productActivity.push({
      activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
      date: `${m}-01`,
      business_unit: 'Clinical Analytics',
      product_id: 'Clinical Analytics Platform',
      feature_id: 'Report Generation',
      activity_type: 'reports generated',
      activity_volume: randomInt(4800, 6200),
      unit: 'reports',
    });

    // Backup: backup GB
    productActivity.push({
      activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
      date: `${m}-01`,
      business_unit: 'Infrastructure',
      product_id: 'Backup & Recovery',
      feature_id: 'Backup Storage',
      activity_type: 'backup GB',
      activity_volume: randomInt(48000, 56000),
      unit: 'GB',
    });

    // Logging: logs ingested GB
    productActivity.push({
      activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
      date: `${m}-01`,
      business_unit: 'Infrastructure',
      product_id: 'Hospital Logging Platform',
      feature_id: 'Log Ingestion',
      activity_type: 'logs ingested GB',
      activity_volume: randomInt(28000, 35000),
      unit: 'GB',
    });

    // Edge Case 6: Zero activity period for a research pilot feature
    if (m === '2026-05') {
      productActivity.push({
        activity_id: `ACT-${String(actCounter++).padStart(5, '0')}`,
        date: `${m}-01`,
        business_unit: 'Research',
        product_id: 'Clinical Analytics Platform',
        feature_id: 'Analytics Queries',
        activity_type: 'analytics queries',
        activity_volume: 0, // ZERO ACTIVITY!
        unit: 'queries',
      });
    }
  });

  // Convert to CSV strings
  function toCSV(headers: string[], rows: any[][]): string {
    const lines = [headers.join(',')];
    rows.forEach((r) => {
      const formatted = r.map((val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      lines.push(formatted.join(','));
    });
    return lines.join('\n');
  }

  // 1. synthetic_resources.csv
  const resHeaders = ['resource_id', 'cloud_account_id', 'service', 'region', 'usage_type'];
  const resRows = resources.map((r) => [r.resource_id, r.cloud_account_id, r.service, r.region, r.usage_type]);
  fs.writeFileSync(path.join(DATA_DIR, 'synthetic_resources.csv'), toCSV(resHeaders, resRows));

  // 2. allocation_tags.csv
  const tagHeaders = ['resource_id', 'cloud_account_id', 'business_unit', 'product_id', 'feature_id', 'allocation_status', 'tag_last_updated', 'tag_source'];
  const tagRows = allocationTags.map((t) => [t.resource_id, t.cloud_account_id, t.business_unit, t.product_id, t.feature_id, t.allocation_status, t.tag_last_updated, t.tag_source]);
  fs.writeFileSync(path.join(DATA_DIR, 'allocation_tags.csv'), toCSV(tagHeaders, tagRows));

  // 3. billing_exports.csv
  const billHeaders = ['billing_id', 'billing_date', 'cloud_provider', 'cloud_account_id', 'service', 'region', 'resource_id', 'usage_type', 'cost', 'currency', 'allocation_tag', 'product_id', 'feature_id', 'business_unit', 'billing_status', 'timestamp'];
  const billRows = billingRecords.map((b) => [b.billing_id, b.billing_date, b.cloud_provider, b.cloud_account_id, b.service, b.region, b.resource_id, b.usage_type, b.cost, b.currency, b.allocation_tag, b.product_id, b.feature_id, b.business_unit, b.billing_status, b.timestamp]);
  fs.writeFileSync(path.join(DATA_DIR, 'billing_exports.csv'), toCSV(billHeaders, billRows));

  // 4. usage_telemetry.csv
  const telHeaders = ['telemetry_id', 'timestamp', 'cloud_account_id', 'resource_id', 'product_id', 'feature_id', 'business_unit', 'usage_type', 'usage_quantity', 'unit', 'freshness_timestamp'];
  const telRows = usageTelemetry.map((t) => [t.telemetry_id, t.timestamp, t.cloud_account_id, t.resource_id, t.product_id, t.feature_id, t.business_unit, t.usage_type, t.usage_quantity, t.unit, t.freshness_timestamp]);
  fs.writeFileSync(path.join(DATA_DIR, 'usage_telemetry.csv'), toCSV(telHeaders, telRows));

  // 5. product_activity.csv
  const actHeaders = ['activity_id', 'date', 'business_unit', 'product_id', 'feature_id', 'activity_type', 'activity_volume', 'unit'];
  const actRows = productActivity.map((a) => [a.activity_id, a.date, a.business_unit, a.product_id, a.feature_id, a.activity_type, a.activity_volume, a.unit]);
  fs.writeFileSync(path.join(DATA_DIR, 'product_activity.csv'), toCSV(actHeaders, actRows));

  console.log(`Generated:
  - Resources: ${resources.length}
  - Allocation Tags: ${allocationTags.length}
  - Billing Records: ${billingRecords.length}
  - Usage Telemetry: ${usageTelemetry.length}
  - Product Activity: ${productActivity.length}`);
}

if (process.argv[1]?.includes('generate-data')) {
  generateSyntheticData();
}
