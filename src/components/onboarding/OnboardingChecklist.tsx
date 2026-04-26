import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, X, RotateCcw, ExternalLink } from 'lucide-react';
import { OnboardingItem } from '../../hooks/useOnboardingProgress';
import OnboardingProgressBar from './OnboardingProgressBar';
import './OnboardingChecklist.css';

interface OnboardingChecklistProps {
  items: OnboardingItem[];
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  isDismissed: boolean;
  isCompleted: boolean;
  shouldDisplay: boolean;
  onMarkItemComplete: (itemId: string) => void;
  onDismiss: () => void;
  onResume: () => void;
  onReset?: () => void;
  role: 'mentor' | 'learner';
  userEmail?: string;
}

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

// Icon mapping for checklist items
const IconComponent: React.FC<IconProps> = ({ name, size = 20, className = '' }) => {
  const iconProps = { size, className };
  
  const icons: Record<string, React.ReactNode> = {
    User: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>,
    Calendar: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Wallet: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    Video: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    Search: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    CheckCircle: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    AlertCircle: <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  };

  return <>{icons[name] || icons.AlertCircle}</>;
};

const OnboardingChecklistItem: React.FC<{
  item: OnboardingItem;
  onComplete: (id: string) => void;
  isCompleting?: boolean;
}> = ({ item, onComplete, isCompleting = false }) => {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group
        ${item.isCompleted
          ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
          : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
        }
      `}
      onClick={() => onComplete(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onComplete(item.id);
        }
      }}
    >
      {/* Checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
          ${item.isCompleted
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 group-hover:border-blue-400'
          }
        `}
      >
        {item.isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`text-sm font-semibold transition-all ${
            item.isCompleted ? 'text-emerald-700 line-through' : 'text-gray-900'
          }`}>
            {item.label}
          </h4>
          {isCompleting && (
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          )}
        </div>
        <p className={`text-xs mt-0.5 ${
          item.isCompleted ? 'text-emerald-600' : 'text-gray-500'
        }`}>
          {item.description}
        </p>
      </div>

      {/* Deep-link button */}
      {item.route && !item.isCompleted && (
        <a
          href={item.route}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
          title={`Go to ${item.label}`}
          aria-label={`Go to ${item.label}`}
        >
          <ExternalLink size={16} className="text-blue-600" />
        </a>
      )}
    </div>
  );
};

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  items,
  progressPercentage,
  completedCount,
  totalCount,
  isDismissed,
  isCompleted,
  shouldDisplay,
  onMarkItemComplete,
  onDismiss,
  onResume,
  onReset,
  role,
  userEmail,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isDismissed && !isCompleted);
  const [completingItemId, setCompletingItemId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Show celebration when all items are completed
  useEffect(() => {
    if (isCompleted && !showCelebration) {
      setShowCelebration(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, showCelebration]);

  const handleMarkComplete = async (itemId: string) => {
    setCompletingItemId(itemId);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    onMarkItemComplete(itemId);
    setCompletingItemId(null);
  };

  const title = role === 'mentor' ? 'Mentor Onboarding' : 'Welcome to Your Learning Journey';
  const subtitle =
    role === 'mentor'
      ? 'Complete these steps to get started as a mentor'
      : 'Let\'s get you set up and ready to learn';

  // Don't render if shouldn't display
  if (!shouldDisplay && !isCompleted) {
    return null;
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Celebration toast */}
      {showCelebration && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p className="font-bold text-sm">🎉 All set!</p>
              <p className="text-xs opacity-90">You've completed your onboarding!</p>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-blue-100">{subtitle}</p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-2 rounded-lg text-blue-100 hover:bg-blue-400 hover:text-white transition-colors"
              title="Dismiss"
              aria-label="Dismiss onboarding checklist"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Progress section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Progress: <span className="text-blue-600">{completedCount}/{totalCount}</span>
              </p>
              <p className="text-xs font-bold text-gray-500">{Math.round(progressPercentage)}%</p>
            </div>
            <OnboardingProgressBar percentage={progressPercentage} />
          </div>

          {/* Items list */}
          <div className={`space-y-2 max-h-96 overflow-y-auto transition-all duration-300 ${
            isExpanded ? 'block' : 'hidden'
          }`}>
            {items.map((item) => (
              <OnboardingChecklistItem
                key={item.id}
                item={item}
                onComplete={handleMarkComplete}
                isCompleting={completingItemId === item.id}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset onboarding progress"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Expand ({completedCount}/{totalCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dismissed state - show recovery banner */}
      {isDismissed && !isCompleted && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-800">
              You dismissed your onboarding guide. You can resume it at any time.
            </p>
          </div>
          <button
            onClick={onResume}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {/* Completed state - show completion banner */}
      {isCompleted && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-semibold text-emerald-700">
            🎉 You've completed your onboarding! You're all set to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(OnboardingChecklist);
