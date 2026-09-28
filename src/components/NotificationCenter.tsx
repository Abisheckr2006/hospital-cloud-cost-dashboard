import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, AlertCircle, PiggyBank, FileCheck, X } from 'lucide-react';
import { NotificationItem } from '../types/index.js';

interface NotificationCenterProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Cost Anomaly Triggered',
      message: 'Resource res-analytics-db-003 daily cost spiked by +65% ($1,053.18/day).',
      timestamp: '10 min ago',
      type: 'ANOMALY',
      severity: 'CRITICAL',
      read: false,
      actionTab: 'cost-allocation',
    },
    {
      id: 'n2',
      title: 'New Savings Opportunity',
      message: 'Identified $3,200/month idle GPU downsizing opportunity in Analytics.',
      timestamp: '1 hour ago',
      type: 'SAVINGS',
      severity: 'WARNING',
      read: false,
      actionTab: 'cost-optimization',
    },
    {
      id: 'n3',
      title: 'Data Feed Warning',
      message: 'AWS Billing ingestion feed is 2 hours stale. SLA SLA: 60 min.',
      timestamp: '2 hours ago',
      type: 'STALE_DATA',
      severity: 'WARNING',
      read: false,
      actionTab: 'data-quality',
    },
    {
      id: 'n4',
      title: 'Change Request Pending',
      message: 'CR-DEMO-001 reallocating $10,531 GPU database spend requires review.',
      timestamp: '4 hours ago',
      type: 'CHANGE_REQUEST',
      severity: 'INFO',
      read: true,
      actionTab: 'change-review',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleAction = (n: NotificationItem) => {
    markSingleAsRead(n.id);
    if (n.actionTab) {
      onNavigateTab(n.actionTab);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-xs">FinOps Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => {
                const isCritical = n.severity === 'CRITICAL';
                const isWarning = n.severity === 'WARNING';
                return (
                  <div
                    key={n.id}
                    onClick={() => handleAction(n)}
                    className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                      !n.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'ANOMALY' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {n.type === 'SAVINGS' && <PiggyBank className="w-4 h-4 text-emerald-600" />}
                      {n.type === 'STALE_DATA' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      {n.type === 'CHANGE_REQUEST' && <FileCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold text-xs ${
                            isCritical ? 'text-red-700' : isWarning ? 'text-amber-800' : 'text-slate-800'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
