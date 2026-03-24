import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../../hooks/useForm';

describe('useForm', () => {
  it('registers field', () => {
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.register('email', { required: true });
    });
    
    expect(result.current.formState.email).toBeDefined();
  });

  it('validates required field', () => {
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.register('email', { required: 'Email is required' });
    });
    
    act(() => {
      result.current.setValue('email', '');
    });
    
    act(() => {
      result.current.handleSubmit(() => {})({ preventDefault: vi.fn() } as any);
    });
    
    expect(result.current.formState.email?.error?.message).toBe('Email is required');
  });

  it('sets field value', () => {
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.register('email');
      result.current.setValue('email', 'test@example.com');
    });
    
    expect(result.current.formState.email?.value).toBe('test@example.com');
  });

  it('clears errors', () => {
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.register('email');
      result.current.setError('email', { type: 'required', message: 'Required' });
    });
    
    expect(result.current.formState.email?.error).toBeDefined();
    
    act(() => {
      result.current.clearErrors('email');
    });
    
    expect(result.current.formState.email?.error).toBeUndefined();
  });

  it('resets form', () => {
    const { result } = renderHook(() => useForm());
    
    act(() => {
      result.current.register('email');
      result.current.setValue('email', 'test@example.com');
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.formState).toEqual({});
  });
});
