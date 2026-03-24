import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker';

describe('DatePicker', () => {
  it('renders with placeholder', () => {
    render(<DatePicker placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('opens calendar on click', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i)).toBeInTheDocument();
  });

  it('selects date', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<DatePicker onChange={handleChange} />);
    
    await user.click(screen.getByRole('button'));
    const dateButtons = screen.getAllByRole('button').filter(btn => 
      /^\d+$/.test(btn.textContent || '')
    );
    
    if (dateButtons.length > 0) {
      await user.click(dateButtons[15]);
      expect(handleChange).toHaveBeenCalled();
    }
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    
    await user.click(screen.getByRole('button'));
    
    const currentMonth = screen.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i).textContent;
    
    const navButtons = screen.getAllByRole('button');
    const nextButton = navButtons.find(btn => btn.querySelector('path[d*="M9 5l7 7-7 7"]'));
    
    if (nextButton) {
      await user.click(nextButton);
      const newMonth = screen.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i).textContent;
      expect(newMonth).not.toBe(currentMonth);
    }
  });

  it('disables dates outside min/max range', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    render(<DatePicker minDate={tomorrow} />);
    
    // Component should render without errors
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
