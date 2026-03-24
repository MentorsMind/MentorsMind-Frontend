export interface DataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface MultiSeriesDataPoint {
  label: string;
  [key: string]: string | number;
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

export interface ChartState {
  isLoading: boolean;
  error: string | null;
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
