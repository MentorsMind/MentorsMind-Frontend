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
      ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
      : 'border-border focus:border-primary focus:ring-primary/20';
    const disabledClasses = disabled ? 'bg-surface cursor-not-allowed' : 'bg-background';

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
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
