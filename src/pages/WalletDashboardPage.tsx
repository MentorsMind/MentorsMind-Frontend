import { useState, useEffect } from 'react';
import WalletActivationCard from '../components/wallet/WalletActivationCard';
import WalletBalanceCard from '../components/wallet/WalletBalanceCard';
import TransactionHistoryList from '../components/wallet/TransactionHistoryList';
import Alert from '../components/ui/Alert';
import {
  getWallet,
  getWalletBalances,
  normaliseBalance,
  activateWallet,
  type WalletBalance,
  type WalletBalanceResponse,
} from '../services/wallet.service';

export default function WalletDashboardPage() {
  const [activated, setActivated] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchWalletData();
  }, [refreshKey]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError('');
    try {
      const walletInfo = await getWallet();
      setActivated(walletInfo.activated);
      setPublicKey(walletInfo.publicKey);

      // Always fetch balances — the response tells us whether the account exists on-chain
      const balanceResponse: WalletBalanceResponse = await getWalletBalances();
      setAccountExists(balanceResponse.accountExists);

      if (balanceResponse.accountExists && balanceResponse.balances) {
        // Normalise raw balances (assetType/assetCode) into uniform WalletBalance[]
        const normalised = balanceResponse.balances.map(normaliseBalance);
        setBalances(normalised);
      } else {
        setBalances([]);
      }
    } catch (err) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivated = () => {
    setRefreshKey((prev: number) => prev + 1);
  };

  const handleActivate = async () => {
    try {
      await activateWallet();
      handleActivated();
    } catch (err) {
      setError('Failed to activate wallet. Please try again.');
    }
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
  };

  const totalUsdValue = balances.reduce((sum: number, b: WalletBalance) => sum + b.usdValue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Wallet not yet activated in the app at all — show full activation card
  if (!activated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        {error && <Alert type="error">{error}</Alert>}
        <WalletActivationCard onActivated={handleActivated} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Public Key Display */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Your Wallet Address
            </p>
            <p className="text-sm font-mono text-gray-900 truncate">
              {publicKey}
            </p>
          </div>
          <button
            onClick={copyPublicKey}
            className="ml-4 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Balance Overview — handles both accountExists states */}
      <div className="bg-gradient-to-br from-stellar to-stellar-light rounded-3xl p-6 text-white shadow-xl shadow-stellar/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
              Total Balance
            </p>
            <p className="text-4xl font-bold tabular-nums">
              ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {!accountExists && !loading && (
          <div className="px-4 py-6 rounded-2xl bg-white/10 border border-white/20 text-center">
            <p className="text-sm font-semibold mb-2">Account Not Yet Activated on Stellar</p>
            <p className="text-xs text-white/70 mb-4">
              Your wallet address exists but hasn&apos;t been created on the Stellar network yet.
            </p>
            <button
              onClick={handleActivate}
              className="px-4 py-2 bg-white text-stellar rounded-xl text-sm font-bold hover:bg-white/90 transition-colors"
            >
              Activate Wallet
            </button>
          </div>
        )}

        {/* Asset Balances — only show when account exists */}
        {accountExists && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {balances.map((balance) => (
              <WalletBalanceCard
                key={balance.assetCode}
                balance={balance}
                onDeposit={() => {
                  /* TODO: Implement deposit modal */
                }}
                onWithdraw={() => {
                  /* TODO: Implement withdraw modal */
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transaction History
        </h2>
        <TransactionHistoryList key={refreshKey} />
      </div>
    </div>
  );
}

