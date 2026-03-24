import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';

describe('FormField', () => {
  it('renders label and input', () => {
    render(
      <FormField label="Email" name="email">
        <TextInput />
      </FormField>
    );
    
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays required indicator', () => {
    render(
      <FormField label="Email" name="email" required>
        <TextInput />
      </FormField>
    );
    
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const error = { type: 'required', message: 'This field is required' };
    
    render(
      <FormField label="Email" name="email" error={error}>
        <TextInput />
      </FormField>
    );
    
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('displays hint text', () => {
    render(
      <FormField label="Email" name="email" hint="Enter your email address">
        <TextInput />
      </FormField>
    );
    
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('sets aria-invalid when error exists', () => {
    const error = { type: 'required', message: 'Required' };
    
    render(
      <FormField label="Email" name="email" error={error}>
        <TextInput />
      </FormField>
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
