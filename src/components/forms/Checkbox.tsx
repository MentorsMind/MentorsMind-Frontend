import React, { forwardRef } from 'react';

type CheckboxProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  name?: string;
  id?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, disabled, indeterminate, className = '', name, id }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className={`w-5 h-5 border-2 rounded transition-all ${
            checked || indeterminate
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300 peer-focus:ring-2 peer-focus:ring-blue-200'
          }`}>
            {checked && (
              <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {indeterminate && !checked && (
              <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h12" />
              </svg>
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

Checkbox.displayName = 'Checkbox';
