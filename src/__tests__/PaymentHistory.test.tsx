import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
// import PaymentHistory from '../pages/PaymentHistory'; // Placeholder if it exists
import { usePaymentHistory } from '../hooks/usePaymentHistory';

describe('Payment History', () => {

/*
  test('PaymentHistory renders analytics summary cards', () => {
    render(<PaymentHistory />);
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Refunded')).toBeInTheDocument();
  });
*/

  // ── Hook Functionality ───────────────────────────────────────────────────

  test('usePaymentHistory filters by status correctly', () => {
    const { result } = renderHook(() => usePaymentHistory());

    act(() => {
      result.current.toggleStatusFilter('completed');
    });

    expect(
      result.current.transactions.every(tx => tx.status === 'completed')
    ).toBe(true);
  });

  test('usePaymentHistory filters by search query (mentor name)', () => {
    const { result } = renderHook(() => usePaymentHistory());

    act(() => {
      result.current.updateFilters({ search: 'Nina Okafor' });
    });

    expect(
      result.current.allFilteredTransactions.every(tx => tx.mentorName === 'Nina Okafor')
    ).toBe(true);
  });

  test('usePaymentHistory filters by date range', () => {
    const { result } = renderHook(() => usePaymentHistory());

    act(() => {
      result.current.updateFilters({ dateFrom: '2026-03-20', dateTo: '2026-03-23' });
    });

    expect(
      result.current.allFilteredTransactions.every(
        tx => tx.date >= '2026-03-20' && tx.date <= '2026-03-23T23:59:59Z'
      )
    ).toBe(true);
  });

  test('clearFilters restores all transactions', () => {
    const { result } = renderHook(() => usePaymentHistory());
    const totalCount = result.current.totalResults;

    act(() => {
      result.current.toggleStatusFilter('pending');
    });
    expect(result.current.totalResults).toBeLessThan(totalCount);

    act(() => {
      result.current.clearFilters();
    });
    expect(result.current.totalResults).toBe(totalCount);
  });

  // ── Export Functionality ───────────────────────────────────────────────────

  test('exportCSV triggers file download via anchor element', () => {
    const { result } = renderHook(() => usePaymentHistory());
    const spy = vi.spyOn(document, 'createElement');

    act(() => {
      result.current.exportCSV();
    });

    expect(spy).toHaveBeenCalledWith('a');
  });

  test('generateReceipt triggers file download for a specific transaction', () => {
    const { result } = renderHook(() => usePaymentHistory());
    const spy = vi.spyOn(document, 'createElement');

    act(() => {
      result.current.generateReceipt('tx1');
    });

    expect(spy).toHaveBeenCalledWith('a');
  });
});

console.log('Test file created for Payment History');
