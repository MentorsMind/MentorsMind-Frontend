import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePricing } from '../hooks/usePricing';

describe('usePricing Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePricing());
    expect(result.current.settings.baseHourlyRate).toBe(50);
    expect(result.current.settings.currency).toBe('USD');
    expect(result.current.settings.sessionTypePricing).toHaveLength(3);
  });

  it('should update base hourly rate', () => {
    const { result } = renderHook(() => usePricing());
    act(() => {
      result.current.updateBaseRate(75);
    });
    expect(result.current.settings.baseHourlyRate).toBe(75);
  });

  it('should update currency', () => {
    const { result } = renderHook(() => usePricing());
    act(() => {
      result.current.updateCurrency('EUR');
    });
    expect(result.current.settings.currency).toBe('EUR');
  });

  it('should calculate earnings estimate correctly', () => {
    const { result } = renderHook(() => usePricing());
    // Default: 50 * 10 sessions = 500 gross. 15% fee = 75. Net = 425.
    expect(result.current.earningsEstimate.estimatedGrossRevenue).toBe(500);
    expect(result.current.earningsEstimate.estimatedPlatformFees).toBe(75);
    expect(result.current.earningsEstimate.estimatedNetEarnings).toBe(425);
  });

  it('should validate rates within min/max bounds', () => {
    const { result } = renderHook(() => usePricing());
    // 1:1 default min: 20, max: 500
    expect(result.current.validateRate('1:1', 100)).toBe(true);
    expect(result.current.validateRate('1:1', 10)).toBe(false);
    expect(result.current.validateRate('1:1', 600)).toBe(false); 
  });

  it('should update session type price', () => {
    const { result } = renderHook(() => usePricing());
    act(() => {
      result.current.updateSessionTypePrice('group', 40);
    });
    const groupTier = result.current.settings.sessionTypePricing.find(t => t.type === 'group');
    expect(groupTier?.hourlyRate).toBe(40);
  });

  it('should save pricing history', () => {
    const { result } = renderHook(() => usePricing());
    act(() => {
      result.current.saveHistory();
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].baseHourlyRate).toBe(50);
  });
});
