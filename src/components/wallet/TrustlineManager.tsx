import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Plus, ExternalLink, Info } from 'lucide-react';
import type { ParsedBalance } from '../../hooks/useHorizon';

// Well-known assets that can be added as trustlines
const KNOWN_ASSETS = [
  {
    code: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
  {
    code: 'PYUSD',
    name: 'PayPal USD',
    icon: '🅿️',
    issuer: 'GACVHHKJSXMBGMGKPF2XJMMFK5GQZCRNMGYW2JTQM6XQQYAPQBDQBKN',
  },
];

interface TrustlineManagerProps {
  balances: ParsedBalance[];
  onAddTrustline: (assetCode: string, assetIssuer: string) => Promise<void>;
}

export function TrustlineManager({ balances, onAddTrustline }: TrustlineManagerProps) {
  const [statusMap, setStatusMap] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

  const hasTrustline = (code: string, issuer: string) =>
    balances.some(b => b.assetCode === code && b.assetIssuer === issuer);

  const handleAdd = async (code: string, issuer: string) => {
    setStatusMap((prev: Record<string, 'idle' | 'loading' | 'success' | 'error'>) => ({ ...prev, [code]: 'loading' }));
    try {
      await onAddTrustline(code, issuer);
      setStatusMap((prev: Record<string, 'idle' | 'loading' | 'success' | 'error'>) => ({ ...prev, [code]: 'success' }));
    } catch {
      setStatusMap((prev: Record<string, 'idle' | 'loading' | 'success' | 'error'>) => ({ ...prev, [code]: 'error' }));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="w-5 h-5 text-stellar" />
        <h3 className="font-bold text-gray-900">Trustlines</h3>
      </div>

      <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Each trustline reserves <span className="font-semibold">0.5 XLM</span> in your account.
          You must have sufficient XLM before adding one.
        </p>
      </div>

      <div className="space-y-3">
        {KNOWN_ASSETS.map(asset => {
          const active = hasTrustline(asset.code, asset.issuer);
          const status = statusMap[asset.code] ?? 'idle';

          return (
            <div
              key={asset.code}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${
                active
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">{asset.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {asset.issuer.slice(0, 8)}…{asset.issuer.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://stellar.expert/explorer/public/asset/${asset.code}-${asset.issuer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${asset.code} on Stellar Expert`}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-stellar transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {active ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : status === 'error' ? (
                  <button
                    onClick={() => handleAdd(asset.code, asset.issuer)}
                    className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full hover:bg-red-200 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Retry
                  </button>
                ) : (
                  <button
                    onClick={() => handleAdd(asset.code, asset.issuer)}
                    disabled={status === 'loading' || status === 'success'}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-stellar px-2.5 py-1 rounded-full hover:bg-stellar-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {status === 'loading' ? 'Adding…' : 'Add Trustline'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active trustlines from account */}
      {balances.filter(b => !b.isNative).length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            All Active Trustlines
          </p>
          <div className="space-y-2">
            {balances
              .filter(b => !b.isNative)
              .map(b => (
                <div
                  key={`${b.assetCode}-${b.assetIssuer}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-700">{b.assetCode}</span>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    {b.limit && (
                      <span>Limit: {parseFloat(b.limit).toLocaleString()}</span>
                    )}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
