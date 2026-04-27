import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletBalance } from '../WalletBalance';
import type { WalletBalance as WalletBalanceType } from '../../../types/wallet.types';

describe('WalletBalance', () => {
  const mockBalances: WalletBalanceType[] = [
    {
      assetCode: 'XLM',
      balance: '1000.5000000',
      isNative: true
    },
    {
      assetCode: 'USDC',
      balance: '500.00',
      assetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      isNative: false
    }
  ];

  const defaultProps = {
    balances: mockBalances,
    publicKey: 'GDJKL5JKLJKLJ5KLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5J',
    onRefresh: vi.fn(),
    loading: false
  };

  it('renders wallet balance correctly', () => {
    render(<WalletBalance {...defaultProps} />);
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText(/^\$/)).toBeInTheDocument();
  });

  it('displays public key truncated', () => {
    render(<WalletBalance {...defaultProps} />);
    
    const publicKeyElement = screen.getByText(/GDJKL5JK.*JKLJKL5J/);
    expect(publicKeyElement).toBeInTheDocument();
  });

  it('displays all asset balances', () => {
    render(<WalletBalance {...defaultProps} />);
    
    expect(screen.getAllByText('XLM').length).toBeGreaterThan(0);
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<WalletBalance {...defaultProps} onRefresh={onRefresh} />);
    
    const refreshButton = screen.getByLabelText('Refresh balance');
    fireEvent.click(refreshButton);
    
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on refresh button', () => {
    render(<WalletBalance {...defaultProps} loading={true} />);
    
    const refreshButton = screen.getByLabelText('Refresh balance');
    expect(refreshButton).toBeDisabled();
  });

  it('shows "Show More" button when more than 3 assets', () => {
    const manyBalances: WalletBalanceType[] = [
      ...mockBalances,
      { assetCode: 'BTC', balance: '0.5', isNative: false },
      { assetCode: 'ETH', balance: '2.0', isNative: false },
      { assetCode: 'DOGE', balance: '1000', isNative: false }
    ];

    render(<WalletBalance {...defaultProps} balances={manyBalances} />);
    
    expect(screen.getByText(/Show \d+ More Assets/)).toBeInTheDocument();
  });

  it('expands to show all assets when "Show More" is clicked', () => {
    const manyBalances: WalletBalanceType[] = [
      ...mockBalances,
      { assetCode: 'BTC', balance: '0.5', isNative: false },
      { assetCode: 'ETH', balance: '2.0', isNative: false }
    ];

    render(<WalletBalance {...defaultProps} balances={manyBalances} />);
    
    const showMoreButton = screen.getByText(/Show \d+ More Assets/);
    fireEvent.click(showMoreButton);
    
    expect(screen.getAllByText('BTC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ETH').length).toBeGreaterThan(0);
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('displays Send and Receive buttons', () => {
    render(<WalletBalance {...defaultProps} />);
    
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  it('shows asset issuer for non-native assets', () => {
    render(<WalletBalance {...defaultProps} />);
    
    // USDC should show issuer
    const usdcElements = screen.getAllByText(/GA5ZSEJY/);
    expect(usdcElements.length).toBeGreaterThan(0);
  });
});
