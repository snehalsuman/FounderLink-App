import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Yes, confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-black/8 dark:border-white/8 w-full max-w-sm p-6 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
          <AlertTriangle size={26} className="text-red-400" />
        </div>

        {/* Text */}
        <h2 className="text-lg font-bold text-[#1d1d1f] dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
