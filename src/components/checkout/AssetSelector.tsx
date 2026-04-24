import type { StellarAssetCode } from '../../types/payment.types';

const ASSETS: { code: StellarAssetCode; name: string; icon: string }[] = [
  { code: 'XLM',   name: 'Stellar Lumens', icon: '🚀' },
  { code: 'USDC',  name: 'USD Coin',       icon: '💵' },
  { code: 'PYUSD', name: 'PayPal USD',     icon: '🅿️' },
];

interface Props {
  selected: StellarAssetCode;
  onChange: (asset: StellarAssetCode) => void;
  disabled?: boolean;
}

export default function AssetSelector({ selected, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ASSETS.map(a => (
        <button
          key={a.code}
          onClick={() => onChange(a.code)}
          disabled={disabled}
          aria-pressed={selected === a.code}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
            ${selected === a.code
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span>{a.icon}</span>
          <span>{a.code}</span>
        </button>
      ))}
    </div>
  );
}
