import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Package, CreditCard, Sliders, CheckCircle } from 'lucide-react';
import PageHeader from '../components/admin/PageHeader.jsx';

export default function NotificationsView({
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onNavigate
}) {
  const [activeTab, setActiveTab] = useState('ALL');

  const filtered = notifications.filter(n => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UNREAD') return !n.read;
    return n.category === activeTab;
  });

  return (
    <div id="notifications-page" className="space-y-6">
      <PageHeader
        title="Admin Notifications Center"
        subtitle="Stay updated with new bookings, instant payment alerts, package adjustments, and traveler notices."
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Other' },
          { label: 'Notifications' }
        ]}
        onNavigate={onNavigate}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllNotificationsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Mark All As Read</span>
            </button>
            <button
              type="button"
              onClick={onClearNotifications}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {['ALL', 'UNREAD', 'Bookings', 'Payments', 'Packages'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All Alerts' : tab === 'UNREAD' ? 'Unread Only' : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No notifications in this tab</p>
            <p className="text-xs text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkNotificationRead(notif.id)}
              className={`p-4 md:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                !notif.read ? 'bg-orange-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  {notif.category === 'Bookings' ? (
                    <Package className="w-5 h-5" />
                  ) : notif.category === 'Payments' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Sliders className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 font-medium">{notif.time}</span>
                {!notif.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkNotificationRead(notif.id);
                    }}
                    className="block text-[11px] font-semibold text-orange-600 hover:text-orange-700 mt-1"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
