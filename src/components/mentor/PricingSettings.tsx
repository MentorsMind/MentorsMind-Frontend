import { useState } from 'react';
import Button from '../ui/Button';
import { usePricingUpdate } from '../../hooks/queries/useMentors';

interface PricingSettingsProps {
  mentorId: string;
  initialRate: number;
  onRateChange: (rate: number) => void;
}

export default function PricingSettings({ mentorId, initialRate, onRateChange }: PricingSettingsProps) {
  const [input, setInput] = useState(String(initialRate));
  const [error, setError] = useState<string | null>(null);

  const { save, saving } = usePricingUpdate(mentorId, onRateChange);

  const handleSave = async () => {
    const parsed = parseFloat(input);
    if (!isFinite(parsed) || parsed <= 0) {
      setError('Enter a positive number greater than 0');
      return;
    }
    setError(null);

    const prev = initialRate;
    // Optimistic update
    onRateChange(parsed);

    await save(parsed, () => {
      // Rollback
      onRateChange(prev);
      setInput(String(prev));
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Pricing</h3>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Hourly Rate (USD)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. 25.50"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
        Learners will pay <strong>${input || '—'}/hr</strong>. Platform fee (5%) is deducted automatically.
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save Pricing'}
      </Button>
    </div>
  );
}
