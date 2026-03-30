import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useCreditScore } from '../hooks/useCreditScore';
import CreditGauge from '../components/lending/CreditGauge';
import ScoreBreakdown from '../components/lending/ScoreBreakdown';
import ImprovementTips from '../components/lending/ImprovementTips';
import LineChart from '../components/charts/LineChart';

// Score history chart series config — matches LineChart's ChartSeries interface
const HISTORY_SERIES = [
  { key: 'score', name: 'Credit Score', color: '#6366f1' },
];

const CreditScoreContent: React.FC = () => {
  const { data, loading, refreshing, error, weakestComponent, refreshScore } = useCreditScore();
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animation once
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Transform history into the shape LineChart expects (MultiSeriesDataPoint)
  const chartData = data.history.map((h) => ({
    label: h.month,
    score: h.score,
  }));

  const formattedDate = new Date(data.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isEligibleForLoan = data.score >= 600;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div
      className={`p-6 space-y-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ── Page Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Credit Score
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Last updated {formattedDate}
          </p>
        </div>

        {/* Refresh Score button */}
        <button
          onClick={refreshScore}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold shadow-sm transition-all"
          aria-busy={refreshing}
        >
          {refreshing ? (
            <>
              <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
              Refreshing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Score
            </>
          )}
        </button>
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Top section: Gauge + Borrowing Capacity ── */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gauge card */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 self-start">
            Your Score
          </h2>
          <CreditGauge score={data.score} />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Range: 300 (Poor) → 850 (Exceptional)
          </p>
        </div>

        {/* Borrowing capacity card */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Borrowing Capacity
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Based on your current credit score, you can access:
            </p>

            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                ${data.borrowingCapacity.toLocaleString()}
              </span>
              <span className="text-lg text-gray-400 dark:text-gray-500 pb-1">USD</span>
            </div>

            {/* Score tier indicator */}
            <div className="mt-4 flex gap-1">
              {[
                { min: 300, max: 579, label: 'Poor', color: 'bg-red-400' },
                { min: 580, max: 669, label: 'Fair', color: 'bg-amber-400' },
                { min: 670, max: 739, label: 'Good', color: 'bg-lime-400' },
                { min: 740, max: 799, label: 'Very Good', color: 'bg-green-400' },
                { min: 800, max: 850, label: 'Exceptional', color: 'bg-emerald-500' },
              ].map((tier) => {
                const active = data.score >= tier.min && data.score <= tier.max;
                return (
                  <div key={tier.label} className="flex-1">
                    <div
                      className={`h-2 rounded-full ${tier.color} ${active ? 'opacity-100 ring-2 ring-offset-1 ring-gray-400' : 'opacity-25'}`}
                    />
                    <p className={`text-xs mt-1 text-center ${active ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                      {tier.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA to lending pool */}
          {isEligibleForLoan ? (
            <a
              href="/lending"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-sm"
            >
              View Lending Pool
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : (
            <div className="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Reach a score of <span className="font-bold text-gray-700 dark:text-gray-300">600+</span> to unlock the lending pool.
            </div>
          )}
        </div>
      </section>

      {/* ── Score History Chart ── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Score History</h2>
        <LineChart
          data={chartData}
          series={HISTORY_SERIES}
          title="Last 6 Months"
          description="Your credit score trend over time."
          xAxisKey="label"
          valuePrefix=""
          valueSuffix=""
          exportable
          exportFilename="credit-score-history"
        />
      </section>

      {/* ── Score Breakdown + Improvement Tips ── */}
      <section className="grid gap-6 md:grid-cols-2">
        <ScoreBreakdown components={data.components} />
        <ImprovementTips weakestComponent={weakestComponent} />
      </section>
    </div>
  );
};

const CreditScore: React.FC = () => (
  <DashboardLayout>
    <CreditScoreContent />
  </DashboardLayout>
);

export default CreditScore;