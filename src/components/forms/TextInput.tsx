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
      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
      : 'border-border focus:border-primary focus:ring-primary/20';
    const disabledClasses = disabled ? 'bg-surface cursor-not-allowed' : 'bg-background';
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
