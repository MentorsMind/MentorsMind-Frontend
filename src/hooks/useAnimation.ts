import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { prefersReducedMotion, clamp, mapRange } from '../utils/animation.utils';

/** Respects prefers-reduced-motion media query */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
};

/** Animate a numeric value from 0 to target using requestAnimationFrame */
export const useCountUp = (
  target: number,
  duration = 1200,
  enabled = true
): number => {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = clamp((now - start) / duration, 0, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled, reduced]);

  return value;
};

/** Trigger an animation when an element enters the viewport */
export const useInView = (
  options: IntersectionObserverInit = { threshold: 0.15 }
): [RefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
};

/** Parallax offset based on scroll position */
export const useParallax = (speed = 0.3): number => {
  const [offset, setOffset] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const handleScroll = () => setOffset(window.scrollY * speed);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, reduced]);

  return offset;
};

/** Animate a progress value with easing */
export const useAnimatedProgress = (
  target: number,
  duration = 800
): number => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setProgress(target);
      return;
    }
    const start = performance.now();
    const from = progress;
    const step = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(mapRange(eased, 0, 1, from, target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, reduced]);

  return progress;
};

/** Toggle a boolean with an optional delay for exit animations */
export const useDelayedVisible = (
  visible: boolean,
  exitDelay = 200
): boolean => {
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
    } else {
      const t = setTimeout(() => setRendered(false), exitDelay);
      return () => clearTimeout(t);
    }
  }, [visible, exitDelay]);

  return rendered;
};

/** Shake animation trigger for form validation errors */
export const useShake = (): [boolean, () => void] => {
  const [shaking, setShaking] = useState(false);

  const trigger = useCallback(() => {
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 500);
    return () => clearTimeout(t);
  }, []);

  return [shaking, trigger];
};
