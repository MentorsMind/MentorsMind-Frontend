import React from 'react';
import type { ReactNode } from 'react';
import type { AssetCode } from './index';

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MultiSeriesDataPoint {
  label: string;
  [key: string]: string | number | null | undefined;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface ChartExportOptions {
  format: 'png' | 'svg';
  filename?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface ChartDatum {
  date: string;
  value: number;
  value2?: number;
  asset?: AssetCode;
  category?: string;
  learner?: string;
  [key: string]: string | number | AssetCode | undefined;
}

export interface UseChartDataOptions<T> {
  fetchFn: () => Promise<T>;
  deps?: any[];
}

export interface UseChartDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface EarningsMetrics {
  avgDuration: number;
  totalSessions: number;
  platformFees: number;
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  periodChange: number;
}

export interface AggregatedData {
  monthlyEarnings: ChartDatum[];
  weeklySessions: ChartDatum[];
  topLearners: ChartDatum[];
  skillBreakdown: ChartDatum[];
  metrics: EarningsMetrics;
}

export interface ChartExportOptions {
  format: 'png' | 'svg';
  filename?: string;
  width?: number;
  height?: number;
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

// Added for chart components
export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface MultiSeriesDataPoint {
  label: string;
  [key: string]: string | number;
}
