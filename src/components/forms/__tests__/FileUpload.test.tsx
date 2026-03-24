import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '../FileUpload';

describe('FileUpload', () => {
  it('renders upload area', () => {
    render(<FileUpload />);
    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    render(<FileUpload onChange={handleChange} />);
    
    const input = screen.getByLabelText('File upload');
    await user.upload(input, file);
    
    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.txt', { 
      type: 'text/plain' 
    });
    
    render(<FileUpload config={{ maxSize: 1024 }} />);
    
    const input = screen.getByLabelText('File upload');
    await user.upload(input, largeFile);
    
    expect(screen.getByText(/exceeds maximum size/i)).toBeInTheDocument();
  });

  it('validates file type', async () => {
    const user = userEvent.setup();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    render(<FileUpload config={{ acceptedTypes: ['image/*'] }} />);
    
    const input = screen.getByLabelText('File upload');
    await user.upload(input, file);
    
    expect(screen.getByText(/not an accepted file type/i)).toBeInTheDocument();
  });

  it('allows multiple files when multiple prop is true', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const files = [
      new File(['content1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content2'], 'test2.txt', { type: 'text/plain' })
    ];
    
    render(<FileUpload multiple onChange={handleChange} />);
    
    const input = screen.getByLabelText('File upload');
    await user.upload(input, files);
    
    expect(handleChange).toHaveBeenCalledWith(files);
  });

  it('removes file when remove button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    render(<FileUpload onChange={handleChange} />);
    
    const input = screen.getByLabelText('File upload');
    await user.upload(input, file);
    
    const removeButton = screen.getByLabelText('Remove test.txt');
    await user.click(removeButton);
    
    expect(handleChange).toHaveBeenLastCalledWith([]);
  });
});
