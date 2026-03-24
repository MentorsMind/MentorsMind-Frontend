import { describe, it, expect } from 'vitest';
import { validateField, emailPattern, phonePattern, urlPattern } from '../../../utils/validation.utils';

describe('validateField', () => {
  it('validates required field', () => {
    const error = validateField('', { required: 'This field is required' });
    expect(error?.message).toBe('This field is required');
  });

  it('validates minLength', () => {
    const error = validateField('ab', {
      minLength: { value: 3, message: 'Minimum 3 characters' }
    });
    expect(error?.message).toBe('Minimum 3 characters');
  });

  it('validates maxLength', () => {
    const error = validateField('abcdef', {
      maxLength: { value: 5, message: 'Maximum 5 characters' }
    });
    expect(error?.message).toBe('Maximum 5 characters');
  });

  it('validates pattern', () => {
    const error = validateField('invalid-email', { pattern: emailPattern });
    expect(error?.message).toBe('Invalid email address');
  });

  it('validates min value', () => {
    const error = validateField(5, {
      min: { value: 10, message: 'Minimum value is 10' }
    });
    expect(error?.message).toBe('Minimum value is 10');
  });

  it('validates max value', () => {
    const error = validateField(15, {
      max: { value: 10, message: 'Maximum value is 10' }
    });
    expect(error?.message).toBe('Maximum value is 10');
  });

  it('validates custom function', () => {
    const error = validateField('test', {
      validate: (value) => value === 'valid' || 'Value must be "valid"'
    });
    expect(error?.message).toBe('Value must be "valid"');
  });

  it('returns undefined for valid input', () => {
    const error = validateField('test@example.com', { pattern: emailPattern });
    expect(error).toBeUndefined();
  });
});

describe('validation patterns', () => {
  it('validates email pattern', () => {
    expect(emailPattern.value.test('test@example.com')).toBe(true);
    expect(emailPattern.value.test('invalid-email')).toBe(false);
  });

  it('validates phone pattern', () => {
    expect(phonePattern.value.test('123-456-7890')).toBe(true);
    expect(phonePattern.value.test('abc')).toBe(false);
  });

  it('validates URL pattern', () => {
    expect(urlPattern.value.test('https://example.com')).toBe(true);
    expect(urlPattern.value.test('not-a-url')).toBe(false);
  });
});
