import React from 'react';

interface TimeInvestedProps {
  totalMinutes: number;
  averageSessionDuration: number;
  totalSessions: number;
}

const TimeInvested: React.FC<TimeInvestedProps> = ({
  totalMinutes,
  averageSessionDuration,
  totalSessions,
}) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="bg-gradient-to-br from-stellar to-stellar/80 rounded-3xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Time Invested</div>
          <div className="text-2xl font-black">
            {hours}h {minutes}m
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div>
          <div className="text-xs text-white/70 mb-1">Avg Session</div>
          <div className="text-lg font-bold">{Math.round(averageSessionDuration)} min</div>
        </div>
        <div>
          <div className="text-xs text-white/70 mb-1">Total Sessions</div>
          <div className="text-lg font-bold">{totalSessions}</div>
        </div>
      </div>
    </div>
  );
};

export default TimeInvested;
