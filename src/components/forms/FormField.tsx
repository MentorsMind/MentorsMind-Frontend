import React from 'react';
import { FieldError } from '../../types/forms.types';

type FormFieldProps = {
  label: string;
  name: string;
  error?: FieldError;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required,
  hint,
  children,
  className = ''
}) => {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500 mb-2">
          {hint}
        </p>
      )}

      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: name,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': [
                error ? errorId : null,
                hint ? hintId : null
              ].filter(Boolean).join(' ') || undefined,
              ...child.props
            } as any);
          }
          return child;
        })}
      </div>

      {error && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error.message}
        </p>
      )}
    </div>
  );
};
