import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getEarnings } from '../services/earnings.service';
import {
  aggregateChartSeries,
  getMajorityCurrency,
  sortSessions,
} from '../utils/earnings.utils';
import type {
  EarningsSummaryData,
  MentorPayoutSession,
  ChartSeries,
  ChartRange,
  SortKey,
  EarningsApiResponse,
} from '../types/earnings.types';

const PAGE_SIZE = 20;

export interface UseEarningsReturn {
  summary: EarningsSummaryData | null;
  chartSeries: ChartSeries[];
  sessions: MentorPayoutSession[];
  allSortedSessions: MentorPayoutSession[];
  totalSessions: number;
  loading: boolean;
  error: string | null;
  retry: () => void;
  chartRange: ChartRange;
  setChartRange: (range: ChartRange) => void;
  page: number;
  setPage: (page: number) => void;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  setSort: (key: SortKey) => void;
  exportCSV: () => void;
  currency: string;
}

export function useEarnings(): UseEarningsReturn {
  const { user } = useAuth();

  const [rawResponse, setRawResponse] = useState<EarningsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chartRange, setChartRange] = useState<ChartRange>('monthly');
  const [page, setPageState] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('sessionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Optimistic cache — persists across re-mounts within the same session
  const cacheRef = useRef<EarningsApiResponse | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!user?.id) return;

    // Show stale data immediately while refreshing
    if (cacheRef.current) {
      setRawResponse(cacheRef.current);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getEarnings(user.id);
      cacheRef.current = data;
      setRawResponse(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load earnings. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const retry = useCallback(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Derived state
  const rawSessions: MentorPayoutSession[] = rawResponse?.sessions ?? [];
  const summary: EarningsSummaryData | null = rawResponse?.summary ?? null;
  const currency = getMajorityCurrency(rawSessions);
  const chartSeries: ChartSeries[] = aggregateChartSeries(rawSessions, chartRange);
  const allSortedSessions = sortSessions(rawSessions, sortKey, sortDir);
  const totalSessions = allSortedSessions.length;

  const totalPages = Math.max(1, Math.ceil(totalSessions / PAGE_SIZE));

  const setPage = useCallback(
    (p: number) => {
      setPageState(Math.min(Math.max(1, p), totalPages));
    },
    [totalPages],
  );

  const setSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
      setPageState(1);
    },
    [sortKey],
  );

  const setChartRangeAndReset = useCallback((range: ChartRange) => {
    setChartRange(range);
  }, []);

  // Current page slice
  const start = (page - 1) * PAGE_SIZE;
  const sessions = allSortedSessions.slice(start, start + PAGE_SIZE);

  const exportCSV = useCallback(() => {
    const headers = [
      'Date',
      'Mentee Name',
      'Duration (min)',
      'Gross Amount',
      'Platform Fee',
      'Net Payout',
      'Asset',
      'Payout Status',
      'Transaction Hash',
    ];

    const rows = allSortedSessions.map((s) => [
      s.sessionDate,
      s.menteeName,
      String(s.durationMinutes),
      s.grossAmount.toFixed(2),
      s.platformFee.toFixed(2),
      s.netPayout.toFixed(2),
      s.asset,
      s.payoutStatus,
      s.txHash ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `mentor-earnings-${date}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [allSortedSessions]);

  return {
    summary,
    chartSeries,
    sessions,
    allSortedSessions,
    totalSessions,
    loading,
    error,
    retry,
    chartRange,
    setChartRange: setChartRangeAndReset,
    page,
    setPage,
    sortKey,
    sortDir,
    setSort,
    exportCSV,
    currency,
  };
}
