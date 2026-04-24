import { useState, useEffect } from 'react';

/**
 * Ensures a loading state lasts for at least a minimum duration to prevent flashing.
 */
export function useMinimumLoading(isLoading: boolean, minTime: number = 300) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setShouldShowLoading(true);
      setStartTime(Date.now());
    } else {
      if (startTime === null) {
        setShouldShowLoading(false);
        return;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= minTime) {
        setShouldShowLoading(false);
        setStartTime(null);
      } else {
        const timer = setTimeout(() => {
          setShouldShowLoading(false);
          setStartTime(null);
        }, minTime - elapsed);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, minTime, startTime]);

  return shouldShowLoading;
}
