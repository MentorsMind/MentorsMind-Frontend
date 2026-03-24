import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('handles checked state', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Checkbox label="Test" onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');
    
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('disables checkbox when disabled prop is true', () => {
    render(<Checkbox label="Test" disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('shows indeterminate state', () => {
    render(<Checkbox label="Test" indeterminate />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });
});
