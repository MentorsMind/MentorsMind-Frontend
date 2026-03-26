import type { AssetCode } from './index';

export interface ChartDatum {
  date: string;
  value: number;
  asset?: AssetCode;
  category?: string;
  learner?: string;
}

export interface EarningsMetrics {
  avgDuration: number; // minutes
  totalSessions: number;
  platformFees: number;
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  periodChange: number; // percentage
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface UseChartDataOptions<T> {
  fetchFn: () => Promise<T>;
  deps?: unknown[];
  // cache controls
  staleTime?: number;
  gcTime?: number; // v5 (cacheTime in v4)
}

export interface UseChartDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
