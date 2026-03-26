import React from 'react';
import { useMentorWallet } from '../hooks/useMentorWallet';
import WalletDashboard from '../components/mentor/WalletDashboard';
import EarningsBreakdown from '../components/mentor/EarningsBreakdown';
import PayoutRequest from '../components/mentor/PayoutRequest';
import PayoutHistory from '../components/mentor/PayoutHistory';
import MetricCard from '../components/charts/MetricCard';

const MentorWallet: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => {
  const {
    wallet,
    txFilter, setTxFilter,
    filteredTx,
    payoutAmount, setPayoutAmount,
    payoutAsset, setPayoutAsset,
    payoutStatus,
    requestPayout,
    copied, copyAddress,
    exportEarnings,
  } = useMentorWallet();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Wallet</h2>
        <p className="text-gray-500">Manage your Stellar earnings and payouts.</p>
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
            onSubmit={isOnline ? requestPayout : () => alert('Payouts are disabled while offline.')}
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

      {/* Session earnings breakdown */}
      <EarningsBreakdown
        sessions={wallet.sessionEarnings}
        platformFeeRate={wallet.platformFeeRate}
        onExport={exportEarnings}
      />
    </div>
  );
};

export default MentorWallet;
