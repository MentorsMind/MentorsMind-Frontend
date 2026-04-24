import React from 'react';
import type { TransactionType } from '../../hooks/useTransactionHistory';
import type { PaymentStatus } from '../../types';

interface TransactionFiltersProps {
  search: string;
  type: TransactionType[];
  asset: string;
  status: PaymentStatus[];
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  availableTypes: TransactionType[];
  availableAssets: string[];
  availableStatuses: PaymentStatus[];
  onSearchChange: (value: string) => void;
  onToggleType: (value: TransactionType) => void;
  onAssetChange: (value: string) => void;
  onToggleStatus: (value: PaymentStatus) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onClear: () => void;
}

export function TransactionFilters({
  search,
  type,
  asset,
  status,
  dateFrom,
  dateTo,
  amountMin,
  amountMax,
  availableTypes,
  availableAssets,
  availableStatuses,
  onSearchChange,
  onToggleType,
  onAssetChange,
  onToggleStatus,
  onDateFromChange,
  onDateToChange,
  onAmountMinChange,
  onAmountMaxChange,
  onClear,
}: TransactionFiltersProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stellar">Filters</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Transaction History</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Search</label>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search hash, memo, description"
          className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Amount min</label>
            <input
              type="number"
              min="0"
              value={amountMin}
              onChange={(event) => onAmountMinChange(event.target.value)}
              placeholder="0"
              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Amount max</label>
            <input
              type="number"
              min="0"
              value={amountMax}
              onChange={(event) => onAmountMaxChange(event.target.value)}
              placeholder="1000"
              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Type</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableTypes.map((transactionType) => (
              <button
                key={transactionType}
                type="button"
                onClick={() => onToggleType(transactionType)}
                className={`rounded-3xl border px-4 py-3 text-sm text-left transition ${
                  type.includes(transactionType)
                    ? 'border-stellar bg-stellar/10 text-stellar'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-stellar/50'
                }`}
              >
                {transactionType}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Asset</p>
          <select
            value={asset}
            onChange={(event) => onAssetChange(event.target.value)}
            className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/20"
          >
            <option value="">All assets</option>
            {availableAssets.map((assetOption) => (
              <option key={assetOption} value={assetOption}>{assetOption}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Status</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableStatuses.map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => onToggleStatus(statusOption)}
                className={`rounded-3xl border px-4 py-3 text-sm text-left transition ${
                  status.includes(statusOption)
                    ? 'border-stellar bg-stellar/10 text-stellar'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-stellar/50'
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
