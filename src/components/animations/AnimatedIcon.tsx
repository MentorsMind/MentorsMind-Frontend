import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Star } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useAnimation';

type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';
type IconSize = 'sm' | 'md' | 'lg';

interface FeedbackIconProps {
  variant: FeedbackVariant;
  size?: IconSize;
  animate?: boolean;
  className?: string;
}

const ICON_MAP: Record<FeedbackVariant, React.ElementType> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
};

const COLOR_MAP: Record<FeedbackVariant, string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

const BG_MAP: Record<FeedbackVariant, string> = {
  success: 'bg-emerald-50',
  error:   'bg-red-50',
  warning: 'bg-amber-50',
  info:    'bg-blue-50',
};

const SIZE_MAP: Record<IconSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const ICON_SIZE_MAP: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Animated feedback icon for success/error/warning/info states.
 */
export const FeedbackIcon: React.FC<FeedbackIconProps> = ({
  variant,
  size = 'md',
  animate = true,
  className = '',
}) => {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const Icon = ICON_MAP[variant];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const animClass = animate && !reduced && visible ? 'animate-bounce-in' : '';

  return (
    <div
      className={`${SIZE_MAP[size]} ${BG_MAP[variant]} rounded-full flex items-center justify-center ${animClass} ${className}`}
      aria-hidden="true"
    >
      <Icon className={`${ICON_SIZE_MAP[size]} ${COLOR_MAP[variant]}`} />
    </div>
  );
};

interface AnimatedStarProps {
  filled: boolean;
  size?: number;
  onClick?: () => void;
  className?: string;
}

/** Star icon with hover/click animation */
export const AnimatedStar: React.FC<AnimatedStarProps> = ({
  filled,
  size = 20,
  onClick,
  className = '',
}) => {
  const [popped, setPopped] = useState(false);
  const reduced = useReducedMotion();

  const handleClick = () => {
    if (!reduced) {
      setPopped(true);
      setTimeout(() => setPopped(false), 300);
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`transition-transform duration-150 ${popped && !reduced ? 'scale-125' : 'scale-100'} hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar rounded ${className}`}
      aria-label={filled ? 'Filled star' : 'Empty star'}
    >
      <Star
        width={size}
        height={size}
        className={`transition-colors duration-150 ${filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    </button>
  );
};

interface FloatingIconProps {
  children: React.ReactNode;
  className?: string;
}

/** Gently floating icon for decorative use */
export const FloatingIcon: React.FC<FloatingIconProps> = ({ children, className = '' }) => {
  const reduced = useReducedMotion();
  return (
    <span className={`inline-block ${reduced ? '' : 'animate-float'} ${className}`} aria-hidden="true">
      {children}
    </span>
  );
};

export default FeedbackIcon;
