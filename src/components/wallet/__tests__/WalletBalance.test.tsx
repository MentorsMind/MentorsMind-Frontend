import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletBalance } from '../WalletBalance';
import type { ParsedBalance } from '../../../hooks/useHorizon';

describe('WalletBalance', () => {
  const mockBalances: ParsedBalance[] = [
    {
      assetCode: 'XLM',
      balance: '1000.5000000',
      isNative: true,
      usdValue: 0.12,
      totalUsd: 120.06,
      isAuthorized: true
    },
    {
      assetCode: 'USDC',
      balance: '500.00',
      assetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      isNative: false,
      usdValue: 1.0,
      totalUsd: 500.00,
      isAuthorized: true
    }
  ];

  const defaultProps = {
    balances: mockBalances,
    totalUsd: 620.06,
    availableXlm: 998.5,
    minimumReserve: 2.0,
    publicKey: 'GDJKL5JKLJKLJ5KLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5J',
    onRefresh: vi.fn(),
    loading: false,
    error: null
  };

  it('renders wallet balance correctly', () => {
    render(<WalletBalance {...defaultProps} />);
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText(/\$620\.06/)).toBeInTheDocument();
  });

  it('displays all asset balances', () => {
    render(<WalletBalance {...defaultProps} />);
    
    expect(screen.getAllByText('XLM').length).toBeGreaterThan(0);
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText(/1,000\.5/)).toBeInTheDocument();
    expect(screen.getAllByText(/500/)).toHaveLength(2);
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<WalletBalance {...defaultProps} onRefresh={onRefresh} />);
    
    const refreshButton = screen.getByLabelText('Refresh balances');
    fireEvent.click(refreshButton);
    
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on refresh button', () => {
    render(<WalletBalance {...defaultProps} loading={true} />);
    
    const refreshButton = screen.getByLabelText('Refresh balances');
    expect(refreshButton).toBeDisabled();
  });

  it('shows reserve warning when available XLM is low', () => {
    render(<WalletBalance {...defaultProps} availableXlm={1.5} />);
    expect(screen.getByText(/Low available XLM/)).toBeInTheDocument();
  });
});
