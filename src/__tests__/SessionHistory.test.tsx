import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SessionHistory from '../pages/SessionHistory';

describe('SessionHistory', () => {
  it('renders session history page', () => {
    render(<SessionHistory />);
    expect(screen.getByText(/Your Learning/i)).toBeInTheDocument();
  });

  it('displays time invested metrics', () => {
    render(<SessionHistory />);
    expect(screen.getByText(/Time Invested/i)).toBeInTheDocument();
  });

  it('shows export report button', () => {
    render(<SessionHistory />);
    expect(screen.getByText(/Export Report/i)).toBeInTheDocument();
  });
});
