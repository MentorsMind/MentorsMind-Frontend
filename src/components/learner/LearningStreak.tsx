import React from 'react';

interface LearningStreakProps {
  streakDays: number;
  streakWeeks: number;
  totalHours: number;
  nextGoal?: string;
}

const LearningStreak: React.FC<LearningStreakProps> = ({ streakDays, streakWeeks, totalHours, nextGoal }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Learning Streak</h3>
        <span className="text-xs font-semibold text-emerald-600">+{streakWeeks} weeks</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-indigo-50 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500">Consecutive Days</p>
          <p className="mt-1 text-3xl font-black text-gray-900">{streakDays}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500">Total Hours</p>
          <p className="mt-1 text-3xl font-black text-gray-900">{totalHours}h</p>
        </div>
      </div>
      {nextGoal && (
        <p className="mt-4 text-sm text-gray-600">Next milestone: {nextGoal}</p>
      )}
    </div>
  );
};

export default LearningStreak;
