import { useEarnings } from '../hooks/useEarnings';
import EarningsSummary from '../components/earnings/EarningsSummary';
import EarningsChart from '../components/earnings/EarningsChart';
import SessionTable from '../components/earnings/SessionTable';
import EmptyState from '../components/earnings/EmptyState';
import { formatAmount } from '../utils/earnings.utils';
import type { DateRangeFilter } from '../types/earnings.types';

function formatDateInputValue(isoString: string): string {
  try {
    return isoString.split('T')[0];
  } catch {
    return '';
  }
}

export default function MentorWallet() {
  const {
    summary,
    chartSeries,
    sessions,
    allSortedSessions,
    totalSessions,
    loading,
    error,
    retry,
    groupBy,
    setGroupBy,
    dateRange,
    setDateRange,
    walletSummary,
    page,
    setPage,
    sortKey,
    sortDir,
    setSort,
    exportCSV,
    currency,
  } = useEarnings();

  const hasData = sessions.length > 0 || allSortedSessions.length > 0;
  const hasChartData = chartSeries.length > 0;

  const handleDateChange = (field: keyof DateRangeFilter, value: string) => {
    // Convert date input (YYYY-MM-DD) to ISO string
    const iso = new Date(value).toISOString();
    setDateRange({ ...dateRange, [field]: iso });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Earnings &amp; Payouts</h1>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={retry}
            className="shrink-0 font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards — always visible */}
      <EarningsSummary summary={summary} loading={loading} />

      {/* Date range picker */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-600">Date Range</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={formatDateInputValue(dateRange.from)}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="From date"
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="date"
            value={formatDateInputValue(dateRange.to)}
            onChange={(e) => handleDateChange('to', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="To date"
          />
        </div>
      </div>

      {/* Loading skeleton below summary when no data yet */}
      {loading && !hasData && !hasChartData && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl h-64 animate-pulse" aria-hidden="true" />
          <div className="bg-surface rounded-xl h-48 animate-pulse" aria-hidden="true" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasChartData && allSortedSessions.length === 0 && <EmptyState />}

      {/* Chart */}
      {hasChartData && (
        <EarningsChart
          series={chartSeries}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          currency={currency}
        />
      )}

      {/* Session table */}
      {allSortedSessions.length > 0 && (
        <SessionTable
          sessions={sessions}
          allSessions={allSortedSessions}
          totalSessions={totalSessions}
          page={page}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={setSort}
          onPageChange={setPage}
          onExport={exportCSV}
        />
      )}

      {/* Wallet Earnings Section */}
      {walletSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Wallet Earnings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(walletSummary.totalEarnings, currency)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Period</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(walletSummary.currentPeriodEarnings, currency)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg / Session</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(walletSummary.periodSummary.averageEarning, currency)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {walletSummary.periodSummary.sessionCount} sessions
              </p>
            </div>
          </div>

          {walletSummary.recentTransactions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {walletSummary.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {new Date(tx.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 capitalize">{tx.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{tx.description ?? '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums text-gray-900 font-medium">
                          {formatAmount(tx.amount, tx.asset)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

