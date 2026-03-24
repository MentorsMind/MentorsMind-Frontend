import React, { useMemo, useState } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 3,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, offsetTop, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
    const end = Math.min(items.length, start + visibleCount);

    return {
      startIndex: start,
      endIndex: end,
      offsetTop: start * itemHeight,
      visibleItems: items.slice(start, end),
    };
  }, [height, itemHeight, items, overscan, scrollTop]);

  return (
    <div
      style={{ height }}
      className="overflow-auto"
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      data-testid="virtual-list"
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      <div className="sr-only">
        Rendering items {startIndex + 1} to {endIndex}
      </div>
    </div>
  );
}

export default VirtualList;
