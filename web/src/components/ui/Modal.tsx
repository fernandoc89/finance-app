import { X } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}) => {
  // Fechar com ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
          animate-slide-up overflow-hidden
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
