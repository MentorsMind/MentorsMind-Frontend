import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders with placeholder', () => {
    render(<TextArea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<TextArea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styles', () => {
    render(<TextArea hasError />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-300');
  });

  it('disables textarea when disabled prop is true', () => {
    render(<TextArea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows character count when showCharCount is true', () => {
    render(<TextArea value="test" maxLength={100} showCharCount />);
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  it('respects maxLength', () => {
    render(<TextArea maxLength={10} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '10');
  });

  it('sets custom rows', () => {
    render(<TextArea rows={10} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '10');
  });
});
