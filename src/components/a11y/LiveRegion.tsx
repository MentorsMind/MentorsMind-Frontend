import React, { useEffect, useRef } from 'react';

interface LiveRegionProps {
  /** The message to announce */
  message: string;
  /** 'polite' waits for idle; 'assertive' interrupts immediately */
  politeness?: 'polite' | 'assertive';
  /** Clear the region after announcing (ms). 0 = never clear */
  clearAfter?: number;
}

/**
 * An ARIA live region that announces dynamic content changes to screen readers.
 * Renders visually hidden but is read aloud when `message` changes.
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 5000,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !ref.current) return;
    // Brief clear-then-set ensures re-announcement of identical messages
    ref.current.textContent = '';
    const setTimer = setTimeout(() => {
      if (ref.current) ref.current.textContent = message;
    }, 50);

    const clearTimer =
      clearAfter > 0
        ? setTimeout(() => { if (ref.current) ref.current.textContent = ''; }, clearAfter)
        : null;

    return () => {
      clearTimeout(setTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [message, clearAfter]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
};

export default LiveRegion;
