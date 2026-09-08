import { Database } from 'sql.js';
import { query } from '../database/db.js';
import { AnomalyItem } from '../types/index.js';

export function detectCostAnomalies(db: Database): AnomalyItem[] {
  // Query monthly cost by resource
  const records = query<{
    resource_id: string;
    month: string;
    cost: number;
    service: string;
    cloud_account_id: string;
    business_unit: string;
    product_id: string;
  }>(
    db,
    `
    SELECT 
      resource_id,
      substr(billing_date, 1, 7) as month,
      SUM(cost) as cost,
      service,
      cloud_account_id,
      business_unit,
      product_id
    FROM billing_records
    GROUP BY resource_id, month
    ORDER BY resource_id, month ASC
    `
  );

  const resourceMap = new Map<string, Array<{ month: string; cost: number; service: string; cloud_account_id: string; bu: string; prod: string }>>();

  records.forEach((r) => {
    const list = resourceMap.get(r.resource_id) || [];
    list.push({
      month: r.month,
      cost: r.cost,
      service: r.service,
      cloud_account_id: r.cloud_account_id,
      bu: r.business_unit || 'Radiology',
      prod: r.product_id || 'Medical Imaging Platform',
    });
    resourceMap.set(r.resource_id, list);
  });

  const anomalies: AnomalyItem[] = [];

  resourceMap.forEach((history, resId) => {
    if (history.length < 2) return;

    // Check latest month vs average of prior months
    const latest = history[history.length - 1];
    const priors = history.slice(0, history.length - 1);
    const priorAvg = priors.reduce((acc, c) => acc + c.cost, 0) / priors.length;

    if (priorAvg > 0) {
      const variancePct = ((latest.cost - priorAvg) / priorAvg) * 100;
      // Trigger anomaly if current cost > 125% of prior average (i.e. variance > +25%)
      if (variancePct > 25 && latest.cost - priorAvg > 200) {
        anomalies.push({
          id: `ANOM-${resId}`,
          detected_at: `${latest.month}-28T00:00:00Z`,
          resource_id: resId,
          product: latest.prod || 'Medical Imaging Platform',
          service: latest.service,
          business_unit: latest.bu || 'Radiology',
          current_cost: parseFloat(latest.cost.toFixed(2)),
          expected_cost: parseFloat(priorAvg.toFixed(2)),
          variance_pct: parseFloat(variancePct.toFixed(1)),
          severity: variancePct > 80 ? 'HIGH' : 'MEDIUM',
          explanation: `Resource cost jumped to $${latest.cost.toFixed(2)} (${variancePct.toFixed(1)}% above 5-month moving average of $${priorAvg.toFixed(2)}). Investigation recommended.`,
        });
      }
    }
  });

  return anomalies;
}
