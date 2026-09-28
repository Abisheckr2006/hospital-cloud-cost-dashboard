import { Database } from 'sql.js';
import { query, queryOne, run, saveDb } from '../database/db.js';
import { ChangeRequest, ChangeStatus, DemoRole } from '../types/index.js';
import { runAllocationEngine } from '../allocation/engine.js';

export function createChangeRequest(
  db: Database,
  params: {
    requester: string;
    role: DemoRole;
    product: string;
    business_unit: string;
    resource_id: string;
    proposed_allocation: string;
    reason: string;
  }
): ChangeRequest {
  const changeId = `CR-${Date.now().toString().slice(-6)}`;

  // Find existing allocation for this resource
  const existingTag = queryOne<{ business_unit: string; product_id: string }>(
    db,
    'SELECT business_unit, product_id FROM allocation_tags WHERE resource_id = ?',
    [params.resource_id]
  );

  const oldAllocation = existingTag
    ? `${existingTag.business_unit} / ${existingTag.product_id}`
    : 'Unallocated / Untagged';

  // Calculate cost impact across billing records for this resource
  const costImpactRow = queryOne<{ total: number }>(
    db,
    'SELECT SUM(cost) as total FROM billing_records WHERE resource_id = ?',
    [params.resource_id]
  );
  const costImpact = costImpactRow?.total ? parseFloat(costImpactRow.total.toFixed(2)) : 0;

  const previousStateJson = JSON.stringify({
    resource_id: params.resource_id,
    old_business_unit: existingTag?.business_unit || 'Unallocated',
    old_product: existingTag?.product_id || 'Unallocated',
  });

  const isHighImpact = costImpact >= 5000;
  const initialStatus = isHighImpact ? ChangeStatus.PendingReview : ChangeStatus.Proposed;

  const createdAt = new Date().toISOString();

  run(db, `
    INSERT INTO change_requests (
      change_id, requester, role, product, business_unit, resource_id,
      old_allocation, proposed_allocation, cost_impact, reason, created_at,
      status, reviewer, reviewed_at, previous_state_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    changeId,
    params.requester,
    params.role,
    params.product,
    params.business_unit,
    params.resource_id,
    oldAllocation,
    params.proposed_allocation,
    costImpact,
    params.reason,
    createdAt,
    initialStatus,
    null,
    null,
    previousStateJson,
  ]);

  // Log to audit log
  run(db, `
    INSERT INTO audit_logs (
      audit_id, timestamp, user, role, action, object_type, object_id,
      old_value, new_value, reason, status, impact_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    `AUDIT-${Date.now().toString().slice(-6)}`,
    createdAt,
    params.requester,
    params.role,
    'CREATE_CHANGE_REQUEST',
    'change_requests',
    changeId,
    oldAllocation,
    params.proposed_allocation,
    params.reason,
    'SUCCESS',
    costImpact,
  ]);

  saveDb(db);
  return getChangeRequestById(db, changeId)!;
}

