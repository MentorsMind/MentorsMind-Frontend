import React from 'react';
import type { CreditScoreComponent } from '../../hooks/useCreditScore';

interface ImprovementTipsProps {
  weakestComponent: CreditScoreComponent;
}

const TIPS: Record<string, { icon: string; tips: string[] }> = {
  payment_history: {
    icon: '💳',
    tips: [
      'Always pay for sessions before the scheduled start time.',
      'Enable auto-pay in your wallet settings to avoid missed payments.',
      'Avoid late escrow releases — confirm session completion promptly.',
    ],
  },
  completion_rate: {
    icon: '✅',
    tips: [
      'Only book sessions you are confident you can attend.',
      'Cancel at least 24 hours in advance if plans change.',
      'Use the reschedule feature instead of outright cancellation.',
    ],
  },
  account_age: {
    icon: '📅',
    tips: [
      'Keep your account active with at least one session per month.',
      'Account age grows automatically — stay consistent on the platform.',
      'Complete your learner profile to improve trust signals.',
    ],
  },
  goal_achievement: {
    icon: '🎯',
    tips: [
      'Set realistic, time-bound learning goals in your dashboard.',
      'Mark milestones complete as you achieve them.',
      'Review and update your goals with your mentor each month.',
    ],
  },
  wallet_activity: {
    icon: '🌐',
    tips: [
      'Connect your Stellar wallet and keep it funded.',
      'Make regular on-chain transactions to build activity history.',
      'Use XLM or USDC for session payments to record on-chain history.',
    ],
  },
};

const ImprovementTips: React.FC<ImprovementTipsProps> = ({ weakestComponent }) => {
  const tipData = TIPS[weakestComponent.key] ?? {
    icon: '💡',
    tips: ['Keep engaging with the platform consistently.'],
  };

  return (
    <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{tipData.icon}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            How to Improve Your Score
          </h2>
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            Weakest area: {weakestComponent.label} ({weakestComponent.score}/100)
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {tipData.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImprovementTips;