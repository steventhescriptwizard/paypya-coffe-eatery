import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl border border-border-light dark:border-border-dark transform transition-all scale-100 opacity-100 pointer-events-auto p-6 flex flex-col gap-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600'}`}>
              <span className="material-symbols-outlined text-2xl">
                {isDestructive ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main-light dark:text-white leading-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-sub-light dark:text-text-sub-dark leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-sub-light dark:text-text-sub-dark hover:bg-background-light dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 shadow-red-500/20' 
                  : 'bg-primary hover:bg-blue-600 focus:ring-primary shadow-blue-500/20'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