export function approveChangeRequest(
  db: Database,
  changeId: string,
  reviewer: string,
  role: DemoRole
): { success: boolean; message: string; changeRequest?: ChangeRequest } {
  if (role !== DemoRole.FinOpsAnalyst) {
    return { success: false, message: 'Forbidden: Only FinOps Analyst can approve change requests' };
  }

  const cr = getChangeRequestById(db, changeId);
  if (!cr) {
    return { success: false, message: 'Change request not found' };
  }

  if (cr.status !== ChangeStatus.PendingReview && cr.status !== ChangeStatus.Proposed) {
    return { success: false, message: `Cannot approve request with status ${cr.status}` };
  }

  const reviewedAt = new Date().toISOString();

  // Apply change to allocation_tags
  const [newBu, newProd] = cr.proposed_allocation.split(' / ');
  const existing = queryOne(db, 'SELECT id FROM allocation_tags WHERE resource_id = ?', [cr.resource_id]);

  if (existing) {
    run(db, `
      UPDATE allocation_tags 
      SET business_unit = ?, product_id = ?, tag_last_updated = ?
      WHERE resource_id = ?
    `, [newBu || cr.business_unit, newProd || cr.product, reviewedAt, cr.resource_id]);
  } else {
    run(db, `
      INSERT INTO allocation_tags (resource_id, cloud_account_id, business_unit, product_id, feature_id, allocation_status, tag_last_updated, tag_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [cr.resource_id, 'ACCT-SHARED', newBu || cr.business_unit, newProd || cr.product, 'General', 'TAGGED', reviewedAt, 'Manual-FinOps-Approved']);
  }

  // Update status to APPLIED
  run(db, `
    UPDATE change_requests
    SET status = ?, reviewer = ?, reviewed_at = ?
    WHERE change_id = ?
  `, [ChangeStatus.Applied, reviewer, reviewedAt, changeId]);

  // Create Audit Record
  run(db, `
    INSERT INTO audit_logs (
      audit_id, timestamp, user, role, action, object_type, object_id,
      old_value, new_value, reason, status, impact_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    `AUDIT-${Date.now().toString().slice(-6)}`,
    reviewedAt,
    reviewer,
    role,
    'APPROVE_CHANGE_REQUEST',
    'change_requests',
    changeId,
    cr.old_allocation,
    cr.proposed_allocation,
    `Approved by ${reviewer}: ${cr.reason}`,
    'APPLIED',
    cr.cost_impact,
  ]);

  // Re-run allocation engine to apply updated mapping
  runAllocationEngine(db);
  saveDb(db);

  return {
    success: true,
    message: `Change request ${changeId} approved and applied successfully. Re-allocation completed.`,
    changeRequest: getChangeRequestById(db, changeId)!,
  };
}

export function rejectChangeRequest(
  db: Database,
  changeId: string,
  reviewer: string,
  role: DemoRole,
  reason: string = 'Rejected by FinOps reviewer'
): { success: boolean; message: string; changeRequest?: ChangeRequest } {
  if (role !== DemoRole.FinOpsAnalyst) {
    return { success: false, message: 'Forbidden: Only FinOps Analyst can reject change requests' };
  }

  const cr = getChangeRequestById(db, changeId);
  if (!cr) {
    return { success: false, message: 'Change request not found' };
  }

  const reviewedAt = new Date().toISOString();

  run(db, `
    UPDATE change_requests
    SET status = ?, reviewer = ?, reviewed_at = ?
    WHERE change_id = ?
  `, [ChangeStatus.Rejected, reviewer, reviewedAt, changeId]);

  run(db, `
    INSERT INTO audit_logs (
      audit_id, timestamp, user, role, action, object_type, object_id,
      old_value, new_value, reason, status, impact_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    `AUDIT-${Date.now().toString().slice(-6)}`,
    reviewedAt,
    reviewer,
    role,
    'REJECT_CHANGE_REQUEST',
    'change_requests',
    changeId,
    cr.old_allocation,
    cr.proposed_allocation,
    reason,
    'REJECTED',
    cr.cost_impact,
  ]);

  saveDb(db);
  return {
    success: true,
    message: `Change request ${changeId} has been rejected.`,
    changeRequest: getChangeRequestById(db, changeId)!,
  };
}

export function rollbackChangeRequest(
  db: Database,
  changeId: string,
  user: string,
  role: DemoRole,
  reason: string = 'Operational rollback executed'
): { success: boolean; message: string; changeRequest?: ChangeRequest } {
  if (role !== DemoRole.FinOpsAnalyst) {
    return { success: false, message: 'Forbidden: Only FinOps Analyst can execute rollback' };
  }

  const cr = getChangeRequestById(db, changeId);
  if (!cr) {
    return { success: false, message: 'Change request not found' };
  }

  if (cr.status !== ChangeStatus.Applied) {
    return { success: false, message: `Cannot rollback request with status ${cr.status}. Only APPLIED changes can be rolled back.` };
  }

  let prevState: any = null;
  try {
    if (cr.previous_state_json) {
      prevState = JSON.parse(cr.previous_state_json);
    }
  } catch (e) {
    console.error('Error parsing previous_state_json:', e);
  }

  const rollbackTimestamp = new Date().toISOString();

  // Restore previous tag in allocation_tags
  if (prevState && prevState.old_business_unit && prevState.old_business_unit !== 'Unallocated') {
    run(db, `
      UPDATE allocation_tags
      SET business_unit = ?, product_id = ?, tag_last_updated = ?
      WHERE resource_id = ?
    `, [prevState.old_business_unit, prevState.old_product, rollbackTimestamp, cr.resource_id]);
  } else {
    // If it was untagged originally, remove the tag
    run(db, 'DELETE FROM allocation_tags WHERE resource_id = ?', [cr.resource_id]);
  }

  // Update change request status to ROLLED_BACK
  run(db, `
    UPDATE change_requests
    SET status = ?
    WHERE change_id = ?
  `, [ChangeStatus.RolledBack, changeId]);

  // Insert critical ROLLBACK_EXECUTED audit record
  run(db, `
    INSERT INTO audit_logs (
      audit_id, timestamp, user, role, action, object_type, object_id,
      old_value, new_value, reason, status, impact_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    `AUDIT-${Date.now().toString().slice(-6)}`,
    rollbackTimestamp,
    user,
    role,
    'ROLLBACK_EXECUTED',
    'change_requests',
    changeId,
    cr.proposed_allocation,
    cr.old_allocation,
    `Rollback executed by ${user}. Reason: ${reason}`,
    'ROLLED_BACK',
    cr.cost_impact,
  ]);

  // Re-run allocation engine to reflect restored state
  runAllocationEngine(db);
  saveDb(db);

  return {
    success: true,
    message: `Rollback executed successfully for ${changeId}. Restored mapping: ${cr.old_allocation}.`,
    changeRequest: getChangeRequestById(db, changeId)!,
  };
}

export function getChangeRequestById(db: Database, changeId: string): ChangeRequest | null {
  return queryOne<ChangeRequest>(db, 'SELECT * FROM change_requests WHERE change_id = ?', [changeId]);
}

export function getAllChangeRequests(db: Database): ChangeRequest[] {
  return query<ChangeRequest>(db, 'SELECT * FROM change_requests ORDER BY id DESC');
}

export function getAuditLogs(db: Database): any[] {
  return query(db, 'SELECT * FROM audit_logs ORDER BY id DESC');
}
