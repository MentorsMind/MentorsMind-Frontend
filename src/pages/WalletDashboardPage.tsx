import { useState, useEffect } from 'react';
import WalletActivationCard from '../components/wallet/WalletActivationCard';
import WalletBalanceCard from '../components/wallet/WalletBalanceCard';
import TransactionHistoryList from '../components/wallet/TransactionHistoryList';
import Alert from '../components/ui/Alert';
import {
  getWallet,
  getWalletBalances,
  type WalletBalance,
} from '../services/wallet.service';

export default function WalletDashboardPage() {
  const [activated, setActivated] = useState(false);
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

      if (walletInfo.activated) {
        const balanceData = await getWalletBalances();
        setBalances(balanceData);
      }
    } catch (err) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    // You could add a toast notification here
  };

  const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        {activated && (
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {!activated ? (
        <WalletActivationCard onActivated={handleActivated} />
      ) : (
        <>
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

          {/* Total Portfolio Value */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold">
              ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>

          {/* Asset Balances */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction History
            </h2>
            <TransactionHistoryList key={refreshKey} />
          </div>
        </>
      )}
    </div>
  );
}
