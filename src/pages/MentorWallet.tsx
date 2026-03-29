import React, { useState } from 'react';
import { useMentorWallet } from '../hooks/useMentorWallet';
import { useEscrow } from '../hooks/useEscrow';
import { useTransactionLimits } from '../hooks/useTransactionLimits';
import WalletDashboard from '../components/mentor/WalletDashboard';
import EarningsBreakdown from '../components/mentor/EarningsBreakdown';
import PayoutRequest from '../components/mentor/PayoutRequest';
import PayoutHistory from '../components/mentor/PayoutHistory';
import MetricCard from '../components/charts/MetricCard';
import { FreighterConnect } from '../components/wallet/FreighterConnect';
import EscrowStatus from '../components/payment/EscrowStatus';
import EscrowTimeline from '../components/payment/EscrowTimeline';
import LimitUsage from '../components/compliance/LimitUsage';
import LimitWarningModal from '../components/compliance/LimitWarningModal';

const MentorWallet: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => {
  const {
    wallet,
    txFilter,
    setTxFilter,
    filteredTx,
    payoutAmount,
    setPayoutAmount,
    payoutAsset,
    setPayoutAsset,
    payoutStatus,
    requestPayout,
    copied,
    copyAddress,
    exportEarnings,
  } = useMentorWallet();

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

  const [activeTab, setActiveTab] = useState<'overview' | 'escrow'>('overview');
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const {
    daily,
    monthly,
    tooltipText,
    history,
    kycUrl,
    wouldExceedDailyLimit,
  } = useTransactionLimits();

  // Escrow hook for mentor view
  const {
    escrows,
    loading: escrowLoading,
    releaseEscrow,
    getCountdown,
    canRelease,
    canDispute,
    isWithinDisputeWindow
  } = useEscrow({ userRole: 'mentor', userId: 'mentor-001' });

  const payoutAmountValue = parseFloat(payoutAmount) || 0;

  const handlePayoutSubmit = () => {
    if (!isOnline) {
      alert('Payouts are disabled while offline.');
      return;
    }
    if (payoutAmountValue > 0 && wouldExceedDailyLimit(payoutAmountValue)) {
      setShowLimitWarning(true);
      return;
    }
    requestPayout();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Wallet</h2>
        <p className="text-gray-500">Manage your Stellar earnings and payouts.</p>
      </div>

      {/* Wallet Connection Section */}
      <div className="mb-6">
        <FreighterConnect 
          showNetworkIndicator={true}
          onConnect={(walletInfo) => {
            console.log('Wallet connected:', walletInfo);
            // You can add additional logic here when wallet connects
          }}
          onDisconnect={() => {
            console.log('Wallet disconnected');
            // You can add additional logic here when wallet disconnects
          }}
        />
      </div>

      {/* Top row: wallet card + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletDashboard wallet={wallet} copied={copied} onCopy={copyAddress} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4 content-start">
          <MetricCard
            title="Total Earned"
            value={`$${wallet.totalEarned.toLocaleString()}`}
            change={18.2}
            changeLabel="vs last month"
          />
          <MetricCard
            title="Available to Withdraw"
            value={`$${wallet.availableEarnings.toLocaleString()}`}
            change={5.4}
            changeLabel="vs last month"
          />
          <MetricCard
            title="Pending Clearance"
            value={`$${wallet.pendingEarnings.toLocaleString()}`}
          />
          <MetricCard
            title="Forecast Next Month"
            value={`$${wallet.forecastNextMonth.toLocaleString()}`}
            change={12.1}
            changeLabel="projected"
          />
        </div>
      </div>

      <LimitUsage
        daily={daily}
        monthly={monthly}
        tooltipText={tooltipText}
        history={history}
        kycUrl={kycUrl}
      />

      {/* Payout request + history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PayoutRequest
            availableEarnings={wallet.availableEarnings}
            pendingEarnings={wallet.pendingEarnings}
            amount={payoutAmount}
            asset={payoutAsset}
            status={payoutStatus}
            onAmountChange={setPayoutAmount}
            onAssetChange={setPayoutAsset}
            onSubmit={handlePayoutSubmit}
          />

        </div>
        <div className="lg:col-span-2">
          <PayoutHistory
            transactions={filteredTx}
            payoutHistory={wallet.payoutHistory}
            filter={txFilter}
            onFilterChange={setTxFilter}
          />
        </div>
      </div>

      <section className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stellar">Wallet history</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">Transaction dashboard</h2>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-3xl bg-stellar px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
            >
              Export CSV
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-2">
        {(['overview', 'escrow'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-stellar text-white shadow-lg shadow-stellar/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <EarningsBreakdown
          sessions={wallet.sessionEarnings}
          platformFeeRate={wallet.platformFeeRate}
          onExport={exportEarnings}
        />
      )}

      {activeTab === 'escrow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Escrow Contracts</h2>
              <p className="text-sm text-gray-500">Manage session payment escrows and releases</p>
            </div>
            <select
              value={selectedEscrowId || ''}
              onChange={(e) => setSelectedEscrowId(e.target.value || null)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-stellar"
            >
              <option value="">All Escrows</option>
              {escrows.map((escrow) => (
                <option key={escrow.id} value={escrow.id}>
                  Session {escrow.sessionId} - {escrow.amount} {escrow.asset} ({escrow.status})
                </option>
              ))}
            </select>
          </div>

          {escrowLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">No escrow contracts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(selectedEscrowId 
                ? escrows.filter(e => e.id === selectedEscrowId)
                : escrows
              ).map((escrow) => (
                <div key={escrow.id} className="space-y-4">
                  <EscrowStatus
                    escrow={escrow}
                    userRole="mentor"
                    onRelease={() => {
                      if (window.confirm('Are you sure you want to release these funds? This action cannot be undone.')) {
                        releaseEscrow(escrow.id);
                      }
                    }}
                    getCountdown={getCountdown}
                    canRelease={canRelease(escrow)}
                    canDispute={canDispute(escrow)}
                    isWithinDisputeWindow={isWithinDisputeWindow(escrow)}
                  />
                  <EscrowTimeline escrow={escrow} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LimitWarningModal
        isOpen={showLimitWarning}
        amount={payoutAmountValue}
        remaining={daily.remaining}
        kycUrl={kycUrl}
        onClose={() => setShowLimitWarning(false)}
      />
    </div>
  );
};

export default MentorWallet;
