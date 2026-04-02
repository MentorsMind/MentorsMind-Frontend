import React, { useState } from 'react';
import { useMentorWallet } from '../hooks/useMentorWallet';
import { useEscrow } from '../hooks/useEscrow';
import WalletDashboard from '../components/mentor/WalletDashboard';
import EarningsBreakdown from '../components/mentor/EarningsBreakdown';
import PayoutRequest from '../components/mentor/PayoutRequest';
import PayoutHistory from '../components/mentor/PayoutHistory';
import MetricCard from '../components/charts/MetricCard';
import { FreighterConnect } from '../components/wallet/FreighterConnect';
import EscrowStatus from '../components/payment/EscrowStatus';
import EscrowTimeline from '../components/payment/EscrowTimeline';
import { KYCStatusBanner } from '../components/compliance/KYCStatus';
import { useKYC } from '../hooks/useKYC';
import { useNavigate } from 'react-router-dom';

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

  const { status, limits, resubmit, rejectionReason } = useKYC();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'escrow'>('overview');
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Wallet</h2>
        <p className="text-gray-500">Manage your Stellar earnings and payouts.</p>
      </div>

      <KYCStatusBanner
        status={status}
        limits={limits}
        onVerify={() => navigate('/kyc')}
        onResubmit={resubmit}
        rejectionReason={rejectionReason}
      />

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
    </div>
  );
};

export default MentorWallet;
