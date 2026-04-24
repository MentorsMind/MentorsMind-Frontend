import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMentorWallet } from '../hooks/useMentorWallet';

describe('useMentorWallet pagination behavior', () => {
  it('loads payout requests with page-based pagination and hides load more on empty page', async () => {
    const { result } = renderHook(() => useMentorWallet());

    await waitFor(() => {
      expect(result.current.visiblePayoutRequests.length).toBe(2);
      expect(result.current.payoutHasMore).toBe(true);
    });

    await act(async () => {
      await result.current.loadMorePayoutRequests();
    });

    expect(result.current.visiblePayoutRequests.length).toBe(4);
    expect(result.current.payoutHasMore).toBe(true);

    await act(async () => {
      await result.current.loadMorePayoutRequests();
    });

    expect(result.current.visiblePayoutRequests.length).toBe(4);
    expect(result.current.payoutHasMore).toBe(false);
  });

  it('loads transactions with cursor pagination and disables load more when cursor is exhausted', async () => {
    const { result } = renderHook(() => useMentorWallet());

    await waitFor(() => {
      expect(result.current.filteredTx.length).toBeGreaterThan(0);
      expect(result.current.transactionsHasMore).toBe(true);
    });

    await act(async () => {
      await result.current.loadMoreTransactions();
    });

    expect(result.current.filteredTx.length).toBe(6);

    await act(async () => {
      await result.current.loadMoreTransactions();
    });

    expect(result.current.filteredTx.length).toBe(8);
    expect(result.current.transactionsHasMore).toBe(false);
  });

  it('supports transaction order toggle between desc and asc', async () => {
    const { result } = renderHook(() => useMentorWallet());

    await waitFor(() => {
      expect(result.current.filteredTx.length).toBeGreaterThan(0);
    });

    expect(result.current.filteredTx[0].id).toBe('t8');

    act(() => {
      result.current.setTxOrder('asc');
    });

    await waitFor(() => {
      expect(result.current.filteredTx[0].id).toBe('t7');
    });
  });
});
