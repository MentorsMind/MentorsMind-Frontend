import { useEffect, useMemo, useState } from 'react';
import type { DataPoint, MultiSeriesDataPoint } from '../types/charts.types';

export interface TreasuryMetrics {
  totalValueLocked: number;
  daoBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface TreasuryAsset {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  change24h: number;
  color: string;
}

export interface TreasuryAllocation {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TreasuryState {
  metrics: TreasuryMetrics;
  assets: TreasuryAsset[];
  allocations: TreasuryAllocation[];
  history: MultiSeriesDataPoint[];
  lastUpdated: string;
  isLoading: boolean;
}

const INITIAL_HISTORY: MultiSeriesDataPoint[] = [
  { label: 'Oct', tvl: 450000, revenue: 12000, expenses: 8000 },
  { label: 'Nov', tvl: 520000, revenue: 15000, expenses: 9500 },
  { label: 'Dec', tvl: 680000, revenue: 22000, expenses: 11000 },
  { label: 'Jan', tvl: 850000, revenue: 28000, expenses: 14000 },
  { label: 'Feb', tvl: 920000, revenue: 35000, expenses: 16500 },
  { label: 'Mar', tvl: 1240000, revenue: 42000, expenses: 19000 },
];

const INITIAL_ASSETS: TreasuryAsset[] = [
  { symbol: 'USDC', name: 'USD Coin', amount: 850000, valueUsd: 850000, change24h: 0.01, color: '#2775CA' },
  { symbol: 'XLM', name: 'Stellar Lumens', amount: 1200000, valueUsd: 240000, change24h: 3.5, color: '#000000' },
  { symbol: 'MMT', name: 'MentorMind Token', amount: 5000000, valueUsd: 150000, change24h: -1.2, color: '#7c3aed' },
];

const INITIAL_ALLOCATIONS: TreasuryAllocation[] = [
  { category: 'Development', amount: 450000, percentage: 45, color: '#2563eb' },
  { category: 'Marketing', amount: 200000, percentage: 20, color: '#7c3aed' },
  { category: 'Community', amount: 150000, percentage: 15, color: '#0f766e' },
  { category: 'Liquidity', amount: 200000, percentage: 20, color: '#ea580c' },
];

export function useTreasury(): TreasuryState {
  const [metrics, setMetrics] = useState<TreasuryMetrics>({
    totalValueLocked: 1240000,
    daoBalance: 420000,
    monthlyRevenue: 42000,
    monthlyExpenses: 19000,
  });
  const [assets, setAssets] = useState<TreasuryAsset[]>(INITIAL_ASSETS);
  const [history, setHistory] = useState<MultiSeriesDataPoint[]>(INITIAL_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        totalValueLocked: prev.totalValueLocked + (Math.random() * 1000 - 200),
        monthlyRevenue: prev.monthlyRevenue + (Math.random() * 500),
      }));
      setLastUpdated(new Date().toISOString());
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return {
    metrics,
    assets,
    allocations: INITIAL_ALLOCATIONS,
    history,
    lastUpdated,
    isLoading,
  };
}

export default useTreasury;
