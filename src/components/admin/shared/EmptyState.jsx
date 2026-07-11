import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — reusable empty state component.
 * Props:
 *   icon        {LucideIcon}  — optional, defaults to Inbox
 *   title       {string}
 *   description {string}
 *   action      {ReactNode}   — optional CTA button
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here',
  description = 'Try adjusting your filters or search criteria.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
