import { useState, useCallback, useMemo } from 'react';
import type { Session, SessionStatus } from '../types';

// ─── Extended booking type ────────────────────────────────────────────────────

export interface BookingRecord extends Session {
  mentorName: string;
  mentorAvatar?: string;
  learnerName: string;
  learnerAvatar?: string;
  cancellationReason?: string;
  hasReview: boolean;
  /** ISO string of when the session ended; dispute window = 72 h after */
  endedAt?: string;
  receiptUrl?: string;
}

export type TabKey = 'upcoming' | 'past';
export type StatusFilter = 'all' | 'completed' | 'cancelled';

export interface HistoryFilters {
  status: StatusFilter;
  dateFrom: string;
  dateTo: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = Date.now();
const d = (offsetDays: number) => new Date(now + offsetDays * 86_400_000).toISOString();

const MOCK: BookingRecord[] = [
  // Upcoming
  {
    id: 'b1', mentorId: 'm1', learnerId: 'l1',
    mentorName: 'Aisha Bello', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    learnerName: 'You',
    scheduledAt: d(2), duration: 60, status: 'confirmed', price: 90, asset: 'USDC',
    hasReview: false,
  },
  {
    id: 'b2', mentorId: 'm2', learnerId: 'l1',
    mentorName: 'Diego Alvarez', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    learnerName: 'You',
    scheduledAt: d(5), duration: 45, status: 'pending', price: 60, asset: 'XLM',
    hasReview: false,
  },
  // Past – completed
  {
    id: 'b3', mentorId: 'm3', learnerId: 'l1',
    mentorName: 'Nora Chen', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
    learnerName: 'You',
    scheduledAt: d(-3), duration: 60, status: 'completed', price: 80, asset: 'USDC',
    endedAt: d(-3), hasReview: false, receiptUrl: '#',
  },
  {
    id: 'b4', mentorId: 'm1', learnerId: 'l1',
    mentorName: 'Aisha Bello', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    learnerName: 'You',
    scheduledAt: d(-10), duration: 90, status: 'completed', price: 120, asset: 'XLM',
    endedAt: d(-10), hasReview: true, receiptUrl: '#',
  },
  {
    id: 'b5', mentorId: 'm4', learnerId: 'l1',
    mentorName: 'Kwame Asante', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
    learnerName: 'You',
    scheduledAt: d(-15), duration: 30, status: 'completed', price: 40, asset: 'USDC',
    endedAt: d(-15), hasReview: false, receiptUrl: '#',
  },
  // Past – cancelled
  {
    id: 'b6', mentorId: 'm2', learnerId: 'l1',
    mentorName: 'Diego Alvarez', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    learnerName: 'You',
    scheduledAt: d(-7), duration: 60, status: 'cancelled', price: 80, asset: 'XLM',
    cancellationReason: 'Mentor had an emergency and could not attend.',
    hasReview: false,
  },
  {
    id: 'b7', mentorId: 'm3', learnerId: 'l1',
    mentorName: 'Nora Chen', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nora',
    learnerName: 'You',
    scheduledAt: d(-20), duration: 45, status: 'cancelled', price: 60, asset: 'USDC',
    cancellationReason: 'Cancelled by learner 24 hours before session.',
    hasReview: false,
  },
  // Extra items for pagination demo
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `bx${i}`, mentorId: 'm1', learnerId: 'l1',
    mentorName: 'Aisha Bello', mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    learnerName: 'You',
    scheduledAt: d(-(25 + i * 5)), duration: 60, status: 'completed' as SessionStatus,
    price: 80, asset: 'USDC' as const,
    endedAt: d(-(25 + i * 5)), hasReview: i % 2 === 0, receiptUrl: '#',
  })),
];

const PAGE_SIZE = 5;
const DISPUTE_WINDOW_HOURS = 72;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBookingHistory() {
  const [tab, setTab] = useState<TabKey>('upcoming');
  const [filters, setFilters] = useState<HistoryFilters>({ status: 'all', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [isLoading] = useState(false);

  const updateFilter = useCallback(<K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const switchTab = useCallback((t: TabKey) => {
    setTab(t);
    setPage(1);
    setFilters({ status: 'all', dateFrom: '', dateTo: '' });
  }, []);

  const filtered = useMemo(() => {
    const isPast = (s: BookingRecord) =>
      s.status === 'completed' || s.status === 'cancelled' || new Date(s.scheduledAt) < new Date();
    const isUpcoming = (s: BookingRecord) =>
      (s.status === 'pending' || s.status === 'confirmed') && new Date(s.scheduledAt) >= new Date();

    return MOCK.filter((s) => {
      if (tab === 'upcoming' && !isUpcoming(s)) return false;
      if (tab === 'past' && !isPast(s)) return false;
      if (filters.status !== 'all' && s.status !== filters.status) return false;
      if (filters.dateFrom && s.scheduledAt < filters.dateFrom) return false;
      if (filters.dateTo && s.scheduledAt > filters.dateTo + 'T23:59:59') return false;
      return true;
    }).sort((a, b) =>
      tab === 'upcoming'
        ? new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        : new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
  }, [tab, filters]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const isInDisputeWindow = useCallback((booking: BookingRecord) => {
    if (!booking.endedAt) return false;
    const hoursElapsed = (Date.now() - new Date(booking.endedAt).getTime()) / 3_600_000;
    return hoursElapsed <= DISPUTE_WINDOW_HOURS;
  }, []);

  return {
    tab, switchTab,
    filters, updateFilter,
    bookings: paginated,
    totalCount: filtered.length,
    hasMore,
    loadMore,
    isLoading,
    isInDisputeWindow,
  };
}
