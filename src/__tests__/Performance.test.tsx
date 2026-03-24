import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ImageOptimizer from '../components/performance/ImageOptimizer';
import LazyComponent from '../components/performance/LazyComponent';
import VirtualList from '../components/performance/VirtualList';
import { usePerformance } from '../hooks/usePerformance';
import {
  PERFORMANCE_BUDGETS,
  buildWebpSource,
  formatBytes,
  shouldUseVirtualization,
} from '../utils/performance.utils';

describe('performance utilities', () => {
  it('exposes performance budgets for bundle analysis', () => {
    expect(PERFORMANCE_BUDGETS.maxInitialJsKb).toBeGreaterThan(0);
    expect(PERFORMANCE_BUDGETS.maxChunkKb).toBeGreaterThan(0);
    expect(formatBytes(2048)).toContain('KB');
  });

  it('decides when to virtualize large lists and builds webp sources', () => {
    expect(shouldUseVirtualization(10)).toBe(true);
    expect(shouldUseVirtualization(4)).toBe(false);
    expect(buildWebpSource('https://example.com/avatar.jpg')).toBe('https://example.com/avatar.webp');
  });
});

describe('performance components', () => {
  it('renders lazy boundaries and optimized images', () => {
    render(
      <LazyComponent fallback={<div>Loading view</div>}>
        <div>Loaded view</div>
      </LazyComponent>
    );

    expect(screen.getByText('Loaded view')).toBeInTheDocument();

    const { container } = render(
      <ImageOptimizer src="https://example.com/avatar.png" alt="Avatar" className="avatar" />
    );

    expect(container.querySelector('source')?.getAttribute('srcset')).toContain('.webp');
    expect(screen.getByAltText('Avatar')).toHaveAttribute('loading', 'lazy');
  });

  it('virtualizes large lists by only rendering a subset of rows', () => {
    const items = Array.from({ length: 100 }, (_, index) => `Item ${index + 1}`);

    render(
      <VirtualList
        items={items}
        itemHeight={40}
        height={200}
        renderItem={(item) => <div>{item}</div>}
      />
    );

    expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 80')).not.toBeInTheDocument();
  });
});

describe('core web vitals monitoring', () => {
  it('captures performance observer values for the monitoring dashboard', () => {
    const observerInstances: Array<{ callback: PerformanceObserverCallback }> = [];

    class PerformanceObserverMock {
      callback: PerformanceObserverCallback;

      constructor(callback: PerformanceObserverCallback) {
        this.callback = callback;
        observerInstances.push({ callback });
      }

      observe() {}
      disconnect() {}
    }

    // @ts-expect-error test mock
    global.PerformanceObserver = PerformanceObserverMock;

    const { result } = renderHook(() => usePerformance());

    act(() => {
      observerInstances[0].callback(
        {
          getEntries: () => [{ startTime: 1200 }] as PerformanceEntry[],
        } as PerformanceObserverEntryList,
        {} as PerformanceObserver
      );
      observerInstances[1].callback(
        {
          getEntries: () => [{ value: 0.04, hadRecentInput: false }] as PerformanceEntry[],
        } as PerformanceObserverEntryList,
        {} as PerformanceObserver
      );
      observerInstances[2].callback(
        {
          getEntries: () => [{ duration: 48 }] as PerformanceEntry[],
        } as PerformanceObserverEntryList,
        {} as PerformanceObserver
      );
    });

    expect(result.current.metrics.lcp).toBe(1200);
    expect(result.current.metrics.cls).toBe(0.04);
    expect(result.current.metrics.inp).toBe(48);
  });
});
