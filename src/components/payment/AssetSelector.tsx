import type { AssetType } from '../../types';

const ASSETS: { value: AssetType; label: string; icon: string }[] = [
  { value: 'XLM',   label: 'Stellar Lumens', icon: '⭐' },
  { value: 'USDC',  label: 'USD Coin',        icon: '💵' },
  { value: 'PYUSD', label: 'PayPal USD',      icon: '🅿️' },
];

interface AssetSelectorProps {
  value: AssetType;
  onChange: (asset: AssetType) => void;
}

export default function AssetSelector({ value, onChange }: AssetSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ASSETS.map(a => (
        <button key={a.value} onClick={() => onChange(a.value)}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors
            ${value === a.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          <span className="text-xl">{a.icon}</span>
          <span>{a.value}</span>
          <span className="text-xs text-gray-400 font-normal">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
