import { ValidationRule, FieldError } from '../types/forms.types';

export const validateField = (value: any, rules: ValidationRule): FieldError | undefined => {
  if (rules.required) {
    const isEmpty = value === undefined || value === null || value === '' || 
                    (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      return {
        type: 'required',
        message: typeof rules.required === 'string' ? rules.required : 'This field is required'
      };
    }
  }

  if (rules.minLength && typeof value === 'string') {
    if (value.length < rules.minLength.value) {
      return { type: 'minLength', message: rules.minLength.message };
    }
  }

  if (rules.maxLength && typeof value === 'string') {
    if (value.length > rules.maxLength.value) {
      return { type: 'maxLength', message: rules.maxLength.message };
    }
  }

  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.value.test(value)) {
      return { type: 'pattern', message: rules.pattern.message };
    }
  }

  if (rules.min !== undefined && typeof value === 'number') {
    if (value < rules.min.value) {
      return { type: 'min', message: rules.min.message };
    }
  }

  if (rules.max !== undefined && typeof value === 'number') {
    if (value > rules.max.value) {
      return { type: 'max', message: rules.max.message };
    }
  }

  if (rules.validate) {
    const result = rules.validate(value);
    if (result !== true) {
      return {
        type: 'validate',
        message: typeof result === 'string' ? result : 'Validation failed'
      };
    }
  }

  return undefined;
};

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'Invalid email address'
};

export const phonePattern = {
  value: /^[\d\s\-\+\(\)]+$/,
  message: 'Invalid phone number'
};

export const urlPattern = {
  value: /^https?:\/\/.+/,
  message: 'Invalid URL'
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
