import React from 'react';

interface SessionTimerProps {
  duration: number; // in seconds
  isLive?: boolean;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SessionTimer: React.FC<SessionTimerProps> = ({ duration, isLive = true }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2">
      {isLive && (
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
      <span className="text-white font-mono text-lg font-bold">
        {formatDuration(duration)}
      </span>
      {isLive && (
        <span className="text-white/60 text-xs font-medium">LIVE</span>
      )}
    </div>
  );
};

export default SessionTimer;
