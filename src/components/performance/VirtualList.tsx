import React, { useEffect, useMemo, useRef, useState } from 'react'

interface VirtualListProps<T> {
  items: T[]
  rowHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  containerHeight?: number
}

export function VirtualList<T>({ items, rowHeight, renderItem, overscan = 3, containerHeight = 400 }: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalHeight = items.length * rowHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan)

  const visible = useMemo(() => items.slice(startIndex, endIndex + 1), [items, startIndex, endIndex])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={containerRef} style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: startIndex * rowHeight, left: 0, right: 0 }}>
          {visible.map((item, i) => (
            <div key={(item as any).id ?? i} style={{ height: rowHeight, overflow: 'hidden' }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VirtualList
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
