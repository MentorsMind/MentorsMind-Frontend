import React, { useEffect } from 'react';
import { useHorizon } from '../hooks/useHorizon';
import { WalletBalance } from '../components/wallet/WalletBalance';
import { TrustlineManager } from '../components/wallet/TrustlineManager';
import { WalletQRCode } from '../components/wallet/WalletQRCode';
import { TransactionHistory } from '../components/wallet/TransactionHistory';

interface WalletDashboardPageProps {
  publicKey: string;
  nickname?: string;
}

export default function WalletDashboardPage({ publicKey, nickname }: WalletDashboardPageProps) {
  const {
    balances, transactions, totalUsd, minimumReserve, availableXlm,
    loading, error, fetchAccount, addTrustline,
  } = useHorizon(publicKey);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Wallet</h2>
        <p className="text-sm text-gray-500 mt-1">Stellar account overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <WalletBalance
            balances={balances}
            totalUsd={totalUsd}
            minimumReserve={minimumReserve}
            availableXlm={availableXlm}
            loading={loading}
            error={error}
            onRefresh={fetchAccount}
          />
          <WalletQRCode publicKey={publicKey} nickname={nickname} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <TrustlineManager balances={balances} onAddTrustline={addTrustline} />
          <TransactionHistory
            transactions={transactions}
            walletAddress={publicKey}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
