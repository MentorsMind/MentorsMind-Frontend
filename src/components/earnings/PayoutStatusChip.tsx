import { useState } from 'react';
import type { PayoutStatus } from '../../types/earnings.types';

interface PayoutStatusChipProps {
  status: PayoutStatus;
  estimatedReleaseDate?: string;
}

const CONFIG: Record<PayoutStatus, { label: string; classes: string }> = {
  completed: { label: 'Paid',    classes: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700' },
  failed:    { label: 'Failed',  classes: 'bg-red-100 text-red-700' },
};

function formatReleaseDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PayoutStatusChip({ status, estimatedReleaseDate }: PayoutStatusChipProps) {
  const { label, classes } = CONFIG[status];
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const chip = (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );

  if (status !== 'pending') {
    return chip;
  }

  const tooltipText = estimatedReleaseDate
    ? formatReleaseDate(estimatedReleaseDate)
    : 'Release date pending session confirmation';

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
    >
      {/* tabIndex makes the wrapper focusable for keyboard/screen-reader users */}
      <span
        tabIndex={0}
        aria-describedby="payout-tooltip"
        className="inline-flex"
      >
        {chip}
      </span>
      {tooltipVisible && (
        <div
          id="payout-tooltip"
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap pointer-events-none"
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}
