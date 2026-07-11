import React from 'react';

/**
 * PageHeader — consistent page-level header for all admin pages.
 * Props:
 *   title       {string}    — required
 *   subtitle    {string}    — optional
 *   children    {ReactNode} — optional right-side action buttons
 */
const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
