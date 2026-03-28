import type { ReactNode } from 'react';
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

export interface ChartExportOptions {
  format: 'svg' | 'png';
  filename?: string;
}

/** Row for multi-series Recharts (label + arbitrary numeric series keys). */
export type MultiSeriesDataPoint = Record<string, string | number>;

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
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
