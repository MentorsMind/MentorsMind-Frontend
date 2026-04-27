import { useState, useCallback } from 'react';
import { validate, type Validator } from '../utils/validation.utils';

type Rules<T> = Partial<Record<keyof T, Validator[]>>;
type Errors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, string>>(initial: T, rules: Rules<T> = {}) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (rules[field]) {
      const err = validate(value, rules[field]!);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  }, [rules]);

  const handleChange = useCallback((field: keyof T) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValue(field, e.target.value), [setValue]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (rules[field]) {
      const err = validate(values[field], rules[field]!);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  }, [rules, values]);

  const validateAll = useCallback(() => {
    const newErrors: Errors<T> = {};
    let valid = true;
    for (const field of Object.keys(rules) as (keyof T)[]) {
      const err = validate(values[field] ?? '', rules[field]!);
      if (err) { newErrors[field] = err; valid = false; }
    }
    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(rules).map(k => [k, true])) as Partial<Record<keyof T, boolean>>);
    return valid;
  }, [rules, values]);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  return { values, errors, touched, setValue, handleChange, handleBlur, validateAll, reset };
}
