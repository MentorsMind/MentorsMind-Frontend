import type { WalletBalance } from '../../services/wallet.service';

interface WalletBalanceCardProps {
  balance: WalletBalance;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const ASSET_ICONS: Record<string, string> = {
  XLM: '⭐',
  USDC: '💵',
  PYUSD: '💲',
};

const ASSET_NAMES: Record<string, string> = {
  XLM: 'Stellar Lumens',
  USDC: 'USD Coin',
  PYUSD: 'PayPal USD',
};

export default function WalletBalanceCard({
  balance,
  onDeposit,
  onWithdraw,
}: WalletBalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {ASSET_ICONS[balance.assetCode]}
          </div>
          <div>
            <p className="text-sm text-white/80">{ASSET_NAMES[balance.assetCode]}</p>
            <p className="font-semibold">{balance.assetCode}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-white/80 mb-1">Balance</p>
        <p className="text-3xl font-bold">
          {parseFloat(balance.balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 7,
          })}{' '}
          {balance.assetCode}
        </p>
        <p className="text-sm text-white/80 mt-1">
          ≈ ${balance.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </p>
      </div>

      <div className="flex gap-2">
        {onDeposit && (
          <button
            onClick={onDeposit}
            className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm"
          >
            Deposit
          </button>
        )}
        {onWithdraw && (
          <button
            onClick={onWithdraw}
            className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm"
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
