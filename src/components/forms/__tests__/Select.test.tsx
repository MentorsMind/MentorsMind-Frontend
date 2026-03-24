import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' }
];

describe('Select', () => {
  it('renders with placeholder', () => {
    render(<Select options={options} placeholder="Choose option" />);
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects option', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<Select options={options} onChange={handleChange} />);
    
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Option 2'));
    
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('filters options when searchable', async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable />);
    
    await user.click(screen.getByRole('button'));
    const searchInput = screen.getByPlaceholderText('Search...');
    
    await user.type(searchInput, 'Option 2');
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
