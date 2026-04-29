import React, { useState, useEffect, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import MetricCard from '../charts/MetricCard';
import LineChart from '../charts/LineChart';
import { AdminTable } from './AdminTable';
import { AdminService } from '../../services/admin.service';
import type {
  RevenuePeriod,
  RevenueSummary,
  RevenueDailyPoint,
  RevenueTransaction,
} from '../../types/admin.types';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns today's date as an ISO date string (YYYY-MM-DD). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the ISO date string N days before today. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Converts a YYYY-MM-DD string to a full ISO-8601 datetime string. */
function toISO(date: string, endOfDay = false): string {
  return endOfDay ? `${date}T23:59:59.999Z` : `${date}T00:00:00.000Z`;
}

const PERIOD_OPTIONS: { label: string; value: RevenuePeriod; days: number }[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
  { label: 'Last year', value: '1y', days: 365 },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── component ──────────────────────────────────────────────────────────────

const AdminRevenueReport: React.FC = () => {
  // Period selector (summary card)
  const [period, setPeriod] = useState<RevenuePeriod>('30d');

  // Date range (chart + transactions + export)
  const [fromDate, setFromDate] = useState<string>(daysAgo(30));
  const [toDate, setToDate] = useState<string>(today());

  // Data state
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [dailySeries, setDailySeries] = useState<RevenueDailyPoint[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [txMeta, setTxMeta] = useState({ total: 0, limit: 25, offset: 0 });

  // Loading / error state per section
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Inline validation error shown when user tries to fetch without both dates
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  const [exportLoading, setExportLoading] = useState(false);

  // ── fetch summary (depends only on period) ──────────────────────────────
  const fetchSummary = useCallback(async (p: RevenuePeriod) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await AdminService.getRevenueSummary(p);
      setSummary(data);
    } catch {
      setSummaryError('Failed to load revenue summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── fetch chart + transactions (depend on date range) ───────────────────
  const fetchDateRangeData = useCallback(
    async (from: string, to: string, offset = 0, limit = 25) => {
      if (!from || !to) {
        setDateRangeError('Both from and to query parameters are required');
        return;
      }
      setDateRangeError(null);

      const fromISO = toISO(from);
      const toISO_ = toISO(to, true);

      // Chart
      setChartLoading(true);
      setChartError(null);
      // Transactions
      setTxLoading(true);
      setTxError(null);

      const [chartResult, txResult] = await Promise.allSettled([
        AdminService.getRevenueDailySeries(fromISO, toISO_),
        AdminService.getRevenueTransactions(fromISO, toISO_, offset, limit),
      ]);

      if (chartResult.status === 'fulfilled') {
        setDailySeries(chartResult.value);
      } else {
        setChartError('Failed to load daily revenue data.');
      }
      setChartLoading(false);

      if (txResult.status === 'fulfilled') {
        setTransactions(txResult.value.data);
        setTxMeta(txResult.value.meta);
      } else {
        setTxError('Failed to load transactions.');
      }
      setTxLoading(false);
    },
    []
  );

  // ── initial parallel load ────────────────────────────────────────────────
  useEffect(() => {
    fetchSummary(period);
    fetchDateRangeData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── period change ────────────────────────────────────────────────────────
  const handlePeriodChange = (p: RevenuePeriod) => {
    setPeriod(p);
    fetchSummary(p);
  };

  // ── date range apply ─────────────────────────────────────────────────────
  const handleApplyDateRange = () => {
    if (!fromDate || !toDate) {
      setDateRangeError('Both from and to query parameters are required');
      return;
    }
    fetchDateRangeData(fromDate, toDate, 0, txMeta.limit);
    setTxMeta((m) => ({ ...m, offset: 0 }));
  };

  // ── pagination ───────────────────────────────────────────────────────────
  const handlePageChange = (offset: number) => {
    setTxMeta((m) => ({ ...m, offset }));
    fetchDateRangeData(fromDate, toDate, offset, txMeta.limit);
  };

  const handleLimitChange = (limit: number) => {
    setTxMeta((m) => ({ ...m, limit, offset: 0 }));
    fetchDateRangeData(fromDate, toDate, 0, limit);
  };

  // ── export ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!fromDate || !toDate) {
      setDateRangeError('Both from and to query parameters are required');
      return;
    }
    setExportLoading(true);
    AdminService.exportRevenueCSV(toISO(fromDate), toISO(toDate, true));
    // Reset loading after a short delay — we can't track window.location navigation
    setTimeout(() => setExportLoading(false), 2000);
  };

  // ── table columns ────────────────────────────────────────────────────────
  const txColumns = [
    { key: 'id', label: 'ID', sortable: false },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    { key: 'userName', label: 'User', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (v: number, item: RevenueTransaction) =>
        `${formatCurrency(v)} ${item.asset ?? ''}`.trim(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (v: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
          {v}
        </span>
      ),
    },
    { key: 'type', label: 'Type', sortable: false, render: (v: string) => v ?? '—' },
  ];

  // ── chart data ───────────────────────────────────────────────────────────
  const chartData = dailySeries.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: p.revenue,
  }));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Report</h1>
          <p className="text-gray-500 text-sm mt-1">
            Platform revenue, daily trends, and completed transactions
          </p>
        </div>

        {/* Export CSV */}
        <button
          onClick={handleExport}
          disabled={exportLoading || !fromDate || !toDate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start sm:self-auto"
          aria-label="Export revenue CSV"
        >
          <Download size={16} aria-hidden="true" />
          {exportLoading ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <section aria-labelledby="summary-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 id="summary-heading" className="text-base font-semibold text-gray-700">
            Summary
          </h2>
          {/* Period selector */}
          <div className="flex gap-1 flex-wrap" role="group" aria-label="Summary period">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePeriodChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={period === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {summaryError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-3" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            {summaryError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Revenue"
            value={summaryLoading ? '—' : formatCurrency(summary?.totalRevenue ?? 0)}
            prefix="$"
            icon="💰"
          />
          <MetricCard
            title="Transactions"
            value={summaryLoading ? '—' : (summary?.transactionCount ?? 0).toLocaleString()}
            icon="🔄"
          />
          <MetricCard
            title="Platform Fees"
            value={summaryLoading ? '—' : formatCurrency(summary?.platformFees ?? 0)}
            prefix="$"
            icon="🏦"
          />
        </div>
      </section>

      {/* ── Date range picker ─────────────────────────────────────────────── */}
      <section aria-labelledby="date-range-heading">
        <h2 id="date-range-heading" className="text-base font-semibold text-gray-700 mb-3">
          Date Range
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="from-date" className="text-xs font-medium text-gray-600">
                From
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                max={toDate || today()}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDateRangeError(null);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="to-date" className="text-xs font-medium text-gray-600">
                To
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                min={fromDate}
                max={today()}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDateRangeError(null);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleApplyDateRange}
              className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Inline validation error */}
          {dateRangeError && (
            <div
              className="flex items-center gap-2 mt-3 text-red-600 text-sm"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle size={15} aria-hidden="true" />
              {dateRangeError}
            </div>
          )}
        </div>
      </section>

      {/* ── Daily revenue chart ───────────────────────────────────────────── */}
      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="text-base font-semibold text-gray-700 mb-3">
          Daily Revenue
        </h2>

        {chartError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-3" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            {chartError}
          </div>
        )}

        {chartLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-[340px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              <span className="text-sm">Loading chart…</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 h-[340px] flex items-center justify-center text-gray-400 text-sm">
            No data for the selected date range.
          </div>
        ) : (
          <LineChart
            data={chartData}
            xKey="date"
            lines={[{ key: 'revenue', color: '#6366f1', label: 'Revenue ($)' }]}
            height={300}
            valuePrefix="$"
          />
        )}
      </section>

      {/* ── Transactions table ────────────────────────────────────────────── */}
      <section aria-labelledby="tx-heading">
        <h2 id="tx-heading" className="text-base font-semibold text-gray-700 mb-3">
          Completed Transactions
        </h2>

        <AdminTable
          data={transactions}
          columns={txColumns}
          meta={txMeta}
          loading={txLoading}
          error={txError}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          title="Transactions"
        />
      </section>
    </div>
  );
};

export default AdminRevenueReport;
