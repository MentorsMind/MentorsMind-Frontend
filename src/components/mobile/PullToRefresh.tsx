import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
  disabled = false,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;
      
      const scrollTop = containerRef.current?.scrollTop || 0;
      if (scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing || startY.current === null) return;

      const scrollTop = containerRef.current?.scrollTop || 0;
      if (scrollTop > 0) {
        startY.current = null;
        setPullDistance(0);
        setCanRefresh(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        e.preventDefault();
        
        // Apply resistance to pull
        const resistance = 0.5;
        const adjustedDistance = Math.min(
          distance * resistance,
          maxPullDistance
        );
        
        setPullDistance(adjustedDistance);
        setCanRefresh(adjustedDistance >= threshold);
      }
    },
    [disabled, isRefreshing, threshold, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }

    startY.current = null;
  }, [disabled, isRefreshing, canRefresh, pullDistance, threshold, onRefresh]);

  const pullProgress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullProgress / 100) * 360;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ease-out"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            canRefresh
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          <RefreshCw
            className={`w-5 h-5 transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Simple pull to refresh component for scrollable containers
 */
export const SimplePullToRefresh: React.FC<{
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}> = ({ onRefresh, isRefreshing = false }) => {
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = async () => {
    setLocalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setLocalRefreshing(false);
    }
  };

  const showRefreshing = isRefreshing || localRefreshing;

  return (
    <div className="flex items-center justify-center py-4">
      {showRefreshing ? (
        <div className="flex items-center gap-2 text-primary-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Refreshing...</span>
        </div>
      ) : (
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Pull to refresh
        </button>
      )}
    </div>
  );
};
