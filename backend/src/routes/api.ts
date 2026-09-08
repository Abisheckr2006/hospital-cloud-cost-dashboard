import { Router, Request, Response } from 'express';
import { getDb, query, queryOne } from '../database/db.js';
import { calculateUnitEconomics } from '../analytics/unit-economics.js';
import { checkDataFreshness } from '../analytics/freshness.js';
import { checkDataQuality } from '../analytics/quality.js';
import { detectCostAnomalies } from '../analytics/anomalies.js';
import { generateRecommendations } from '../analytics/recommendations.js';
import { runFinOpsExperiment } from '../services/experiment.js';
import {
  createChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  rollbackChangeRequest,
  getAllChangeRequests,
  getChangeRequestById,
  getAuditLogs,
} from '../services/change-management.js';
import { DemoRole } from '../types/index.js';

export const apiRouter = Router();

// 1. Dashboard summary
apiRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { bu, product, account, service, dateRange } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (bu && bu !== 'All') {
      whereClause += ' AND ar.business_unit = ?';
      params.push(bu);
    }
    if (product && product !== 'All') {
      whereClause += ' AND ar.product_id = ?';
      params.push(product);
    }
    if (account && account !== 'All') {
      whereClause += ' AND br.cloud_account_id = ?';
      params.push(account);
    }
    if (service && service !== 'All') {
      whereClause += ' AND br.service = ?';
      params.push(service);
    }
    if (dateRange && dateRange !== 'All') {
      whereClause += ' AND br.billing_date LIKE ?';
      params.push(`${dateRange}%`);
    }

    const totals = queryOne<{
      total_cost: number;
      allocated_cost: number;
      unallocated_cost: number;
    }>(
      db,
      `
      SELECT 
        SUM(ar.allocated_amount) as total_cost,
        SUM(CASE WHEN ar.allocation_status = 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END) as allocated_cost,
        SUM(CASE WHEN ar.allocation_status != 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END) as unallocated_cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      `,
      params
    );

    const totalCost = totals?.total_cost || 0;
    const allocatedCost = totals?.allocated_cost || 0;
    const unallocatedCost = totals?.unallocated_cost || 0;
    const allocationRate = totalCost > 0 ? parseFloat(((allocatedCost / totalCost) * 100).toFixed(2)) : 0;
    const targetAllocationPct = 85.0;
    const gapToTarget = parseFloat((targetAllocationPct - allocationRate).toFixed(2));

    // Spend by Business Unit
    const spendByBU = query<{ business_unit: string; cost: number }>(
      db,
      `
      SELECT ar.business_unit, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY ar.business_unit
      ORDER BY cost DESC
      `,
      params
    );

    // Spend by Product
    const spendByProduct = query<{ product_id: string; cost: number }>(
      db,
      `
      SELECT ar.product_id, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY ar.product_id
      ORDER BY cost DESC
      `,
      params
    );

    // Spend by Feature
    const spendByFeature = query<{ feature_id: string; cost: number }>(
      db,
      `
      SELECT ar.feature_id, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY ar.feature_id
      ORDER BY cost DESC
      LIMIT 10
      `,
      params
    );

    // Spend by Cloud Service
    const spendByService = query<{ service: string; cost: number }>(
      db,
      `
      SELECT br.service, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY br.service
      ORDER BY cost DESC
      `,
      params
    );

    // Spend by Cloud Account
    const spendByAccount = query<{ cloud_account_id: string; cost: number }>(
      db,
      `
      SELECT br.cloud_account_id, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY br.cloud_account_id
      ORDER BY cost DESC
      `,
      params
    );

    // Monthly Cost Trend (Allocated vs Unallocated)
    const monthlyTrend = query<{
      month: string;
      total: number;
      allocated: number;
      unallocated: number;
    }>(
      db,
      `
      SELECT 
        substr(br.billing_date, 1, 7) as month,
        SUM(ar.allocated_amount) as total,
        SUM(CASE WHEN ar.allocation_status = 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END) as allocated,
        SUM(CASE WHEN ar.allocation_status != 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END) as unallocated
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY month
      ORDER BY month ASC
      `,
      params
    );

    // Allocation Confidence Breakdown
    const confidenceBreakdown = query<{ confidence: string; cost: number; count: number }>(
      db,
      `
      SELECT ar.confidence, SUM(ar.allocated_amount) as cost, COUNT(*) as count
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY ar.confidence
      `,
      params
    );

    // Allocation Method Breakdown
    const methodBreakdown = query<{ allocation_method: string; cost: number; count: number }>(
      db,
      `
      SELECT ar.allocation_method, SUM(ar.allocated_amount) as cost, COUNT(*) as count
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY ar.allocation_method
      `,
      params
    );

    // Top Cost Drivers (Resources)
    const topCostDrivers = query<{ resource_id: string; service: string; bu: string; prod: string; total_cost: number }>(
      db,
      `
      SELECT 
        br.resource_id,
        br.service,
        ar.business_unit as bu,
        ar.product_id as prod,
        SUM(ar.allocated_amount) as total_cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      GROUP BY br.resource_id
      ORDER BY total_cost DESC
      LIMIT 10
      `,
      params
    );

    const freshness = checkDataFreshness(db);
    const quality = checkDataQuality(db);

    res.json({
      kpis: {
        totalCost: parseFloat(totalCost.toFixed(2)),
        allocatedCost: parseFloat(allocatedCost.toFixed(2)),
        unallocatedCost: parseFloat(unallocatedCost.toFixed(2)),
        allocationRate,
        targetAllocationPct,
        gapToTarget,
        freshnessStatus: freshness.overallStatus,
        dataQualityScore: quality.overallQualityScore,
      },
      spendByBU,
      spendByProduct,
      spendByFeature,
      spendByService,
      spendByAccount,
      monthlyTrend,
      confidenceBreakdown,
      methodBreakdown,
      topCostDrivers,
    });
  } catch (err: any) {
    console.error('Error in /api/dashboard:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. Costs & Raw records
apiRouter.get('/costs', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const records = query(db, 'SELECT * FROM billing_records ORDER BY billing_date DESC LIMIT 500');
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Business Units
apiRouter.get('/business-units', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const bus = query(
      db,
      `
      SELECT 
        bu.name,
        bu.code,
        bu.description,
        bu.lead_manager,
        COALESCE(SUM(ar.allocated_amount), 0) as total_cost,
        COALESCE(SUM(CASE WHEN ar.allocation_status = 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END), 0) as allocated_cost,
        COALESCE(SUM(CASE WHEN ar.allocation_status != 'ALLOCATED' THEN ar.allocated_amount ELSE 0 END), 0) as unallocated_cost,
        COUNT(DISTINCT ar.product_id) as product_count
      FROM business_units bu
      LEFT JOIN allocation_results ar ON bu.name = ar.business_unit
      GROUP BY bu.name
      ORDER BY total_cost DESC
      `
    );

    // Calculate allocation % for each
    const formatted = bus.map((b) => {
      const tot = b.total_cost || 0;
      const alloc = b.allocated_cost || 0;
      return {
        ...b,
        total_cost: parseFloat(tot.toFixed(2)),
        allocated_cost: parseFloat(alloc.toFixed(2)),
        unallocated_cost: parseFloat((tot - alloc).toFixed(2)),
        allocation_rate: tot > 0 ? parseFloat(((alloc / tot) * 100).toFixed(1)) : 0,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Products
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const products = query(
      db,
      `
      SELECT 
        p.name,
        p.code,
        p.description,
        bu.name as business_unit,
        COALESCE(SUM(ar.allocated_amount), 0) as total_cost,
        COUNT(DISTINCT ar.feature_id) as feature_count,
        COUNT(ar.id) as allocation_records_count
      FROM products p
      JOIN business_units bu ON p.business_unit_id = bu.id
      LEFT JOIN allocation_results ar ON p.name = ar.product_id
      GROUP BY p.name
      ORDER BY total_cost DESC
      `
    );

    // Get features for each product
    const formatted = products.map((p) => {
      const feats = query(
        db,
        `
        SELECT f.name, f.code, COALESCE(SUM(ar.allocated_amount), 0) as cost
        FROM features f
        JOIN products pr ON f.product_id = pr.id
        LEFT JOIN allocation_results ar ON f.name = ar.feature_id
        WHERE pr.name = ?
        GROUP BY f.name
        ORDER BY cost DESC
        `,
        [p.name]
      );
      return {
        ...p,
        total_cost: parseFloat(p.total_cost.toFixed(2)),
        features: feats,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Features
apiRouter.get('/features', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const features = query(
      db,
      `
      SELECT f.name, f.code, p.name as product_name, COALESCE(SUM(ar.allocated_amount), 0) as cost
      FROM features f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN allocation_results ar ON f.name = ar.feature_id
      GROUP BY f.name
      ORDER BY cost DESC
      `
    );
    res.json(features);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Cloud Accounts
apiRouter.get('/cloud-accounts', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const accounts = query(
      db,
      `
      SELECT 
        ca.account_id,
        ca.name,
        ca.provider,
        ca.environment,
        COALESCE(SUM(br.cost), 0) as total_spend,
        COUNT(DISTINCT br.resource_id) as resource_count
      FROM cloud_accounts ca
      LEFT JOIN billing_records br ON ca.account_id = br.cloud_account_id
      GROUP BY ca.account_id
      ORDER BY total_spend DESC
      `
    );
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Services
apiRouter.get('/services', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const services = query(
      db,
      `
      SELECT service, SUM(cost) as total_spend, COUNT(*) as record_count
      FROM billing_records
      GROUP BY service
      ORDER BY total_spend DESC
      `
    );
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Allocation List with Filter & Pagination
apiRouter.get('/allocation', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { bu, product, method, confidence, status, search, limit = 100, offset = 0 } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];

    if (bu && bu !== 'All') {
      whereClause += ' AND ar.business_unit = ?';
      params.push(bu);
    }
    if (product && product !== 'All') {
      whereClause += ' AND ar.product_id = ?';
      params.push(product);
    }
    if (method && method !== 'All') {
      whereClause += ' AND ar.allocation_method = ?';
      params.push(method);
    }
    if (confidence && confidence !== 'All') {
      whereClause += ' AND ar.confidence = ?';
      params.push(confidence);
    }
    if (status && status !== 'All') {
      whereClause += ' AND ar.allocation_status = ?';
      params.push(status);
    }
    if (search) {
      whereClause += ' AND (ar.billing_id LIKE ? OR br.resource_id LIKE ? OR ar.reason LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countRow = queryOne<{ total: number }>(
      db,
      `
      SELECT COUNT(*) as total
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      `,
      params
    );

    const items = query(
      db,
      `
      SELECT 
        ar.id,
        ar.allocation_id,
        ar.billing_id,
        br.billing_date,
        br.cloud_account_id,
        br.service,
        br.resource_id,
        br.usage_type,
        ar.allocated_amount as cost,
        ar.business_unit,
        ar.product_id,
        ar.feature_id,
        ar.allocation_method,
        ar.confidence,
        ar.allocation_status,
        ar.evidence_source,
        ar.evidence_timestamp,
        ar.reason
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ${whereClause}
      ORDER BY ar.id ASC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      total: countRow?.total || 0,
      items,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Allocation Item
apiRouter.get('/allocation/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const item = queryOne(
      db,
      `
      SELECT 
        ar.*,
        br.billing_date,
        br.cloud_provider,
        br.cloud_account_id,
        br.service,
        br.region,
        br.resource_id,
        br.usage_type
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ar.id = ? OR ar.allocation_id = ?
      `,
      [req.params.id, req.params.id]
    );

    if (!item) return res.status(404).json({ error: 'Allocation record not found' });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Evidence Panel Details
apiRouter.get('/evidence/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const alloc = queryOne(
      db,
      `
      SELECT 
        ar.*,
        br.billing_date,
        br.cloud_provider,
        br.cloud_account_id,
        br.service,
        br.region,
        br.resource_id,
        br.usage_type,
        br.cost as raw_billing_cost,
        br.allocation_tag as raw_billing_tag
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE ar.id = ? OR ar.allocation_id = ?
      `,
      [req.params.id, req.params.id]
    );

    if (!alloc) return res.status(404).json({ error: 'Evidence record not found' });

    // Retrieve related governance tags for the resource
    const tags = query(db, 'SELECT * FROM allocation_tags WHERE resource_id = ?', [alloc.resource_id]);

    // Retrieve related telemetry for the resource
    const telemetry = query(db, 'SELECT * FROM usage_telemetry WHERE resource_id = ? LIMIT 10', [alloc.resource_id]);

    // Retrieve related activity
    const activity = query(
      db,
      'SELECT * FROM product_activity WHERE product_id = ? AND date LIKE ? LIMIT 5',
      [alloc.product_id, `${alloc.billing_date.substring(0, 7)}%`]
    );

    res.json({
      allocation: alloc,
      evidence: {
        method: alloc.allocation_method,
        confidence: alloc.confidence,
        source: alloc.evidence_source,
        timestamp: alloc.evidence_timestamp,
        reason: alloc.reason,
        rawBillingRecord: {
          billing_id: alloc.billing_id,
          date: alloc.billing_date,
          resource_id: alloc.resource_id,
          cost: alloc.raw_billing_cost,
          tag: alloc.raw_billing_tag,
        },
        resourceTags: tags,
        usageTelemetry: telemetry,
        productActivity: activity,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Data Quality
apiRouter.get('/data-quality', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const quality = checkDataQuality(db);
    res.json(quality);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Data Freshness
apiRouter.get('/data-freshness', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const freshness = checkDataFreshness(db);
    res.json(freshness);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Unit Economics
apiRouter.get('/unit-economics', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const ue = calculateUnitEconomics(db);
    res.json(ue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Experiment
apiRouter.get('/experiment', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = runFinOpsExperiment(db);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/experiment/run', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = runFinOpsExperiment(db);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Anomalies
apiRouter.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const anomalies = detectCostAnomalies(db);
    res.json(anomalies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 16. Recommendations
apiRouter.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const recs = generateRecommendations(db);
    res.json(recs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 17. Audit Log
apiRouter.get('/audit', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const logs = getAuditLogs(db);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Change Requests
apiRouter.get('/change-requests', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const crs = getAllChangeRequests(db);
    res.json(crs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/change-requests', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { requester, role, product, business_unit, resource_id, proposed_allocation, reason } = req.body;
    if (!requester || !resource_id || !proposed_allocation) {
      return res.status(400).json({ error: 'Missing required change request parameters' });
    }

    const cr = createChangeRequest(db, {
      requester,
      role: role || DemoRole.ProductOwner,
      product: product || 'General',
      business_unit: business_unit || 'Radiology',
      resource_id,
      proposed_allocation,
      reason: reason || 'Allocation adjustment requested',
    });

    res.status(201).json(cr);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/change-requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { reviewer, role } = req.body;
    const result = approveChangeRequest(
      db,
      req.params.id,
      reviewer || 'marcus.finops@hospital.org',
      role || DemoRole.FinOpsAnalyst
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/change-requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { reviewer, role, reason } = req.body;
    const result = rejectChangeRequest(
      db,
      req.params.id,
      reviewer || 'marcus.finops@hospital.org',
      role || DemoRole.FinOpsAnalyst,
      reason
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/change-requests/:id/rollback', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { user, role, reason } = req.body;
    const result = rollbackChangeRequest(
      db,
      req.params.id,
      user || 'marcus.finops@hospital.org',
      role || DemoRole.FinOpsAnalyst,
      reason
    );

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
