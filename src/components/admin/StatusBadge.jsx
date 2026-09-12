import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function StatusBadge({ status, type = 'status' }) {
  const norm = String(status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = null;

  if (norm === 'confirmed' || norm === 'paid' || norm === 'active' || norm === 'published' || norm === 'success') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    Icon = CheckCircle;
  } else if (norm === 'pending' || norm === 'draft') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    Icon = Clock;
  } else if (norm === 'cancelled' || norm === 'failed' || norm === 'inactive') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    Icon = XCircle;
  } else if (norm === 'processing' || norm === 'refunded') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
    Icon = norm === 'processing' ? RefreshCw : AlertCircle;
  } else if (norm === 'customizable') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200/80 font-medium';
  } else if (norm === 'fixed') {
    styles = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
  }

  return (
    <span
      id={`badge-${norm}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles} whitespace-nowrap`}
    >
      {Icon && <Icon className={`w-3 h-3 ${norm === 'processing' ? 'animate-spin' : ''}`} />}
      {status}
    </span>
  );
}
