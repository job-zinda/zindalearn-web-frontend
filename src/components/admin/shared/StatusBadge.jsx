import React from 'react';

const STATUS_STYLES = {
  // Course statuses
  published:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  draft:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
  declined:   'bg-red-500/10 text-red-400 border-red-500/20',
  blocked:    'bg-red-500/10 text-red-400 border-red-500/20',
  suspended:  'bg-red-500/10 text-red-400 border-red-500/20',
  // User statuses
  active:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
  // Ticket statuses
  open:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  resolved:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed:     'bg-slate-500/10 text-slate-400 border-slate-500/20',
  // Payment statuses
  completed:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed:     'bg-red-500/10 text-red-400 border-red-500/20',
  approved:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rejected:   'bg-red-500/10 text-red-400 border-red-500/20',
  paid:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  // Priority
  high:       'bg-red-500/10 text-red-400 border-red-500/20',
  medium:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low:        'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || 'unknown').toLowerCase();
  const style = STATUS_STYLES[normalized] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${style} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
