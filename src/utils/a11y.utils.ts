/**
 * Accessibility utility functions
 */

/** Generate a unique ID for ARIA relationships */
export const generateId = (prefix = 'a11y'): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/** Check if the user prefers reduced motion */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Check if the user prefers high contrast */
export const prefersHighContrast = (): boolean =>
  window.matchMedia('(prefers-contrast: more)').matches;

/** Trap focus within an element — returns cleanup function */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handler = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  container.addEventListener('keydown', handler);
  first?.focus();
  return () => container.removeEventListener('keydown', handler);
};

/** Announce a message to screen readers via a live region */
export const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite'): void => {
  const id = `sr-announce-${politeness}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('aria-live', politeness);
    el.setAttribute('aria-atomic', 'true');
    el.className = 'sr-only';
    document.body.appendChild(el);
  }
  // Clear then set to trigger re-announcement
  el.textContent = '';
  requestAnimationFrame(() => { el!.textContent = message; });
};

/** Get keyboard-friendly class string for focus rings */
export const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2';

/** Map error messages to ARIA-compatible error objects */
export const buildAriaError = (id: string, message: string) => ({
  'aria-describedby': id,
  'aria-invalid': 'true' as const,
  errorId: id,
  errorMessage: message,
});
