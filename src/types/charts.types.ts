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

export interface AggregatedData {
  monthlyEarnings: ChartDatum[];
  weeklySessions: ChartDatum[];
  topLearners: ChartDatum[];
  skillBreakdown: ChartDatum[];
  metrics: EarningsMetrics;
}

export interface DataPoint {
  label: string;
  value: number;
}

export interface MultiSeriesDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface ChartExportOptions {
  filename?: string;
  format?: 'csv' | 'json' | 'png' | 'svg';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  icon?: any;
}

export interface UseChartDataOptions {
  interval?: 'day' | 'week' | 'month';
  limit?: number;
}

export interface UseChartDataResult {
  data: any[];
  isLoading: boolean;
  error: Error | null;
  exportData: (format: 'csv' | 'json') => void;
}
