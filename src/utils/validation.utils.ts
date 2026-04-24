export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isRequired = (v: string) => v.trim().length > 0;
export const minLength = (n: number) => (v: string) => v.length >= n;
export const maxLength = (n: number) => (v: string) => v.length <= n;
export const isUrl = (v: string) => { try { new URL(v); return true; } catch { return false; } };
export const isPositiveNumber = (v: string) => !isNaN(Number(v)) && Number(v) > 0;

export type Validator = (value: string) => string | undefined;

export const required = (msg = 'This field is required'): Validator =>
  (v) => isRequired(v) ? undefined : msg;

export const email = (msg = 'Invalid email address'): Validator =>
  (v) => !v || isEmail(v) ? undefined : msg;

export const min = (n: number, msg?: string): Validator =>
  (v) => minLength(n)(v) ? undefined : msg ?? `Minimum ${n} characters`;

export const max = (n: number, msg?: string): Validator =>
  (v) => maxLength(n)(v) ? undefined : msg ?? `Maximum ${n} characters`;

export const positiveNumber = (msg = 'Must be a positive number'): Validator =>
  (v) => !v || isPositiveNumber(v) ? undefined : msg;

export function validate(value: string, validators: Validator[]): string | undefined {
  for (const v of validators) {
    const err = v(value);
    if (err) return err;
  }
  return undefined;
}
