import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { getMentorEarnings, getWalletEarnings } from '../services/earnings.service';
import {
  aggregateBreakdownSeries,
  getMajorityCurrency,
  sortSessions,
  parseWalletAmount,
} from '../utils/earnings.utils';
import type {
  EarningsSummaryData,
  MentorPayoutSession,
  ChartSeries,
  SortKey,
  MentorEarningsResponse,
  WalletEarningsResponse,
  GroupBy,
  DateRangeFilter,
} from '../types/earnings.types';

const PAGE_SIZE = 20;

function getDefaultDateRange(): DateRangeFilter {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export interface WalletSummary {
  totalEarnings: number;
  currentPeriodEarnings: number;
  periodSummary: {
    startDate: string;
    endDate: string;
    sessionCount: number;
    averageEarning: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    asset: string;
    date: string;
    description?: string;
  }>;
}

export interface UseEarningsReturn {
  // Mentor earnings (primary)
  mentorEarnings: MentorEarningsResponse | null;
  summary: EarningsSummaryData | null;
  chartSeries: ChartSeries[];
  sessions: MentorPayoutSession[];
  allSortedSessions: MentorPayoutSession[];
  totalSessions: number;

  // Wallet earnings
  walletEarnings: WalletEarningsResponse | null;
  walletSummary: WalletSummary | null;

  // UI state
  loading: boolean;
  error: string | null;
  retry: () => void;
  groupBy: GroupBy;
  setGroupBy: (groupBy: GroupBy) => void;
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;
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

  const [mentorEarnings, setMentorEarnings] = useState<MentorEarningsResponse | null>(null);
  const [walletEarnings, setWalletEarnings] = useState<WalletEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupBy, setGroupByState] = useState<GroupBy>('month');
  const [dateRange, setDateRangeState] = useState<DateRangeFilter>(getDefaultDateRange);

  const [page, setPageState] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('sessionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Optimistic cache for mentor earnings
  const mentorCacheRef = useRef<MentorEarningsResponse | null>(null);
  const walletCacheRef = useRef<WalletEarningsResponse | null>(null);

  const fetchEarnings = useCallback(async () => {
    if (!user?.id) return;

    // Show stale data immediately while refreshing
    if (mentorCacheRef.current) {
      setMentorEarnings(mentorCacheRef.current);
    }
    if (walletCacheRef.current) {
      setWalletEarnings(walletCacheRef.current);
    }

    setLoading(true);
    setError(null);

    try {
      const [mentorData, walletData] = await Promise.all([
        getMentorEarnings(user.id, { groupBy, ...dateRange }),
        getWalletEarnings(dateRange),
      ]);
      mentorCacheRef.current = mentorData;
      walletCacheRef.current = walletData;
      setMentorEarnings(mentorData);
      setWalletEarnings(walletData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load earnings. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, groupBy, dateRange]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const retry = useCallback(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const setGroupBy = useCallback((value: GroupBy) => {
    setGroupByState(value);
  }, []);

  const setDateRange = useCallback((range: DateRangeFilter) => {
    setDateRangeState(range);
  }, []);

  // Derived state — mentor earnings
  const rawSessions: MentorPayoutSession[] = (mentorEarnings as any)?.sessions ?? [];
  const currency = getMajorityCurrency(rawSessions);

  const summary: EarningsSummaryData | null = useMemo(() => {
    if (!mentorEarnings) return null;
    return {
      totalAllTimeNet: mentorEarnings.totalEarnings,
      pendingEscrow: 0,
      thisMonthNet: mentorEarnings.totalEarnings,
      currency,
    };
  }, [mentorEarnings, currency]);

  const chartSeries: ChartSeries[] = useMemo(() => {
    if (!mentorEarnings?.breakdown) return [];
    return aggregateBreakdownSeries(mentorEarnings.breakdown, groupBy);
  }, [mentorEarnings, groupBy]);

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
        setSortDir((d: 'asc' | 'desc') => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
      setPageState(1);
    },
    [sortKey],
  );

  // Current page slice
  const start = (page - 1) * PAGE_SIZE;
  const sessions = allSortedSessions.slice(start, start + PAGE_SIZE);

  // Derived state — wallet earnings (parseFloat all amount strings)
  const walletSummary: WalletSummary | null = useMemo(() => {
    if (!walletEarnings) return null;
    return {
      totalEarnings: parseWalletAmount(walletEarnings.totalEarnings),
      currentPeriodEarnings: parseWalletAmount(walletEarnings.currentPeriodEarnings),
      periodSummary: {
        startDate: walletEarnings.periodSummary.startDate,
        endDate: walletEarnings.periodSummary.endDate,
        sessionCount: walletEarnings.periodSummary.sessionCount,
        averageEarning: parseWalletAmount(walletEarnings.periodSummary.averageEarning),
      },
      recentTransactions: walletEarnings.recentTransactions.map((tx: WalletEarningsResponse['recentTransactions'][number]) => ({
        id: tx.id,
        type: tx.type,
        amount: parseWalletAmount(tx.amount),
        asset: tx.asset,
        date: tx.date,
        description: tx.description,
      })),
    };
  }, [walletEarnings]);

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
    mentorEarnings,
    summary,
    chartSeries,
    sessions,
    allSortedSessions,
    totalSessions,
    walletEarnings,
    walletSummary,
    loading,
    error,
    retry,
    groupBy,
    setGroupBy,
    dateRange,
    setDateRange,
    page,
    setPage,
    sortKey,
    sortDir,
    setSort,
    exportCSV,
    currency,
  };
}

