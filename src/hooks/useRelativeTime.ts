import { useState, useEffect, useCallback } from 'react';

function getRelativeTimeString(date: Date): string {
  const now = new Date().getTime();
  const then = date.getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `Updated ${seconds} second${seconds === 1 ? '' : 's'} ago`;
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * Takes an ISO date string and returns a live-updating relative time string
 * (e.g. "Updated 5 seconds ago"), recomputing every second.
 */
export function useRelativeTime(isoString: string | undefined): string {
  const compute = useCallback(
    () => (isoString ? getRelativeTimeString(new Date(isoString)) : ''),
    [isoString]
  );

  const [text, setText] = useState<string>(compute);

  useEffect(() => {
    setText(compute);
    if (!isoString) return;

    const id = setInterval(() => {
      setText(compute);
    }, 1000);

    return () => clearInterval(id);
  }, [isoString, compute]);

  return text;
}

