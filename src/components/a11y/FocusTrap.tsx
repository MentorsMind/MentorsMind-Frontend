import { useEffect, useRef, ReactNode } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

export default function FocusTrap({ children, active = true, className }: FocusTrapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    // store previously focused element so we can restore focus when trap is removed
    const previous = document.activeElement as HTMLElement | null;

    const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    // Focus the first focusable element, or the container as a fallback
    if (first) first.focus(); else { el.tabIndex = -1; el.focus(); }

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    el.addEventListener('keydown', handler);

    return () => {
      el.removeEventListener('keydown', handler);
      // restore previous focus
      try {
        previous?.focus();
      } catch {}
    };
  }, [active]);

  return <div ref={ref} className={className}>{children}</div>;
}
