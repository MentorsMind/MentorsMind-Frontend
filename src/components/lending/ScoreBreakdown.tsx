import React from 'react';
import type { CreditScoreComponent } from '../../hooks/useCreditScore';

interface ScoreBreakdownProps {
  components: CreditScoreComponent[];
}

function barColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-lime-400';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function badgeColor(score: number): string {
  if (score >= 80) return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
  if (score >= 60) return 'bg-lime-50 text-lime-700 dark:bg-lime-900/20 dark:text-lime-400';
  if (score >= 40) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ components }) => {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Score Breakdown</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        How each factor contributes to your overall credit score.
      </p>

      <div className="space-y-5">
        {components.map((comp) => (
          <div key={comp.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {comp.label}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({comp.weight}% weight)
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor(comp.score)}`}
              >
                {comp.score}/100
              </span>
            </div>

            {/* Bar track */}
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${barColor(comp.score)}`}
                style={{ width: `${comp.score}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{comp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;