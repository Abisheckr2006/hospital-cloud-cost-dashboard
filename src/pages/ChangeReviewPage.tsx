import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  ShieldAlert,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ChangeRequestItem, DemoRole } from '../types/index.js';

interface ChangeReviewPageProps {
  currentRole: DemoRole;
}

export const ChangeReviewPage: React.FC<ChangeReviewPageProps> = ({ currentRole }) => {
  const [requests, setRequests] = useState<ChangeRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Change Request Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newReq, setNewReq] = useState({
    requester: currentRole === DemoRole.ProductOwner ? 'Dr. Sarah Lin (Radiology)' : 'FinOps Lead',
    product: 'Medical Imaging Platform',
    business_unit: 'Radiology',
    resource_id: 'i-imaging-gpu-001',
    proposed_allocation: 'Radiology / Medical Imaging Platform / PACS Viewer',
    reason: 'Monthly GPU model inference shifted 100% to Radiology clinical workflows',
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const items = await api.getChangeRequests();
      setRequests(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await api.approveChangeRequest(id, 'Lead FinOps Engineer', currentRole);
      setFeedback({ message: `Change Request ${id} approved and applied to live allocation engine!`, type: 'success' });
      await loadRequests();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await api.rejectChangeRequest(id, 'Lead FinOps Engineer', currentRole, 'Rejected per FinOps quarterly tagging policy review');
      setFeedback({ message: `Change Request ${id} rejected.`, type: 'success' });
      await loadRequests();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollback = async (id: string) => {
    try {
      setActionLoading(id);
      await api.rollbackChangeRequest(id, 'Lead FinOps Engineer', currentRole, 'Rollback initiated by FinOps lead: restoring baseline tag');
      setFeedback({ message: `Change Request ${id} successfully rolled back. Allocation restored and engine re-synchronized!`, type: 'success' });
      await loadRequests();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createChangeRequest({
        ...newReq,
        role: currentRole,
      });
      setIsModalOpen(false);
      setFeedback({ message: 'New Change Request submitted for FinOps review!', type: 'success' });
      await loadRequests();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  const canReview = currentRole === DemoRole.FinOpsAnalyst;

  return (
    <div className="p-8 space-y-6">
      {/* Header & Submit Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              FinOps Change Management &amp; Rollback Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-controlled approval workflow for high-impact attribution rules (&ge; $5,000 threshold).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Allocation Change</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        canReview ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center space-x-3">
          <UserCheck className="w-5 h-5 text-teal-600" />
          <div className="text-xs">
            <p className="font-bold">
              Active Role: <span className="uppercase">{currentRole.replace('_', ' ')}</span>
            </p>
            <p className="text-slate-600">
              {canReview
                ? 'Authorized to Approve, Reject, and Execute Rollbacks on all allocation change requests.'
                : 'View and Propose changes. Only FinOps Analyst role holds authorization to Approve or Rollback.'}
            </p>
          </div>
        </div>
        {!canReview && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded">
            Review Actions Locked (Switch to FinOps Analyst above)
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['All', 'PENDING_REVIEW', 'APPROVED', 'APPLIED', 'REJECTED', 'ROLLED_BACK'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === tab
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Change Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Change ID</th>
                <th className="p-3 font-semibold">Requester</th>
                <th className="p-3 font-semibold">Target Resource</th>
                <th className="p-3 font-semibold">Current Allocation</th>
                <th className="p-3 font-semibold">Proposed Allocation</th>
                <th className="p-3 font-semibold text-right">Spend Impact</th>
                <th className="p-3 font-semibold text-center">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading change requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No change requests in {statusFilter} status.
                  </td>
                </tr>
              ) : (
                filtered.map((cr) => {
                  const isPending = cr.status === 'PENDING_REVIEW' || cr.status === 'PROPOSED';
                  const isApplied = cr.status === 'APPLIED';
                  const isRolledBack = cr.status === 'ROLLED_BACK';

                  return (
                    <tr key={cr.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-teal-700">{cr.change_id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{cr.requester}</div>
                        <div className="text-[11px] text-slate-400">{cr.role}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700">{cr.resource_id}</td>
                      <td className="p-3 text-slate-500 max-w-[150px] truncate" title={cr.old_allocation}>
                        {cr.old_allocation}
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-[150px] truncate" title={cr.proposed_allocation}>
                        {cr.proposed_allocation}
                      </td>
                      <td className="p-3 font-bold text-slate-900 text-right">
                        ${cr.cost_impact.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cr.status === 'APPLIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cr.status === 'PENDING_REVIEW' || cr.status === 'PROPOSED'
                            ? 'bg-amber-100 text-amber-800'
                            : cr.status === 'ROLLED_BACK'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cr.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(cr.change_id)}
                                disabled={!canReview || actionLoading === cr.change_id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] transition disabled:opacity-40"
                                title={canReview ? 'Approve and execute attribution' : 'Requires FinOps Analyst role'}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(cr.change_id)}
                                disabled={!canReview || actionLoading === cr.change_id}
                                className="px-2 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded font-semibold text-[11px] transition disabled:opacity-40"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApplied && (
                            <button
                              id={`btn-rollback-${cr.change_id}`}
                              onClick={() => handleRollback(cr.change_id)}
                              disabled={!canReview || actionLoading === cr.change_id}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[11px] flex items-center space-x-1 transition disabled:opacity-40 shadow-xs"
                              title="Revert attribution back to old state and log to audit trail"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Rollback</span>
                            </button>
                          )}

                          {isRolledBack && (
                            <span className="text-[11px] text-purple-700 font-semibold italic">
                              Reverted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Propose Cloud Cost Reallocation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Requester Name</label>
                <input
                  type="text"
                  value={newReq.requester}
                  onChange={(e) => setNewReq({ ...newReq, requester: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Resource ID</label>
                <input
                  type="text"
                  value={newReq.resource_id}
                  onChange={(e) => setNewReq({ ...newReq, resource_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                  placeholder="e.g. i-imaging-gpu-001"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Business Unit</label>
                <select
                  value={newReq.business_unit}
                  onChange={(e) => setNewReq({ ...newReq, business_unit: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                >
                  <option value="Radiology">Radiology</option>
                  <option value="Emergency Services">Emergency Services</option>
                  <option value="Clinical Analytics">Clinical Analytics</option>
                  <option value="Patient Portal">Patient Portal</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Proposed Allocation Path</label>
                <input
                  type="text"
                  value={newReq.proposed_allocation}
                  onChange={(e) => setNewReq({ ...newReq, proposed_allocation: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business Justification / Reason</label>
                <textarea
                  value={newReq.reason}
                  onChange={(e) => setNewReq({ ...newReq, reason: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 h-20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
                >
                  Submit for FinOps Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
