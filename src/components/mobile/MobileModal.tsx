import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import FocusTrap from '../a11y/FocusTrap';
import { useMobile } from '../../hooks/useMobile';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'bottom' | 'center' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const { isMobile } = useMobile();

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add safe area padding for notched devices
      if (isMobile) {
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingBottom = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingBottom = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const positionClasses = {
    bottom: 'items-end',
    center: 'items-center',
    full: 'items-stretch',
  };

  const modalClasses = {
    bottom: 'rounded-t-2xl max-h-[90vh]',
    center: 'rounded-2xl max-h-[80vh] mx-4',
    full: 'rounded-none h-full',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex ${positionClasses[position]} justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200`}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <FocusTrap active>
        <div
          className={`bg-white w-full overflow-hidden flex flex-col ${modalClasses[position]} ${
            position === 'bottom' ? 'animate-in slide-in-from-bottom duration-300' : ''
          } ${position === 'center' ? 'animate-in zoom-in-95 duration-200' : ''} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

/**
 * Bottom sheet modal variant.
 * On mobile (<768px): full-screen panel sliding up from bottom with drag handle and swipe-to-dismiss.
 * On desktop (≥768px): centered dialog overlay.
 */
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const { isMobile } = useMobile();
  const touchStartY = React.useRef<number | null>(null);

  // Scroll lock while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (deltaY > 60) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div
            className="pt-3 pb-2 cursor-grab"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          </div>

          {/* Header */}
          {(title) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <h2 id="bottom-sheet-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: centered dialog
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      <div
        className="bg-white rounded-2xl max-h-[80vh] w-full max-w-lg mx-4 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <h2 id="bottom-sheet-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Full screen modal variant
 */
export const FullScreenModal: React.FC<Omit<MobileModalProps, 'position'>> = (props) => {
  return <MobileModal {...props} position="full" />;
};

/**
 * Action sheet component for mobile
 */
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'primary';
    icon?: React.ReactNode;
  }>;
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  actions,
  cancelLabel = 'Cancel',
}) => {
  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      showCloseButton={false}
      className="pb-safe"
    >
      <div className="p-4">
        {title && (
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          </div>
        )}

        <div className="space-y-2">
          {actions.map((action, index) => {
            const variantClasses = {
              default: 'text-gray-900 hover:bg-gray-100',
              danger: 'text-red-600 hover:bg-red-50',
              primary: 'text-primary-600 hover:bg-primary-50',
            };

            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                  variantClasses[action.variant || 'default']
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 text-base font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </MobileModal>
  );
};
