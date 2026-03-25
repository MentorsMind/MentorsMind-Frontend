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
