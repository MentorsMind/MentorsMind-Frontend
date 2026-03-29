import React, { useState } from 'react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { TransactionFilters } from '../components/wallet/TransactionFilters';
import { TransactionList } from '../components/wallet/TransactionList';
import { TransactionDetail } from '../components/wallet/TransactionDetail';
import type { PaymentTransaction } from '../types';

const PaymentHistory: React.FC = () => {
  const {
    filters,
    availableAssets,
    availableTypes,
    availableStatuses,
    sortField,
    sortDirection,
    displayedTransactions,
    pendingTransactions,
    monthlyGroups,
    hasMore,
    updateFilters,
    toggleType,
    toggleStatus,
    clearFilters,
    setSort,
    loadMore,
    exportCsv,
    downloadReceipt,
  } = useTransactionHistory();

  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Payment <span className="text-stellar">History</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">
            All your Stellar transactions in one place.
          </p>
        </div>
        <button
          id="export-csv-btn"
          onClick={exportCsv}
          className="flex items-center gap-2.5 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-8">
          <TransactionFilters
            search={filters.search}
            type={filters.type}
            asset={filters.asset}
            status={filters.status}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            amountMin={filters.amountMin}
            amountMax={filters.amountMax}
            availableTypes={availableTypes}
            availableAssets={availableAssets}
            availableStatuses={availableStatuses}
            onSearchChange={(value) => updateFilters({ search: value })}
            onToggleType={toggleType}
            onAssetChange={(value) => updateFilters({ asset: value })}
            onToggleStatus={toggleStatus}
            onDateFromChange={(value) => updateFilters({ dateFrom: value })}
            onDateToChange={(value) => updateFilters({ dateTo: value })}
            onAmountMinChange={(value) => updateFilters({ amountMin: value })}
            onAmountMaxChange={(value) => updateFilters({ amountMax: value })}
            onClear={clearFilters}
          />
        </div>

        <div className="lg:col-span-3">
          <TransactionList
            pendingTransactions={pendingTransactions}
            monthlyGroups={monthlyGroups}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onSelectTransaction={setSelectedTx}
            onSort={setSort}
            sortField={sortField}
            sortDirection={sortDirection}
            transactions={displayedTransactions}
          />
        </div>
      </div>

      <TransactionDetail
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onDownloadReceipt={downloadReceipt}
      />
    </div>
  );
};

export default PaymentHistory;
