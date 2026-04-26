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
      {label && <label className="block text-sm font-medium text-text">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary transition-colors
          ${error ? 'border-destructive' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
