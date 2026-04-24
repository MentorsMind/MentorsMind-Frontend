import { useEarnings } from '../hooks/useEarnings';
import EarningsSummary from '../components/earnings/EarningsSummary';
import EarningsChart from '../components/earnings/EarningsChart';
import SessionTable from '../components/earnings/SessionTable';
import EmptyState from '../components/earnings/EmptyState';

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
    chartRange,
    setChartRange,
    page,
    setPage,
    sortKey,
    sortDir,
    setSort,
    exportCSV,
    currency,
  } = useEarnings();

  const hasData = sessions.length > 0 || allSortedSessions.length > 0;

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

      {/* Loading skeleton below summary when no data yet */}
      {loading && !hasData && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl h-64 animate-pulse" aria-hidden="true" />
          <div className="bg-surface rounded-xl h-48 animate-pulse" aria-hidden="true" />
        </div>
      )}

      {/* Empty state */}
      {!loading && allSortedSessions.length === 0 && <EmptyState />}

      {/* Chart + table */}
      {allSortedSessions.length > 0 && (
        <>
          <EarningsChart
            series={chartSeries}
            range={chartRange}
            onRangeChange={setChartRange}
            currency={currency}
          />
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
        </>
      )}
    </div>
  );
}
