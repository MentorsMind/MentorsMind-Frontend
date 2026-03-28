import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, TrendingUp, Send, ArrowDownToLine } from 'lucide-react';
import type { ParsedBalance } from '../../hooks/useHorizon';

interface WalletBalanceProps {
  balances: ParsedBalance[];
  totalUsd: number;
  minimumReserve: number;
  availableXlm: number;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  publicKey?: string;
}

const ASSET_ICONS: Record<string, string> = {
  XLM: '🚀',
  USDC: '💵',
  PYUSD: '🅿️',
};

export function WalletBalance({
  balances,
  totalUsd,
  minimumReserve,
  availableXlm,
  loading,
  error,
  onRefresh,
  publicKey,
}: WalletBalanceProps) {
  const [showAll, setShowAll] = useState(false);
  const xlmBalance = balances.find(b => b.isNative);
  const xlmAmount = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  const showReserveWarning = xlmAmount > 0 && availableXlm < 2;

  return (
    <div className="bg-gradient-to-br from-stellar to-stellar-light rounded-3xl p-6 text-white shadow-xl shadow-stellar/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Balance
          </p>
          {loading ? (
            <div className="h-10 w-36 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <p className="text-4xl font-bold tabular-nums">
              ${(totalUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          {publicKey && (
            <p className="text-white/50 text-[10px] font-mono mt-1">
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh balance"
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 flex items-center justify-center gap-2 bg-white text-stellar font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Send className="w-4 h-4" />
          Send
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-2.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
          <ArrowDownToLine className="w-4 h-4" />
          Receive
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/20 border border-red-400/30 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* Reserve warning */}
      {showReserveWarning && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/30">
          <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-100 leading-relaxed">
            Low available XLM. Minimum reserve is{' '}
            <span className="font-bold">{minimumReserve} XLM</span> (base + trustlines).
            Available to send: <span className="font-bold">{(availableXlm || 0).toFixed(2)} XLM</span>.
          </p>
        </div>
      )}

      {/* Asset list */}
      <div className="space-y-2">
        {loading && balances.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-2xl animate-pulse" />
            ))
          : (showAll ? balances : balances.slice(0, 3)).map(b => (
              <div
                key={`${b.assetCode}-${b.assetIssuer ?? 'native'}`}
                className="flex items-center justify-between bg-white/10 backdrop-blur rounded-2xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {ASSET_ICONS[b.assetCode] ?? '🪙'}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{b.assetCode}</p>
                    {!b.isNative && b.assetIssuer && (
                      <p className="text-white/50 text-[10px] font-mono">
                        {b.assetIssuer.slice(0, 8)}...{b.assetIssuer.slice(-8)}
                      </p>
                    )}
                    {b.isNative && (
                      <p className="text-white/50 text-[10px]">
                        {(availableXlm || 0).toFixed(2)} available
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums">
                    {parseFloat(b.balance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 7,
                    })}
                  </p>
                  {b.usdValue > 0 && (
                    <p className="text-white/60 text-xs tabular-nums flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3" />
                      ${b.totalUsd.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}

        {balances.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 mt-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${balances.length - 3} More Assets`}
          </button>
        )}
      </div>

      {/* Reserve info footer */}
      {!loading && balances.length > 0 && (
        <p className="mt-4 text-center text-white/40 text-[10px]">
          Min. reserve: {minimumReserve} XLM · {balances.length - 1} trustline(s)
        </p>
      )}
    </div>
  );
}
