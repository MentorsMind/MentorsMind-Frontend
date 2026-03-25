/**
 * Animation utility functions and constants
 */

/** Check if the user prefers reduced motion */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** Easing curves */
export const EASINGS = {
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/** Duration presets in ms */
export const DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

/** Stagger delay for list animations */
export const staggerDelay = (index: number, base = 60): number => index * base;

/** Build a CSS transition string */
export const buildTransition = (
  properties: string[],
  duration = DURATIONS.normal,
  easing = EASINGS.easeOut,
  delay = 0
): string =>
  properties
    .map((p) => `${p} ${duration}ms ${easing}${delay ? ` ${delay}ms` : ''}`)
    .join(', ');

/** Clamp a value between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Map a value from one range to another */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
};

/** Tailwind class helpers for common animation patterns */
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-200',
  slideUp: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in fade-in slide-in-from-top-4 duration-300',
  slideLeft: 'animate-in fade-in slide-in-from-right-4 duration-300',
  slideRight: 'animate-in fade-in slide-in-from-left-4 duration-300',
  scaleIn: 'animate-in fade-in zoom-in-95 duration-200',
  scaleOut: 'animate-out fade-out zoom-out-95 duration-150',
} as const;
