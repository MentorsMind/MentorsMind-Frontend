import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { StellarAssetCode } from '../../types/payment.types';
import type { AssetWithMeta } from '../../hooks/useAssets';

interface AssetSelectorProps {
  assets: AssetWithMeta[];
  selectedAsset: StellarAssetCode;
  onSelect: (code: StellarAssetCode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currencySymbol?: string;
  getConvertedValue?: (usd: number) => number;
  disabled?: boolean;
}

const PriceChangeIndicator: React.FC<{ change: number }> = ({ change }) => {
  if (Math.abs(change) < 0.05) {
    return (
      <span className="flex items-center gap-0.5 text-gray-400 text-[10px] font-medium">
        <Minus className="w-3 h-3" />
        0.00%
      </span>
    );
  }
  const positive = change > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-semibold ${
        positive ? 'text-emerald-600' : 'text-red-500'
      }`}
    >
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
};

const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAsset,
  onSelect,
  searchQuery,
  onSearchChange,
  currencySymbol = '$',
  getConvertedValue = (v) => v,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = assets.find(a => a.code === selectedAsset) ?? assets[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (code: StellarAssetCode) => {
    onSelect(code);
    setOpen(false);
    onSearchChange('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Selected asset: ${selected?.name ?? 'None'}`}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 bg-white text-left ${
          open
            ? 'border-stellar ring-2 ring-stellar/20'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100">
            {selected?.icon}
          </span>
          <div>
            <p className="font-bold text-gray-900 text-sm">{selected?.name}</p>
            <p className="text-xs text-gray-500">{selected?.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected && <PriceChangeIndicator change={selected.priceChange24h} />}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select asset"
          className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search assets..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                aria-label="Search assets"
              />
            </div>
          </div>

          {/* Asset list */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {assets.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">No assets found</li>
            ) : (
              assets.map(asset => {
                const isSelected = asset.code === selectedAsset;
                const balanceUSD = asset.balance * asset.priceInUSD;
                return (
                  <li key={asset.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(asset.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors duration-150 text-left ${
                        isSelected
                          ? 'bg-stellar/5 text-stellar'
                          : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
                          {asset.icon}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{asset.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{asset.code}</span>
                            {!asset.trustlineEstablished && (
                              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                No Trustline
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-0.5">
                        <p className="text-sm font-bold">
                          {asset.balance.toLocaleString()} {asset.code}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {currencySymbol}{getConvertedValue(balanceUSD).toFixed(2)}
                        </p>
                        <PriceChangeIndicator change={asset.priceChange24h} />
                      </div>
                      {isSelected && <Check className="w-4 h-4 ml-2 text-stellar shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssetSelector;
