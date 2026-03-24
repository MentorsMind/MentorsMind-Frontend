import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioButton, RadioGroup } from '../RadioButton';

describe('RadioButton', () => {
  it('renders with label', () => {
    render(<RadioButton name="test" value="1" label="Option 1" />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<RadioButton name="test" value="1" label="Option 1" onChange={handleChange} />);
    
    await user.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('disables radio when disabled prop is true', () => {
    render(<RadioButton name="test" value="1" label="Option 1" disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('shows checked state', () => {
    render(<RadioButton name="test" value="1" label="Option 1" checked />);
    expect(screen.getByRole('radio')).toBeChecked();
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ];

  it('renders all options', () => {
    render(<RadioGroup name="test" options={options} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles selection change', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(<RadioGroup name="test" options={options} onChange={handleChange} />);
    
    await user.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('2');
  });

  it('renders horizontally when orientation is horizontal', () => {
    const { container } = render(
      <RadioGroup name="test" options={options} orientation="horizontal" />
    );
    
    const group = container.querySelector('[role="radiogroup"]');
    expect(group).toHaveClass('flex-row');
  });

  it('renders vertically by default', () => {
    const { container } = render(
      <RadioGroup name="test" options={options} />
    );
    
    const group = container.querySelector('[role="radiogroup"]');
    expect(group).toHaveClass('flex-col');
  });
});
