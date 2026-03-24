import React, { forwardRef } from 'react';

type TextInputProps = {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ 
    type = 'text',
    placeholder,
    disabled,
    readOnly,
    className = '',
    hasError,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2';
    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${iconPadding} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
