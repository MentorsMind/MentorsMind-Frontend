import React, { useMemo } from 'react';
import './OnboardingProgressBar.css';

interface OnboardingProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  animated?: boolean;
}

/**
 * Visual progress bar component with animations
 * Displays progress percentage with gradient background
 */
const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  percentage,
  showLabel = false,
  animated = true,
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  const backgroundColor = useMemo(() => {
    if (clampedPercentage === 100) return 'from-emerald-400 to-green-500';
    if (clampedPercentage >= 75) return 'from-blue-400 to-blue-600';
    if (clampedPercentage >= 50) return 'from-amber-400 to-amber-600';
    if (clampedPercentage >= 25) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  }, [clampedPercentage]);

  return (
    <div className="w-full">
      <div className="w-full h-2 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
        <div
          className={`h-full bg-gradient-to-r ${backgroundColor} transition-all duration-500 ease-out ${
            animated ? 'onboarding-progress-bar-animate' : ''
          }`}
          style={{
            width: `${clampedPercentage}%`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(clampedPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {clampedPercentage > 10 && (
            <div className="w-full h-full bg-white opacity-20 animate-pulse" />
          )}
        </div>
      </div>
      {showLabel && (
        <p className="text-xs font-semibold text-gray-600 mt-2 text-center">
          {Math.round(clampedPercentage)}% Complete
        </p>
      )}
    </div>
  );
};

export default React.memo(OnboardingProgressBar);
