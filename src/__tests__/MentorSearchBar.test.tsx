import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MentorSearchBar from '../components/search/MentorSearchBar';

describe('MentorSearchBar Component', () => {
  const mockProps = {
    value: '',
    onChange: vi.fn(),
    suggestions: [],
    getSuggestions: vi.fn(),
  };

  it('should render search bar with placeholder', () => {
    render(<MentorSearchBar {...mockProps} />);
    
    const input = screen.getByPlaceholderText(/search mentors/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChangeMock = vi.fn();
    render(<MentorSearchBar {...mockProps} onChange={onChangeMock} />);
    
    const input = screen.getByPlaceholderText(/search mentors/i);
    fireEvent.change(input, { target: { value: 'React' } });
    
    expect(onChangeMock).toHaveBeenCalledWith('React');
  });

  it('should display and clear value', () => {
    const onChangeMock = vi.fn();
    render(<MentorSearchBar {...mockProps} value="Test" onChange={onChangeMock} />);
    
    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);
    
    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('should show suggestions when focused and suggestions available', () => {
    const suggestions = ['React Developer', 'Node.js Expert', 'Rust Developer'];
    render(
      <MentorSearchBar 
        {...mockProps} 
        value="React"
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByPlaceholderText(/search mentors/i);
    fireEvent.focus(input);
    
    suggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  it('should call onSearch when clicking search button', () => {
    const onSearchMock = vi.fn();
    render(
      <MentorSearchBar 
        {...mockProps} 
        value="Stellar"
        onSearch={onSearchMock}
      />
    );
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    expect(onSearchMock).toHaveBeenCalledWith('Stellar');
  });

  it('should call onSearch when pressing Enter', () => {
    const onSearchMock = vi.fn();
    render(
      <MentorSearchBar 
        {...mockProps} 
        value="Blockchain"
        onSearch={onSearchMock}
      />
    );
    
    const input = screen.getByPlaceholderText(/search mentors/i);
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSearchMock).toHaveBeenCalledWith('Blockchain');
  });

  it('should navigate suggestions with arrow keys', () => {
    const suggestions = ['React', 'Node.js'];
    const onChangeMock = vi.fn();
    render(
      <MentorSearchBar 
        {...mockProps} 
        value="Re"
        onChange={onChangeMock}
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByPlaceholderText(/search mentors/i);
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onChangeMock).toHaveBeenCalledWith('React');
  });
});
