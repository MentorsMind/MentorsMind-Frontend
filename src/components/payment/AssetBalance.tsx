import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { AssetWithMeta } from '../../hooks/useAssets';

interface AssetBalanceProps {
  asset: AssetWithMeta;
  currencySymbol?: string;
  convertedValue?: number;
  showLimits?: boolean;
}

const AssetBalance: React.FC<AssetBalanceProps> = ({
  asset,
  currencySymbol = '$',
  convertedValue,
  showLimits = false,
}) => {
  const balanceUSD = asset.balance * asset.priceInUSD;
  const displayValue = convertedValue ?? balanceUSD;
  const isLow = asset.balance < asset.minBalance * 2;

  const PriceIcon =
    Math.abs(asset.priceChange24h) < 0.05
      ? Minus
      : asset.priceChange24h > 0
      ? TrendingUp
      : TrendingDown;

  const priceColor =
    Math.abs(asset.priceChange24h) < 0.05
      ? 'text-gray-400'
      : asset.priceChange24h > 0
      ? 'text-emerald-600'
      : 'text-red-500';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100">
            {asset.icon}
          </span>
          <div>
            <p className="font-bold text-gray-900 text-sm">{asset.name}</p>
            <p className="text-xs text-gray-500">{asset.code}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">
            {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.code}
          </p>
          <p className="text-xs text-gray-500">
            {currencySymbol}{displayValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          Price: {currencySymbol}{asset.priceInUSD.toFixed(4)}
        </span>
        <span className={`flex items-center gap-1 font-semibold ${priceColor}`}>
          <PriceIcon className="w-3 h-3" />
          {asset.priceChange24h > 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}% (24h)
        </span>
      </div>

      {/* Low balance warning */}
      {isLow && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            Low balance — minimum required: {asset.minBalance} {asset.code}
          </p>
        </div>
      )}

      {/* Transaction limits */}
      {showLimits && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Min Send</p>
            <p className="text-xs font-semibold text-gray-700">
              {asset.minBalance} {asset.code}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Max Send</p>
            <p className="text-xs font-semibold text-gray-700">
              {asset.maxSendLimit.toLocaleString()} {asset.code}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetBalance;
