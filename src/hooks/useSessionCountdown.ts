import { useState, useEffect } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isWithinOneHour: boolean;
  isStartingSoon: boolean; // within 15 minutes
  isStarted: boolean;
}

export const useSessionCountdown = (startTime: string): CountdownResult => {
  const calculate = (): CountdownResult => {
    const diff = new Date(startTime).getTime() - Date.now();
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isWithinOneHour: false, isStartingSoon: false, isStarted: true };
    }
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      isWithinOneHour: totalSeconds <= 3600,
      isStartingSoon: totalSeconds <= 900, // 15 minutes
      isStarted: false,
    };
  };

  const [countdown, setCountdown] = useState<CountdownResult>(calculate);

  useEffect(() => {
    const initial = calculate();
    // Only tick if session hasn't started and is within 1 hour
    if (initial.isStarted || !initial.isWithinOneHour) {
      setCountdown(initial);
      return;
    }

    setCountdown(initial);
    const interval = setInterval(() => {
      const next = calculate();
      setCountdown(next);
      if (next.isStarted) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return countdown;
};
