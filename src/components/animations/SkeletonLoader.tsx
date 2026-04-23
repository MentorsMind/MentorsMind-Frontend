import React from 'react';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text:        'h-4 rounded',
  circular:    'rounded-full',
  rectangular: 'rounded-none',
  rounded:     'rounded-xl',
};

/** Single skeleton element with shimmer animation */
export const SkeletonLoader: React.FC<SkeletonProps> = ({
  variant,
  width,
  height,
  className = '',
}) => {
  const v: SkeletonVariant = variant ?? 'text';
  const style: React.CSSProperties = {
    width:  width  ?? (v === 'circular' ? 40 : '100%'),
    height: height ?? (v === 'circular' ? 40 : undefined),
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-shimmer ${VARIANT_CLASSES[v]} ${className}`}
      style={style}
    />
  );
};

/** Card-shaped skeleton */
export const CardSkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 ${className}`} role="status" aria-label="Loading card">
    <div className="flex items-center gap-3">
      <SkeletonLoader variant="circular" width={44} height={44} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="55%" height={14} variant="rounded" />
        <SkeletonLoader width="35%" height={12} variant="rounded" />
      </div>
    </div>
    <SkeletonLoader variant="rounded" height={12} />
    <SkeletonLoader variant="rounded" width="75%" height={12} />
    <div className="flex gap-2 pt-1">
      <SkeletonLoader variant="rounded" width={72} height={28} />
      <SkeletonLoader variant="rounded" width={72} height={28} />
    </div>
  </div>
);

/** Specialized skeletons for specific card types */
export const SkeletonCard: React.FC<{
  variant: 'mentor' | 'booking' | 'message' | 'notification' | 'wallet' | 'history';
  className?: string;
}> = ({ variant, className = '' }) => {
  switch (variant) {
    case 'mentor':
      return (
        <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 ${className}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <SkeletonLoader variant="circular" width={48} height={48} />
              <div className="space-y-2 flex-1">
                <SkeletonLoader width="60%" height={16} variant="rounded" />
                <SkeletonLoader width="40%" height={12} variant="rounded" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonLoader width={40} height={16} variant="rounded" />
              <SkeletonLoader width={30} height={10} variant="rounded" className="mt-1" />
            </div>
          </div>
          <SkeletonLoader height={40} variant="rounded" />
          <div className="flex gap-2">
            <SkeletonLoader width={60} height={24} variant="rounded" />
            <SkeletonLoader width={60} height={24} variant="rounded" />
            <SkeletonLoader width={60} height={24} variant="rounded" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
            <SkeletonLoader width={80} height={12} variant="rounded" />
            <div className="flex gap-2">
              <SkeletonLoader width={80} height={32} variant="rounded" />
              <SkeletonLoader width={60} height={32} variant="rounded" />
            </div>
          </div>
        </div>
      );
    case 'booking':
      return (
        <div className={`bg-white rounded-2xl border border-gray-100 p-4 space-y-3 ${className}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <SkeletonLoader width="70%" height={18} variant="rounded" />
              <SkeletonLoader width="40%" height={14} variant="rounded" />
            </div>
            <SkeletonLoader width={60} height={20} variant="rounded" />
          </div>
          <div className="flex gap-3">
            <SkeletonLoader width={80} height={12} variant="rounded" />
            <SkeletonLoader width={60} height={12} variant="rounded" />
            <SkeletonLoader width={70} height={12} variant="rounded" />
          </div>
          <div className="flex gap-1.5 mt-2">
            <SkeletonLoader width={50} height={18} variant="rounded" />
            <SkeletonLoader width={50} height={18} variant="rounded" />
          </div>
        </div>
      );
    case 'message':
      return (
        <div className={`p-4 flex items-start gap-3 border-b border-gray-50 ${className}`}>
          <SkeletonLoader variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <SkeletonLoader width="30%" height={14} variant="rounded" />
              <SkeletonLoader width="15%" height={10} variant="rounded" />
            </div>
            <SkeletonLoader width="80%" height={12} variant="rounded" />
          </div>
        </div>
      );
    case 'notification':
      return (
        <div className={`p-4 flex items-start gap-3 border-b border-gray-50 ${className}`}>
          <SkeletonLoader variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader width="90%" height={14} variant="rounded" />
            <SkeletonLoader width="20%" height={10} variant="rounded" />
          </div>
        </div>
      );
    case 'wallet':
      return (
        <div className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm ${className}`}>
          <SkeletonLoader width="40%" height={14} variant="rounded" className="mb-2" />
          <div className="flex items-baseline gap-2 mb-6">
            <SkeletonLoader width="50%" height={32} variant="rounded" />
            <SkeletonLoader width="20%" height={16} variant="rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLoader height={44} variant="rounded" />
            <SkeletonLoader height={44} variant="rounded" />
          </div>
        </div>
      );
    case 'history':
      return (
        <div className={`bg-white rounded-xl p-4 border border-gray-50 flex justify-between items-center ${className}`}>
          <div className="flex items-center gap-3 flex-1">
            <SkeletonLoader variant="circular" width={32} height={32} />
            <div className="space-y-1.5 flex-1">
              <SkeletonLoader width="40%" height={14} variant="rounded" />
              <SkeletonLoader width="25%" height={10} variant="rounded" />
            </div>
          </div>
          <div className="text-right space-y-1.5">
            <SkeletonLoader width={60} height={14} variant="rounded" />
            <SkeletonLoader width={40} height={10} variant="rounded" />
          </div>
        </div>
      );
    default:
      return <CardSkeletonLoader className={className} />;
  }
};

/** List-row skeleton */
export const ListSkeletonLoader: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="65%" height={13} variant="rounded" />
          <SkeletonLoader width="40%" height={11} variant="rounded" />
        </div>
      </div>
    ))}
  </div>
);

/** Table skeleton */
export const TableSkeletonLoader: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-2" role="status" aria-label="Loading table">
    <div className="flex gap-4 px-4 py-2">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonLoader key={i} width={`${100 / cols}%`} height={12} variant="rounded" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 px-4 py-3 bg-white rounded-xl">
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonLoader key={c} width={`${100 / cols}%`} height={14} variant="rounded" />
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
