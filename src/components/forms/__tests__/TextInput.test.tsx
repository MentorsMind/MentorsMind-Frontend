import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders with placeholder', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<TextInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styles', () => {
    render(<TextInput hasError />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
  });

  it('disables input when disabled prop is true', () => {
    render(<TextInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with left icon', () => {
    const icon = <span data-testid="left-icon">Icon</span>;
    render(<TextInput leftIcon={icon} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });
});
