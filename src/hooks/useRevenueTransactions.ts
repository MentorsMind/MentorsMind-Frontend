import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import api from '../services/api.client';
import type { PaymentTransaction, PaymentStatus } from '../types/payment.types';

// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Convert a YYYY-MM-DD string (from <input type="date">) to the start of that
 * day in UTC: "2025-01-01T00:00:00.000Z"
 */
export function toStartOfDayUTC(dateStr: string): string {
  return `${dateStr}T00:00:00.000Z`;
}

/**
 * Convert a YYYY-MM-DD string to the end of that day in UTC:
 * "2025-01-31T23:59:59.999Z"
 */
export function toEndOfDayUTC(dateStr: string): string {
  return `${dateStr}T23:59:59.999Z`;
}

/**
 * Format a Date to YYYY-MM-DD for use as an <input type="date"> value.
 */
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns the default date range: from = now - 30 days, to = now.
 * Values are YYYY-MM-DD strings suitable for <input type="date">.
 */
function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Internal filter state uses YYYY-MM-DD strings (native date input format).
 * ISO conversion happens at fetch time.
 */
export interface RevenueTransactionFilters {
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
  status: PaymentStatus | '';
}

export interface RevenueTransactionsState {
  transactions: PaymentTransaction[];
  loading: boolean;
  /** null = no fetch attempted yet */
  error: string | null;
  /** Inline error shown below the date picker (e.g. 400 validation message) */
  dateRangeError: string | null;
  hasFetched: boolean;
}

// ── Defensive data accessor ───────────────────────────────────────────────────

function extractTransactions(responseData: unknown): PaymentTransaction[] {
  if (Array.isArray(responseData)) {
    return responseData as PaymentTransaction[];
  }
  if (
    responseData !== null &&
    typeof responseData === 'object' &&
    'transactions' in responseData &&
    Array.isArray((responseData as { transactions: unknown }).transactions)
  ) {
    return (responseData as { transactions: PaymentTransaction[] }).transactions;
  }
  throw new Error('Unexpected response shape');
}

// ── Extract inline error from a 400 response body ────────────────────────────

function extract400Message(err: unknown): string | null {
  const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
  if (axiosErr?.response?.status === 400) {
    return axiosErr.response.data?.error?.message ?? 'Invalid date range.';
  }
  return null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRevenueTransactions() {
  const defaults = defaultDateRange();

  const [state, setState] = useState<RevenueTransactionsState>({
    transactions: [],
    loading: false,
    error: null,
    dateRangeError: null,
    hasFetched: false,
  });

  const [filters, setFilters] = useState<RevenueTransactionFilters>({
    from: defaults.from,
    to: defaults.to,
    status: '',
  });

  const fetchTransactions = useCallback(
    async (overrideFilters?: RevenueTransactionFilters) => {
      const active = overrideFilters ?? filters;

      // ── Client-side from < to guard ───────────────────────────────────────
      if (active.from && active.to && active.from >= active.to) {
        setState((prev: RevenueTransactionsState) => ({
          ...prev,
          dateRangeError: 'Start date must be before end date',
        }));
        return;
      }

      setState((prev: RevenueTransactionsState) => ({
        ...prev,
        loading: true,
        error: null,
        dateRangeError: null,
      }));

      try {
        // Convert YYYY-MM-DD → full ISO 8601 UTC timestamps before sending
        const params = new URLSearchParams({
          from: toStartOfDayUTC(active.from),
          to: toEndOfDayUTC(active.to),
        });
        if (active.status) params.set('status', active.status);

        const { data: envelope } = await api.get(
          `/revenue/transactions?${params.toString()}`,
        );

        const transactions = extractTransactions(envelope?.data);

        setState({
          transactions,
          loading: false,
          error: null,
          dateRangeError: null,
          hasFetched: true,
        });
      } catch (err: unknown) {
        // 400 errors → show inline below the date picker
        const inlineMsg = extract400Message(err);
        if (inlineMsg) {
          setState((prev: RevenueTransactionsState) => ({
            ...prev,
            loading: false,
            dateRangeError: inlineMsg,
            hasFetched: true,
          }));
          return;
        }

        // All other errors → show in the main error panel
        const message =
          err instanceof Error ? err.message : 'Unable to load transaction data';
        setState((prev: RevenueTransactionsState) => ({
          ...prev,
          loading: false,
          error: message,
          hasFetched: true,
        }));
      }
    },
    [filters],
  );

  const updateFilters = useCallback((patch: Partial<RevenueTransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    if ('from' in patch || 'to' in patch) {
      setState((prev: RevenueTransactionsState) => ({ ...prev, dateRangeError: null }));
    }
  }, []);

  const retry = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const canFetch = filters.from.length > 0 && filters.to.length > 0;

  return {
    ...state,
    filters,
    updateFilters,
    fetchTransactions,
    retry,
    canFetch,
  };
}
