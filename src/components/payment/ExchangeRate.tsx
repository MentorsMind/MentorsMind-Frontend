import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import type { StellarAssetCode } from '../../types/payment.types';
import type { AssetWithMeta } from '../../hooks/useAssets';

interface ExchangeRateProps {
  assets: AssetWithMeta[];
  fromAsset: StellarAssetCode;
  toAsset: StellarAssetCode;
  amount: number;
  currencySymbol?: string;
  getConversionPreview: (from: StellarAssetCode, to: StellarAssetCode, amount: number) => number;
}

const ExchangeRate: React.FC<ExchangeRateProps> = ({
  assets,
  fromAsset,
  toAsset,
  amount,
  currencySymbol = '$',
  getConversionPreview,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const from = assets.find(a => a.code === fromAsset);
  const to = assets.find(a => a.code === toAsset);

  const convertedAmount = getConversionPreview(fromAsset, toAsset, amount);
  const rate = amount > 0 ? convertedAmount / amount : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!from || !to) return null;

  const isSameAsset = fromAsset === toAsset;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Exchange Rate</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh exchange rate"
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Rate display */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{from.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-900">1 {from.code}</p>
            <p className="text-[10px] text-gray-400">{currencySymbol}{from.priceInUSD.toFixed(4)}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <ArrowRight className="w-4 h-4 text-gray-300" />
          {!isSameAsset && (
            <span className="text-[9px] text-gray-400 font-medium">
              {isSameAsset ? '1:1' : `${rate.toFixed(4)}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {isSameAsset ? '1' : rate.toFixed(4)} {to.code}
            </p>
            <p className="text-[10px] text-gray-400">{currencySymbol}{to.priceInUSD.toFixed(4)}</p>
          </div>
          <span className="text-lg">{to.icon}</span>
        </div>
      </div>

      {/* Conversion preview */}
      {amount > 0 && (
        <div className="rounded-xl bg-stellar/5 border border-stellar/10 px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">Conversion preview</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {from.code}
            </span>
            <ArrowRight className="w-4 h-4 text-stellar" />
            <span className="text-sm font-bold text-stellar">
              {isSameAsset
                ? `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${to.code}`
                : `${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${to.code}`}
            </span>
          </div>
        </div>
      )}

      {/* Last updated */}
      <p className="text-[10px] text-gray-400 text-right">
        Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default ExchangeRate;
