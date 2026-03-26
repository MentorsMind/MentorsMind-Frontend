import React from 'react';
import { useSessionCountdown } from '../../hooks/useSessionCountdown';

interface SessionCountdownProps {
  startTime: string;
  className?: string;
}

const SessionCountdown: React.FC<SessionCountdownProps> = ({ startTime, className = '' }) => {
  const { hours, minutes, seconds, isWithinOneHour, isStartingSoon, isStarted } = useSessionCountdown(startTime);

  if (isStarted) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-green-600 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        In progress
      </span>
    );
  }

  if (!isWithinOneHour) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold tabular-nums ${
        isStartingSoon ? 'text-red-500' : 'text-amber-500'
      } ${className}`}
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`}
    </span>
  );
};

export default SessionCountdown;
