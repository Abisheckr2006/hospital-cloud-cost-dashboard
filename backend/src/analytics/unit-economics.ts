import { Database } from 'sql.js';
import { query } from '../database/db.js';
import { UnitEconomicsMetric } from '../types/index.js';

export function calculateUnitEconomics(db: Database): {
  metrics: UnitEconomicsMetric[];
  monthlyTrend: Array<{
    month: string;
    imagingCostPerImage: number;
    portalCostPerSession: number;
    analyticsCostPerReport: number;
    backupCostPerGB: number;
    loggingCostPerGB: number;
  }>;
} {
  // Aggregate cost by product from allocation_results
  const productCosts = query<{ product_id: string; total_cost: number }>(
    db,
    `
    SELECT product_id, SUM(allocated_amount) as total_cost
    FROM allocation_results
    WHERE allocation_status = 'ALLOCATED'
    GROUP BY product_id
    `
  );

  const costMap = new Map<string, number>();
  productCosts.forEach((pc) => costMap.set(pc.product_id, pc.total_cost));

  // Aggregate activity volume by product and activity_type
  const activities = query<{ product_id: string; activity_type: string; total_volume: number; unit: string }>(
    db,
    `
    SELECT product_id, activity_type, SUM(activity_volume) as total_volume, unit
    FROM product_activity
    GROUP BY product_id, activity_type
    `
  );

  const metrics: UnitEconomicsMetric[] = [];

  activities.forEach((act) => {
    const cost = costMap.get(act.product_id) || 0;
    const volume = act.total_volume;
    const costPerUnit = volume > 0 ? parseFloat((cost / volume).toFixed(4)) : 0;

    let confidence = 'HIGH';
    if (volume === 0) confidence = 'NONE (Zero Volume)';
    else if (act.product_id.includes('Analytics')) confidence = 'MEDIUM';

    metrics.push({
      product: act.product_id,
      activity_type: act.activity_type,
      activity_volume: volume,
      cloud_cost: parseFloat(cost.toFixed(2)),
      cost_per_unit: costPerUnit,
      unit_name: act.unit,
      allocation_confidence: confidence,
    });
  });

  // Calculate monthly trend
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const monthlyTrend = months.map((m) => {
    // Get cost for month
    const mCosts = query<{ product_id: string; cost: number }>(
      db,
      `
      SELECT ar.product_id, SUM(ar.allocated_amount) as cost
      FROM allocation_results ar
      JOIN billing_records br ON ar.billing_id = br.billing_id
      WHERE br.billing_date LIKE ? AND ar.allocation_status = 'ALLOCATED'
      GROUP BY ar.product_id
      `,
      [`${m}%`]
    );
    const mCostMap = new Map<string, number>();
    mCosts.forEach((mc) => mCostMap.set(mc.product_id, mc.cost));

    // Get activity for month
    const mActs = query<{ product_id: string; volume: number }>(
      db,
      `
      SELECT product_id, SUM(activity_volume) as volume
      FROM product_activity
      WHERE date LIKE ?
      GROUP BY product_id
      `,
      [`${m}%`]
    );
    const mActMap = new Map<string, number>();
    mActs.forEach((ma) => mActMap.set(ma.product_id, ma.volume));

    const getUnitCost = (prod: string): number => {
      const c = mCostMap.get(prod) || 0;
      const v = mActMap.get(prod) || 0;
      return v > 0 ? parseFloat((c / v).toFixed(4)) : 0;
    };

    return {
      month: m,
      imagingCostPerImage: getUnitCost('Medical Imaging Platform'),
      portalCostPerSession: getUnitCost('Patient Portal'),
      analyticsCostPerReport: getUnitCost('Clinical Analytics Platform'),
      backupCostPerGB: getUnitCost('Backup & Recovery'),
      loggingCostPerGB: getUnitCost('Hospital Logging Platform'),
    };
  });

  return { metrics, monthlyTrend };
}
