import React from 'react';
import type { PaymentStatus } from '../../types';
import type { PaymentFiltersState } from '../../hooks/usePaymentHistory';

interface PaymentFiltersProps {
  filters: PaymentFiltersState;
  onUpdateFilters: (patch: Partial<PaymentFiltersState>) => void;
  onToggleStatus: (status: PaymentStatus) => void;
  onClearFilters: () => void;
}

const ALL_STATUSES: PaymentStatus[] = ['completed', 'pending', 'failed', 'refunded'];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; activeClass: string; dotClass: string }> = {
  completed: {
    label: 'Completed',
    activeClass: 'bg-emerald-500 text-white shadow-emerald-200',
    dotClass: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    activeClass: 'bg-amber-500 text-white shadow-amber-200',
    dotClass: 'bg-amber-400',
  },
  failed: {
    label: 'Failed',
    activeClass: 'bg-red-500 text-white shadow-red-200',
    dotClass: 'bg-red-400',
  },
  refunded: {
    label: 'Refunded',
    activeClass: 'bg-sky-500 text-white shadow-sky-200',
    dotClass: 'bg-sky-400',
  },
};

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onUpdateFilters,
  onToggleStatus,
  onClearFilters,
}) => {
  const hasActiveFilters =
    filters.search || filters.dateFrom || filters.dateTo || filters.statuses.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          id="payment-search"
          type="text"
          value={filters.search}
          onChange={e => onUpdateFilters({ search: e.target.value })}
          placeholder="Search by mentor name or TX hash…"
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            From
          </label>
          <input
            id="payment-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={e => onUpdateFilters({ dateFrom: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            To
          </label>
          <input
            id="payment-date-to"
            type="date"
            value={filters.dateTo}
            onChange={e => onUpdateFilters({ dateTo: e.target.value })}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar transition-all"
          />
        </div>
      </div>

      {/* Status Pills */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
          Status
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdateFilters({ statuses: [] })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              filters.statuses.length === 0
                ? 'bg-gray-900 text-white shadow-gray-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map(status => {
            const isActive = filters.statuses.includes(status);
            const { label, activeClass, dotClass } = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                id={`filter-status-${status}`}
                onClick={() => onToggleStatus(status)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isActive ? `${activeClass} shadow-lg` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : dotClass}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400 font-semibold">
          {filters.statuses.length > 0 || filters.search || filters.dateFrom || filters.dateTo ? 'Filtered results' : 'All transactions'}
        </span>
        {hasActiveFilters && (
          <button
            id="clear-filters-btn"
            onClick={onClearFilters}
            className="text-xs font-bold text-stellar hover:underline underline-offset-4 transition-all"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentFilters;
