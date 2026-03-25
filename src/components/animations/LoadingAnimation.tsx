import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingVariant = 'spinner' | 'dots' | 'bars' | 'ring';
type LoadingSize = 'sm' | 'md' | 'lg';
type LoadingColor = 'stellar' | 'primary' | 'white' | 'gray';

interface LoadingAnimationProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  color?: LoadingColor;
  label?: string;
  className?: string;
}

const SIZE: Record<LoadingSize, { icon: string; dot: string; bar: string; ring: string }> = {
  sm: { icon: 'w-4 h-4', dot: 'w-1.5 h-1.5', bar: 'w-1 h-4',   ring: 'w-6 h-6 border-2' },
  md: { icon: 'w-8 h-8', dot: 'w-2 h-2',     bar: 'w-1.5 h-6', ring: 'w-10 h-10 border-[3px]' },
  lg: { icon: 'w-12 h-12', dot: 'w-3 h-3',   bar: 'w-2 h-8',   ring: 'w-14 h-14 border-4' },
};

const TEXT_COLOR: Record<LoadingColor, string> = {
  stellar: 'text-stellar',
  primary: 'text-primary-600',
  white:   'text-white',
  gray:    'text-gray-400',
};

const BG_COLOR: Record<LoadingColor, string> = {
  stellar: 'bg-stellar',
  primary: 'bg-primary-600',
  white:   'bg-white',
  gray:    'bg-gray-400',
};

const BORDER_COLOR: Record<LoadingColor, string> = {
  stellar: 'border-stellar',
  primary: 'border-primary-600',
  white:   'border-white',
  gray:    'border-gray-400',
};

/**
 * Flexible loading animation with multiple variants.
 */
const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'stellar',
  label = 'Loading…',
  className = '',
}) => {
  const s = SIZE[size];

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2
            className={`${s.icon} ${TEXT_COLOR[color]} animate-spin`}
            aria-hidden="true"
          />
        );

      case 'ring':
        return (
          <div
            className={`${s.ring} rounded-full ${BORDER_COLOR[color]} border-t-transparent animate-spin`}
            aria-hidden="true"
          />
        );

      case 'dots':
        return (
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${s.dot} ${BG_COLOR[color]} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`${s.bar} ${BG_COLOR[color]} rounded-sm animate-pulse`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {renderVariant()}
      <span className="sr-only">{label}</span>
    </div>
  );
};

/** Full-screen overlay loading state */
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div
    role="status"
    aria-label={text ?? 'Loading'}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm"
  >
    <LoadingAnimation variant="ring" size="lg" />
    {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
  </div>
);

export default LoadingAnimation;
