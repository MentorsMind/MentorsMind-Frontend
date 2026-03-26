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
</xai:function_call >

<xai:function_call name="create_file">
<parameter name="absolute_path">src/hooks/useEarningsData.ts
