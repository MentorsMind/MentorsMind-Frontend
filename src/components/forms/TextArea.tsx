import React, { forwardRef } from 'react';

type TextAreaProps = {
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  hasError?: boolean;
  showCharCount?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    placeholder,
    disabled,
    readOnly,
    rows = 4,
    maxLength,
    className = '',
    hasError,
    showCharCount = false,
    value,
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 resize-y';
    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
