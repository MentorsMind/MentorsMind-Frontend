import React, { forwardRef } from 'react';

type RadioButtonProps = {
  label?: string;
  value: string | number;
  checked?: boolean;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  name: string;
  className?: string;
  id?: string;
};

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, value, checked, onChange, disabled, name, className = '', id }, ref) => {
    const handleChange = () => {
      if (!disabled) {
        onChange?.(value);
      }
    };

    return (
      <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className={`w-5 h-5 border-2 rounded-full transition-all ${
            checked
              ? 'border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-200'
              : 'border-gray-300 peer-focus:ring-2 peer-focus:ring-blue-200'
          }`}>
            {checked && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full" />
            )}
          </div>
        </div>
        {label && (
          <span className="ml-2 text-sm text-gray-700 select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';

type RadioGroupProps = {
  name: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  className = ''
}) => {
  return (
    <div 
      role="radiogroup"
      className={`flex ${orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'} ${className}`}
    >
      {options.map((option) => (
        <RadioButton
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          onChange={onChange}
          disabled={option.disabled}
        />
      ))}
    </div>
  );
};
