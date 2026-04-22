import React from 'react';
import { Info, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LimitBucket, LimitHistoryItem } from '../../hooks/useTransactionLimits';

interface LimitUsageProps {
  daily: LimitBucket;
  monthly: LimitBucket;
  tooltipText: string;
  history: LimitHistoryItem[];
  kycUrl: string;
}

const statusStyles: Record<LimitBucket['status'], { bar: string; badge: string; text: string }> = {
  safe: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700',
  },
  warning: {
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700',
  },
  danger: {
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700',
    text: 'text-red-700',
  },
};

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value);

const LimitCard: React.FC<{ bucket: LimitBucket }> = ({ bucket }) => {
  const styles = statusStyles[bucket.status];
  const percentLabel = `${bucket.percent}%`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{bucket.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {bucket.label}: ${formatCurrency(bucket.used)} / ${formatCurrency(bucket.limit)} used
          </p>
          <p className="text-xs text-gray-500">Resets {formatDate(bucket.resetAt)}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles.badge}`}>
          {percentLabel}
        </span>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-gray-100" role="progressbar"
        aria-valuenow={bucket.used} aria-valuemin={0} aria-valuemax={bucket.limit}>
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${bucket.percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>${formatCurrency(bucket.remaining)} remaining</span>
        <span className={`font-semibold ${styles.text}`}>
          {bucket.status === 'safe' ? 'Within limits' : bucket.status === 'warning' ? 'Approaching limit' : 'Near cap'}
        </span>
      </div>
    </div>
  );
};

const LimitUsage: React.FC<LimitUsageProps> = ({ daily, monthly, tooltipText, history, kycUrl }) => {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction Limits</h3>
          <p className="text-sm text-gray-500">Track daily and monthly usage and upgrade with KYC.</p>
        </div>
        <Link
          to={kycUrl}
          className="inline-flex items-center gap-2 rounded-xl border border-stellar/20 bg-stellar/10 px-4 py-2 text-sm font-semibold text-stellar hover:bg-stellar/20"
        >
          Increase limits
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LimitCard bucket={daily} />
        <LimitCard bucket={monthly} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <div className="relative group">
            <button
              type="button"
              aria-label="What counts toward limits"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-stellar/30"
            >
              <Info className="h-4 w-4" />
            </button>
            <div
              role="tooltip"
              className="absolute left-0 top-9 z-10 w-64 rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-600 shadow-lg opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {tooltipText}
            </div>
          </div>
          <span>What counts toward limits</span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:w-[420px]">
          <h4 className="text-sm font-semibold text-gray-900">Limit history</h4>
          <div className="mt-3 space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-stellar" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                  <p className="text-[11px] text-gray-400">Effective {formatDate(new Date(item.date))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LimitUsage;
