import { useRef, useState, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const THRESHOLD = 80;

  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 20 && window.scrollY === 0) setPulling(true);
  };
  const onTouchEnd = async (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - startY.current;
    setPulling(false);
    if (delta >= THRESHOLD && window.scrollY === 0) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {(pulling || refreshing) && (
        <div className="flex justify-center py-3 text-sm text-indigo-600">
          {refreshing ? '🔄 Refreshing...' : '↓ Release to refresh'}
        </div>
      )}
      {children}
    </div>
  );
}
