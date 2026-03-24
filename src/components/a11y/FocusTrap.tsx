import React, { useRef, useEffect } from 'react';
import { trapFocus } from '../../utils/a11y.utils';

interface FocusTrapProps {
  children: React.ReactNode;
  /** Whether the trap is active */
  active?: boolean;
  /** Element to return focus to when trap deactivates */
  returnFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
}

/**
 * Traps keyboard focus within its children when `active` is true.
 * Ideal for modals, drawers, and dialogs.
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  returnFocusRef,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const cleanup = trapFocus(containerRef.current);
    return () => {
      cleanup();
      returnFocusRef?.current?.focus();
    };
  }, [active, returnFocusRef]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default FocusTrap;
