import { useEffect, useMemo, useState } from 'react';
import { PERFORMANCE_BUDGETS } from '../utils/performance.utils';

interface PerformanceMetric {
  label: string;
  value: number | null;
  unit: string;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<Record<string, number | null>>({
    lcp: null,
    cls: null,
    inp: null,
  });

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      setMetrics((current) => ({ ...current, lcp: Math.round(last.startTime) }));
    });

    const clsObserver = new PerformanceObserver((entryList) => {
      const totalCls = entryList
        .getEntries()
        .filter((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => !entry.hadRecentInput)
        .reduce((sum, entry: PerformanceEntry & { value?: number }) => sum + (entry.value ?? 0), 0);
      setMetrics((current) => ({ ...current, cls: Number(totalCls.toFixed(3)) }));
    });

    const inpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const longest = entries.reduce((max, entry) => Math.max(max, entry.duration), 0);
      setMetrics((current) => ({ ...current, inp: Math.round(longest) }));
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      (inpObserver as any).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch {
      return () => undefined;
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  const dashboard = useMemo<PerformanceMetric[]>(() => {
    return [
      { label: 'LCP', value: metrics.lcp, unit: 'ms' },
      { label: 'CLS', value: metrics.cls, unit: '' },
      { label: 'INP', value: metrics.inp, unit: 'ms' },
    ];
  }, [metrics]);

  const budgetStatus = useMemo(() => {
    return {
      jsBudgetKb: PERFORMANCE_BUDGETS.maxInitialJsKb,
      chunkBudgetKb: PERFORMANCE_BUDGETS.maxChunkKb,
      imageBudgetKb: PERFORMANCE_BUDGETS.maxImageKb,
    };
  }, []);

  return {
    metrics,
    dashboard,
    budgetStatus,
  };
};

