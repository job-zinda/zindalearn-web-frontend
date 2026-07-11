import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ConfirmModal — reusable destructive action confirmation modal.
 * Props:
 *   isOpen        {boolean}
 *   onClose       {function}
 *   onConfirm     {function(e)} — receives the form submit event
 *   title         {string}
 *   description   {string|ReactNode}
 *   confirmLabel  {string}  — default: "Confirm"
 *   loading       {boolean}
 *   children      {ReactNode} — optional form fields (e.g., reason textarea)
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  loading = false,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onConfirm} className="p-6 space-y-5">
          {/* Icon + Title */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              {description && (
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {/* Optional fields (e.g., reason textarea) */}
          {children && <div className="space-y-3">{children}</div>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmModal;
