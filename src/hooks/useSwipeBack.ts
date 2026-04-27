import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UseSwipeBackOptions {
  enabled?: boolean;
  edgeThreshold?: number;
  minDisplacement?: number;
  minVelocity?: number;
}

export interface UseSwipeBackReturn {
  swipeProgress: number;
  containerProps: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

function isInsideHorizontalScrollable(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const overflowX = style.overflowX;
    if (overflowX === 'auto' || overflowX === 'scroll') {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function useSwipeBack({
  enabled = true,
  edgeThreshold = 30,
  minDisplacement = 50,
  minVelocity = 0.3,
}: UseSwipeBackOptions = {}): UseSwipeBackReturn {
  const navigate = useNavigate();
  const [swipeProgress, setSwipeProgress] = useState(0);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const active = useRef(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches[0];
      if (touch.clientX <= edgeThreshold) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        startTime.current = Date.now();
        active.current = true;
      }
    },
    [enabled, edgeThreshold],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !active.current || startX.current === null || startY.current === null) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // Cancel if not horizontal-dominant
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        active.current = false;
        setSwipeProgress(0);
        return;
      }

      // Cancel if swiping left or inside a horizontally scrollable element
      if (deltaX <= 0 || isInsideHorizontalScrollable(e.target)) {
        active.current = false;
        setSwipeProgress(0);
        return;
      }

      setSwipeProgress(deltaX / window.innerWidth);
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !active.current || startX.current === null || startTime.current === null) {
        active.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaTime = Date.now() - startTime.current;
      const velocity = deltaTime > 0 ? deltaX / deltaTime : 0;

      if (deltaX >= minDisplacement && velocity >= minVelocity) {
        navigate(-1);
      } else {
        setSwipeProgress(0);
      }

      active.current = false;
      startX.current = null;
      startY.current = null;
      startTime.current = null;
    },
    [enabled, minDisplacement, minVelocity, navigate],
  );

  return {
    swipeProgress,
    containerProps: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
