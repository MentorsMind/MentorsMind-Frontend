import MetricCard from '../charts/MetricCard';
import type { EarningsSummaryData } from '../../types/earnings.types';
import { formatAmount } from '../../utils/earnings.utils';

interface EarningsSummaryProps {
  summary: EarningsSummaryData | null;
  loading: boolean;
}

export default function EarningsSummary({ summary, loading }: EarningsSummaryProps) {
  if (loading || summary === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-xl h-28 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard
        title="Total Earned (All Time)"
        value={formatAmount(summary.totalAllTimeNet, summary.currency)}
      />
      <div className="relative">
        <MetricCard
          title="Pending Payouts"
          value={formatAmount(summary.pendingEscrow, summary.currency)}
        />
        <p className="text-xs text-gray-500 mt-1 px-1">
          Held in escrow — releases after session completion
        </p>
      </div>
      <MetricCard
        title="This Month's Earnings"
        value={formatAmount(summary.thisMonthNet, summary.currency)}
      />
    </div>
  );
}
