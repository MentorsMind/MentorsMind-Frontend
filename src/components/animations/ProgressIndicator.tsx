import React from 'react';
import { useAnimatedProgress, useReducedMotion } from '../../hooks/useAnimation';

type ProgressColor = 'stellar' | 'primary' | 'success' | 'warning' | 'danger';
type ProgressSize  = 'xs' | 'sm' | 'md' | 'lg';
type CircleColor   = 'stellar' | 'primary' | 'success';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const COLOR_MAP: Record<ProgressColor, string> = {
  stellar:  'bg-stellar',
  primary:  'bg-primary-600',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
};

const SIZE_MAP: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

/**
 * Animated progress bar. Supports determinate and indeterminate modes.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'stellar',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  indeterminate = false,
  className = '',
}) => {
  const reduced = useReducedMotion();
  const pct = Math.min((value / max) * 100, 100);
  const animatedPct = useAnimatedProgress(pct, animated && !reduced ? 800 : 0);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-600">{label ?? 'Progress'}</span>
          {!indeterminate && (
            <span className="text-xs font-semibold text-gray-700">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-100 rounded-full overflow-hidden relative ${SIZE_MAP[size]}`}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Progress'}
      >
        {indeterminate ? (
          <div
            className={`absolute h-full w-2/5 ${COLOR_MAP[color]} rounded-full`}
            style={{ animation: 'progress-indeterminate 1.4s ease-in-out infinite' }}
          />
        ) : (
          <div
            className={`h-full ${COLOR_MAP[color]} rounded-full transition-all duration-300`}
            style={{ width: `${animated && !reduced ? animatedPct : pct}%` }}
          />
        )}
      </div>
    </div>
  );
};

interface StepIndicatorProps {
  steps: string[];
  current: number;
  className?: string;
}

/**
 * Step-based progress indicator with animated connector lines.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  current,
  className = '',
}) => {
  const reduced = useReducedMotion();

  return (
    <nav aria-label="Progress steps" className={`flex items-center ${className}`}>
      {steps.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  done   ? `bg-stellar text-white${!reduced ? ' animate-bounce-in' : ''}` : '',
                  active ? 'bg-stellar text-white ring-4 ring-stellar/20' : '',
                  !done && !active ? 'bg-gray-100 text-gray-400' : '',
                ].join(' ')}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-stellar' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 mx-2 h-0.5 bg-gray-100 overflow-hidden rounded-full">
                <div
                  className="h-full bg-stellar transition-all duration-500"
                  style={{ width: done ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: CircleColor;
  showValue?: boolean;
  label?: string;
  className?: string;
}

const CIRCLE_COLOR: Record<CircleColor, string> = {
  stellar: '#5B3FFF',
  primary: '#0284c7',
  success: '#10b981',
};

/**
 * Circular/ring progress indicator with SVG stroke animation.
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'stellar',
  showValue = true,
  label,
  className = '',
}) => {
  const reduced = useReducedMotion();
  const pct = Math.min((value / max) * 100, 100);
  const animatedPct = useAnimatedProgress(pct, reduced ? 0 : 900);

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animatedPct / 100) * circumference;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? `${Math.round(pct)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={CIRCLE_COLOR[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: reduced ? 'none' : 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      {showValue && (
        <span className="text-sm font-bold text-gray-800 -mt-1">
          {Math.round(pct)}%
        </span>
      )}
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
};

export default ProgressBar;
