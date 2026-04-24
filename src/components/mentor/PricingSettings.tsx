import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../forms/Select';
import Button from '../ui/Button';
import type { AssetType } from '../../types';

const ASSETS = [
  { value: 'XLM', label: 'XLM - Stellar Lumens' },
  { value: 'USDC', label: 'USDC - USD Coin' },
  { value: 'PYUSD', label: 'PYUSD - PayPal USD' },
];

export default function PricingSettings() {
  const [rate, setRate] = useState('100');
  const [asset, setAsset] = useState<AssetType>('USDC');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Pricing</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Hourly Rate" type="number" value={rate} onChange={e => setRate(e.target.value)} />
        <Select label="Currency" options={ASSETS} value={asset} onChange={v => setAsset(v as AssetType)} />
      </div>
      <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
        Learners will pay <strong>{rate} {asset}</strong>/hour. Platform fee (5%) is deducted automatically.
      </div>
      <Button onClick={save}>{saved ? '✓ Saved' : 'Save Pricing'}</Button>
    </div>
  );
}
