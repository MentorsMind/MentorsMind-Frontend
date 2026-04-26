import React from 'react';
import { Flame } from 'lucide-react';

export interface StreakWidgetProps {
  streakWeeks: number;
  subtitle?: string;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ streakWeeks, subtitle = 'Keep learning weekly to grow your flame.' }) => {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Learning streak</p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 shrink-0" aria-hidden />
            <span>
              {streakWeeks}
              <span className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400 ml-2">
                week{streakWeeks === 1 ? '' : 's'}
              </span>
            </span>
          </p>
          <p className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
            {streakWeeks} week streak!
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default StreakWidget;
