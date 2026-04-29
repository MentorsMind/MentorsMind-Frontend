import { useState, useCallback } from 'react';
import api from '../services/api.client';
import type { PaymentTransaction, PaymentStatus } from '../types/payment.types';

export interface RevenueTransactionFilters {
  from: string;
  to: string;
  status: PaymentStatus | '';
}

export interface RevenueTransactionsState {
  transactions: PaymentTransaction[];
  loading: boolean;
  /** null means no fetch has been attempted yet */
  error: string | null;
  hasFetched: boolean;
}

/**
 * Defensive data accessor.
 *
 * The server wraps everything in ResponseUtil.success → { success, data, meta }.
 * The inner `data` from RevenueReportService can be:
 *   - PaymentTransaction[]          (flat list)
 *   - { transactions: PaymentTransaction[], pagination: {...} }  (paginated)
 *
 * Returns a normalised PaymentTransaction[] or throws if the shape is unrecognised.
 */
function extractTransactions(responseData: unknown): PaymentTransaction[] {
  // Flat array
  if (Array.isArray(responseData)) {
    return responseData as PaymentTransaction[];
  }

  // Paginated object with a `transactions` key
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

export function useRevenueTransactions() {
  const [state, setState] = useState<RevenueTransactionsState>({
    transactions: [],
    loading: false,
    error: null,
    hasFetched: false,
  });

  const [filters, setFilters] = useState<RevenueTransactionFilters>({
    from: '',
    to: '',
    status: '',
  });

  const fetchTransactions = useCallback(
    async (overrideFilters?: RevenueTransactionFilters) => {
      const active = overrideFilters ?? filters;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = new URLSearchParams({
          from: active.from,
          to: active.to,
        });
        if (active.status) params.set('status', active.status);

        const { data: envelope } = await api.get(
          `/revenue/transactions?${params.toString()}`,
        );

        // envelope = { success: true, data: <flat|paginated>, meta: {...} }
        const transactions = extractTransactions(envelope?.data);

        setState({ transactions, loading: false, error: null, hasFetched: true });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Unable to load transaction data';
        setState((prev) => ({
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
  }, []);

  const retry = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /** Both from and to must be set before the user can load */
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
