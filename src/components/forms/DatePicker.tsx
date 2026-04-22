interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
}

export default function DatePicker({ label, value, onChange, min, max, error, disabled }: DatePickerProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
