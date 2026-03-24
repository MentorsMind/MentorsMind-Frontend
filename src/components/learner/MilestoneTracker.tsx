import React from 'react';
import type { Milestone } from '../../types';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onToggle: (id: string) => void;
  compact?: boolean;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ milestones, onToggle, compact = false }) => {
  const completed = milestones.filter(m => m.completed).length;
  const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stellar rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% of milestones completed`}
          />
        </div>
        <span className="text-xs font-bold text-gray-500 tabular-nums shrink-0">{completed}/{milestones.length}</span>
      </div>

      {/* Milestone list */}
      <div className={`space-y-2 ${compact ? 'max-h-40 overflow-y-auto' : ''}`} role="list">
        {milestones.map(m => (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            role="listitem"
            aria-pressed={m.completed}
            className="w-full flex items-start gap-3 text-left group hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              m.completed ? 'bg-stellar border-stellar text-white' : 'border-gray-300 group-hover:border-stellar'
            }`}>
              {m.completed && <span className="text-[10px] font-bold">✓</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${m.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {m.title}
              </p>
              {!compact && (m.dueDate || m.completedAt) && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {m.completed && m.completedAt ? `Completed ${m.completedAt}` : m.dueDate ? `Due ${m.dueDate}` : ''}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTracker;
