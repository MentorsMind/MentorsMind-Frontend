interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export default function Checkbox({ label, checked, onChange, disabled, error }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-text">{label}</span>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
