import { useState, useCallback, useRef } from 'react';
import { FormState, FormFieldState, ValidationRule, FormConfig, SubmissionState } from '../types/forms.types';
import { validateField } from '../utils/validation.utils';

export const useForm = (config: FormConfig = {}) => {
  const [formState, setFormState] = useState<FormState>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const validationRules = useRef<Record<string, ValidationRule>>({});

  const register = useCallback((name: string, rules: ValidationRule = {}) => {
    validationRules.current[name] = rules;

    if (!formState[name]) {
      setFormState(prev => ({
        ...prev,
        [name]: { value: '', touched: false, dirty: false }
      }));
    }

    return {
      name,
      value: formState[name]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : e.target.value;
        
        handleChange(name, value);
      },
      onBlur: () => handleBlur(name)
    };
  }, [formState]);

  const handleChange = useCallback((name: string, value: any) => {
    setFormState(prev => {
      const field = prev[name] || { value: '', touched: false, dirty: false };
      const newField: FormFieldState = {
        ...field,
        value,
        dirty: true
      };

      if (config.mode === 'onChange' || (config.reValidateMode === 'onChange' && field.touched)) {
        const error = validateField(value, validationRules.current[name] || {});
        newField.error = error;
      }

      return { ...prev, [name]: newField };
    });
  }, [config.mode, config.reValidateMode]);

  const handleBlur = useCallback((name: string) => {
    setFormState(prev => {
      const field = prev[name];
      if (!field) return prev;

      const error = validateField(field.value, validationRules.current[name] || {});
      return {
        ...prev,
        [name]: { ...field, touched: true, error }
      };
    });
  }, []);

  const setValue = useCallback((name: string, value: any) => {
    handleChange(name, value);
  }, [handleChange]);

  const setError = useCallback((name: string, error: { type: string; message: string }) => {
    setFormState(prev => ({
      ...prev,
      [name]: { ...prev[name], error }
    }));
  }, []);

  const clearErrors = useCallback((name?: string) => {
    if (name) {
      setFormState(prev => ({
        ...prev,
        [name]: { ...prev[name], error: undefined }
      }));
    } else {
      setFormState(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = { ...newState[key], error: undefined };
        });
        return newState;
      });
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newState = { ...formState };

    Object.keys(validationRules.current).forEach(name => {
      const field = formState[name];
      const error = validateField(field?.value, validationRules.current[name]);
      
      if (error) {
        isValid = false;
        newState[name] = { ...field, error, touched: true };
      }
    });

    setFormState(newState);
    return isValid;
  }, [formState]);

  const handleSubmit = useCallback((onSubmit: (data: any) => Promise<void> | void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setSubmissionState('loading');
      
      try {
        const data = Object.keys(formState).reduce((acc, key) => {
          acc[key] = formState[key].value;
          return acc;
        }, {} as any);

        await onSubmit(data);
        setSubmissionState('success');
      } catch (error) {
        setSubmissionState('error');
        throw error;
      }
    };
  }, [formState, validateForm]);

  const reset = useCallback(() => {
    setFormState({});
    setSubmissionState('idle');
  }, []);

  const getFieldState = useCallback((name: string) => {
    return formState[name] || { value: '', touched: false, dirty: false };
  }, [formState]);

  return {
    register,
    handleSubmit,
    formState,
    submissionState,
    setSubmissionState,
    setValue,
    setError,
    clearErrors,
    reset,
    getFieldState,
    isValid: Object.values(formState).every(field => !field.error)
  };
};
