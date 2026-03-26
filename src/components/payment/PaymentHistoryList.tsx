import React from 'react';
import type { PaymentTransaction, PaymentAnalytics } from '../../types';
import type { SortField, SortDirection } from '../../hooks/usePaymentHistory';
import PaymentHistoryItem from './PaymentHistoryItem';

interface PaymentHistoryListProps {
  transactions: PaymentTransaction[];
  analytics: PaymentAnalytics;
  sortField: SortField;
  sortDirection: SortDirection;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onSelectTransaction: (tx: PaymentTransaction) => void;
}

const AnalyticsCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, colorClass, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-20 h-20 ${colorClass} rounded-full -mr-6 -mt-6 opacity-60 transition-transform group-hover:scale-150 duration-700`} />
    <div className="relative">
      <div className={`w-9 h-9 rounded-xl ${colorClass} bg-opacity-20 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-black text-gray-900">{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const SortIcon: React.FC<{ field: SortField; current: SortField; direction: SortDirection }> = ({
  field, current, direction
}) => (
  <svg
    className={`w-3.5 h-3.5 ml-1 transition-all ${current === field ? 'text-stellar' : 'text-gray-300'}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    {current === field && direction === 'asc'
      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
    }
  </svg>
);

const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({
  transactions,
  analytics,
  sortField,
  sortDirection,
  currentPage,
  totalPages,
  totalResults,
  onSort,
  onPageChange,
  onSelectTransaction,
}) => {
  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Total Spent"
          value={`${analytics.totalSpent.toFixed(0)} XLM`}
          sub={`${analytics.transactionCount} transactions`}
          colorClass="bg-stellar/10 text-stellar"
          icon={
            <svg className="w-4 h-4 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          }
        />
        <AnalyticsCard
          label="Completed"
          value={`${analytics.totalCompleted.toFixed(0)} XLM`}
          colorClass="bg-emerald-50 text-emerald-600"
          icon={
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <AnalyticsCard
          label="Pending"
          value={`${analytics.totalPending.toFixed(0)} XLM`}
          colorClass="bg-amber-50 text-amber-600"
          icon={
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <AnalyticsCard
          label="Refunded"
          value={`${analytics.totalRefunded.toFixed(0)} XLM`}
          colorClass="bg-sky-50 text-sky-600"
          icon={
            <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          }
        />
      </div>

      {/* List Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header / sort row */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/70">
          <div className="w-11 shrink-0" />
          <div className="flex-1" />
          <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            <button
              id="sort-by-date"
              className="flex items-center hover:text-stellar transition-colors"
              onClick={() => onSort('date')}
            >
              Date <SortIcon field="date" current={sortField} direction={sortDirection} />
            </button>
            <button
              id="sort-by-amount"
              className="flex items-center hover:text-stellar transition-colors"
              onClick={() => onSort('amount')}
            >
              Amount <SortIcon field="amount" current={sortField} direction={sortDirection} />
            </button>
            <button
              id="sort-by-status"
              className="hidden sm:flex items-center hover:text-stellar transition-colors"
              onClick={() => onSort('status')}
            >
              Status <SortIcon field="status" current={sortField} direction={sortDirection} />
            </button>
          </div>
          <div className="w-4 shrink-0" />
        </div>

        {/* Transaction rows */}
        {totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-600 mb-1">No transactions found</h3>
            <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 px-2 py-1">
            {transactions.map(tx => (
              <PaymentHistoryItem key={tx.id} transaction={tx} onClick={onSelectTransaction} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <span className="text-xs text-gray-400 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="pagination-prev"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  id={`pagination-page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-stellar text-white shadow-lg shadow-stellar/20'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                id="pagination-next"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryList;
