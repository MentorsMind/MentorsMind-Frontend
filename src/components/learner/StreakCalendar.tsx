import React, { useId } from 'react';
import type { HeatLevel } from '../../hooks/useStreak';

export interface StreakCalendarProps {
  heatGrid: HeatLevel[][];
}

const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: 'bg-gray-100 dark:bg-gray-800',
  1: 'bg-emerald-200/80 dark:bg-emerald-900/50',
  2: 'bg-emerald-400/90 dark:bg-emerald-700/70',
  3: 'bg-emerald-600 dark:bg-emerald-600',
  4: 'bg-emerald-800 dark:bg-emerald-500',
};

const ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({ heatGrid }) => {
  const weeks = heatGrid.length;
  const titleId = useId();

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 id={titleId} className="text-lg font-bold text-gray-900 dark:text-white">
            Last 12 weeks
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Colored squares show learning activity</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2" role="img" aria-labelledby={titleId}>
        <div className="inline-flex flex-col gap-1 min-w-0">
          {Array.from({ length: 7 }, (_, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-400 w-7 shrink-0 text-right pr-1" aria-hidden>
                {ROW_LABELS[dayIdx]}
              </span>
              {Array.from({ length: weeks }, (_, weekIdx) => {
                const level = (heatGrid[weekIdx]?.[dayIdx] ?? 0) as HeatLevel;
                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm shrink-0 ${LEVEL_CLASS[level]}`}
                    title={`Week ${weekIdx + 1}, ${ROW_LABELS[dayIdx]} — activity ${level}/4`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-400">
        <span>Less</span>
        {([0, 1, 2, 3, 4] as HeatLevel[]).map((lv) => (
          <span key={lv} className={`w-3.5 h-3.5 rounded-sm ${LEVEL_CLASS[lv]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakCalendar;
