import React from 'react';
import type { WalletState } from '../../types';

interface WalletDashboardProps {
  wallet: WalletState;
  copied: boolean;
  onCopy: () => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ wallet, copied, onCopy }) => {
  const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-6)}`;
  const totalUsd = wallet.assets.reduce((sum, a) => sum + a.balance * a.usdValue, 0);

  return (
    <div className="bg-gradient-to-br from-stellar to-stellar-light rounded-3xl p-8 text-white shadow-xl shadow-stellar/20">
      {/* Address row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Stellar Wallet</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{shortAddress}</span>
            <button
              onClick={onCopy}
              aria-label="Copy wallet address"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
          💎
        </div>
      </div>

      {/* Total balance */}
      <div className="mb-6">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Total Balance</p>
        <p className="text-4xl font-bold tabular-nums">${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      {/* Asset breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {wallet.assets.map(asset => (
          <div key={asset.code} className="bg-white/10 rounded-2xl p-3">
            <p className="text-white/60 text-xs font-bold mb-1">{asset.code}</p>
            <p className="font-bold tabular-nums">{asset.balance.toLocaleString()}</p>
            <p className="text-white/50 text-xs">${(asset.balance * asset.usdValue).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletDashboard;
