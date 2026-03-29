import React from 'react';

interface HealthFactorProps {
  value: number | null;
  label?: string;
}

function getColor(hf: number): { bar: string; text: string; label: string } {
  if (hf >= 150) return { bar: 'bg-green-500', text: 'text-green-600', label: 'Healthy' };
  if (hf >= 120) return { bar: 'bg-yellow-400', text: 'text-yellow-600', label: 'At Risk' };
  return { bar: 'bg-red-500', text: 'text-red-600', label: 'Danger' };
}

const HealthFactor: React.FC<HealthFactorProps> = ({ value, label = 'Health Factor' }) => {
  if (value === null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
        {label}: —
      </div>
    );
  }

  const capped = Math.min(value, 300);
  const pct = (capped / 300) * 100;
  const { bar, text, label: statusLabel } = getColor(value);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold text-base ${text}`}>
          {isFinite(value) ? `${value.toFixed(0)}%` : '∞'} — {statusLabel}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0%</span>
        <span className="text-red-400">120%</span>
        <span className="text-yellow-500">150%</span>
        <span className="text-green-500">300%+</span>
      </div>
    </div>
  );
};

export default HealthFactor;
