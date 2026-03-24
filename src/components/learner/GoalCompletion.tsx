import React from 'react';
import type { ProgressGoal } from '../../types';

interface GoalCompletionProps {
  goals: ProgressGoal[];
}

const GoalCompletion: React.FC<GoalCompletionProps> = ({ goals }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-gray-900">Goal Completion Metrics</h3>
      <div className="mt-5 space-y-4">
        {goals.map((goal) => {
          const percentage = Math.round((goal.completedSteps / goal.totalSteps) * 100);
          return (
            <div key={goal.id} className="rounded-3xl bg-gray-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-gray-900">{goal.title}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {goal.completedSteps}/{goal.totalSteps} steps complete • due in {goal.dueInWeeks} week{goal.dueInWeeks > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-sm font-bold text-stellar">{percentage}%</div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-stellar" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalCompletion;
