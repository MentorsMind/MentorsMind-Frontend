import React from 'react';
import { Coins } from 'lucide-react';

export interface MilestoneProgressProps {
  currentSessions: number;
  targetSessions: number;
  bonusMnt: number;
}

const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  currentSessions,
  targetSessions,
  bonusMnt,
}) => {
  const pct = targetSessions > 0 ? Math.min(100, Math.round((currentSessions / targetSessions) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="w-5 h-5 text-amber-500 shrink-0" aria-hidden />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Streak milestone</h3>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {currentSessions}/{targetSessions} sessions to earn {bonusMnt} MNT bonus
      </p>
      <div
        className="mt-4 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentSessions}
        aria-valuemin={0}
        aria-valuemax={targetSessions}
        aria-label={`Milestone progress ${currentSessions} of ${targetSessions} sessions`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {(() => {
          const left = Math.max(0, targetSessions - currentSessions);
          if (left === 0) return 'Bonus unlocked on your next qualifying session.';
          return `Finish ${left} more session${left === 1 ? '' : 's'} to unlock the bonus.`;
        })()}
      </p>
    </div>
  );
};

export default MilestoneProgress;
