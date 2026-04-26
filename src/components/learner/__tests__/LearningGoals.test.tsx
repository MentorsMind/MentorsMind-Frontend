import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LearningGoals } from '../LearningGoals';

describe('LearningGoals Component', () => {
  const mockProps = {
    goals: ['Stellar', 'Rust'],
    onChange: vi.fn(),
    suggestions: ['Smart Contracts', 'Web3'],
  };

  it('should render existing goals', () => {
    render(<LearningGoals {...mockProps} />);
    
    expect(screen.getByText('Stellar')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('should call onChange when a goal is removed', () => {
    const onChangeMock = vi.fn();
    render(<LearningGoals {...mockProps} onChange={onChangeMock} />);
    
    const removeButtons = screen.getAllByRole('button');
    // First two buttons are remove buttons for Stellar and Rust
    fireEvent.click(removeButtons[0]);
    
    expect(onChangeMock).toHaveBeenCalledWith(['Rust']);
  });

  it('should call onChange when a new goal is added', () => {
    const onChangeMock = vi.fn();
    render(<LearningGoals {...mockProps} onChange={onChangeMock} />);
    
    const input = screen.getByPlaceholderText(/add a learning goal/i);
    fireEvent.change(input, { target: { value: 'Blockchain' } });
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(onChangeMock).toHaveBeenCalledWith(['Stellar', 'Rust', 'Blockchain']);
  });

  it('should call onChange when a suggestion is clicked', () => {
    const onChangeMock = vi.fn();
    render(<LearningGoals {...mockProps} onChange={onChangeMock} />);
    
    const suggestionButton = screen.getByText('Smart Contracts');
    fireEvent.click(suggestionButton);
    
    expect(onChangeMock).toHaveBeenCalledWith(['Stellar', 'Rust', 'Smart Contracts']);
  });

  it('should add goal on Enter key', () => {
    const onChangeMock = vi.fn();
    render(<LearningGoals {...mockProps} onChange={onChangeMock} />);
    
    const input = screen.getByPlaceholderText(/add a learning goal/i);
    fireEvent.change(input, { target: { value: 'Blockchain' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(onChangeMock).toHaveBeenCalledWith(['Stellar', 'Rust', 'Blockchain']);
  });
});
