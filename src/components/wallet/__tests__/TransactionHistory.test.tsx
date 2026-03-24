import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionHistory } from '../TransactionHistory';
import type { Transaction } from '../../../types/wallet.types';

describe('TransactionHistory', () => {
  const walletAddress = 'GDJKL5JKLJKLJ5KLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5J';
  
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      hash: 'abc123def456',
      type: 'payment',
      amount: '100.5000000',
      assetCode: 'XLM',
      from: 'GSENDER123456789',
      to: walletAddress,
      timestamp: new Date('2024-03-20'),
      status: 'completed',
      fee: '0.00001'
    },
    {
      id: 'tx-2',
      hash: 'def789ghi012',
      type: 'payment',
      amount: '50.0000000',
      assetCode: 'XLM',
      from: walletAddress,
      to: 'GRECIPIENT987654321',
      memo: 'Payment for services',
      timestamp: new Date('2024-03-19'),
      status: 'completed',
      fee: '0.00001'
    },
    {
      id: 'tx-3',
      hash: 'ghi345jkl678',
      type: 'payment',
      amount: '25.0000000',
      assetCode: 'XLM',
      from: walletAddress,
      to: 'GRECIPIENT111222333',
      timestamp: new Date('2024-03-18'),
      status: 'pending',
      fee: '0.00001'
    }
  ];

  const defaultProps = {
    transactions: mockTransactions,
    walletAddress,
    loading: false
  };

  it('renders transaction history correctly', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('displays all filter buttons', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('displays all transactions by default', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    expect(screen.getByText(/Received XLM/)).toBeInTheDocument();
    expect(screen.getAllByText(/Sent XLM/).length).toBe(2);
  });

  it('filters sent transactions', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    const sentButton = screen.getByText('Sent');
    fireEvent.click(sentButton);
    
    expect(screen.getAllByText(/Sent XLM/).length).toBe(2);
    expect(screen.queryByText(/Received XLM/)).not.toBeInTheDocument();
  });

  it('filters received transactions', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    const receivedButton = screen.getByText('Received');
    fireEvent.click(receivedButton);
    
    expect(screen.getByText(/Received XLM/)).toBeInTheDocument();
    expect(screen.queryByText(/Sent XLM/)).not.toBeInTheDocument();
  });

  it('displays transaction amounts with correct sign', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    // Received should have +
    expect(screen.getByText(/\+100\.5000000 XLM/)).toBeInTheDocument();
    
    // Sent should have -
    expect(screen.getByText(/-50\.0000000 XLM/)).toBeInTheDocument();
  });

  it('displays transaction status badges', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    expect(screen.getAllByText('Completed').length).toBe(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays memo when present', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    expect(screen.getByText(/Memo: Payment for services/)).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    render(<TransactionHistory {...defaultProps} transactions={[]} />);
    
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Your transaction history will appear here')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TransactionHistory {...defaultProps} transactions={[]} loading={true} />);
    
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('opens transaction details modal on click', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    const firstTransaction = screen.getByText(/Received XLM/);
    fireEvent.click(firstTransaction.closest('div[class*="cursor-pointer"]')!);
    
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
  });

  it('closes transaction details modal', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    // Open modal
    const firstTransaction = screen.getByText(/Received XLM/);
    fireEvent.click(firstTransaction.closest('div[class*="cursor-pointer"]')!);
    
    // Close modal
    const closeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    );
    fireEvent.click(closeButton!);
    
    expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument();
  });

  it('displays "Load More" button when hasMore is true', () => {
    const onLoadMore = vi.fn();
    render(<TransactionHistory {...defaultProps} hasMore={true} onLoadMore={onLoadMore} />);
    
    expect(screen.getByText('Load More')).toBeInTheDocument();
  });

  it('calls onLoadMore when "Load More" is clicked', () => {
    const onLoadMore = vi.fn();
    render(<TransactionHistory {...defaultProps} hasMore={true} onLoadMore={onLoadMore} />);
    
    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);
    
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('displays truncated addresses', () => {
    render(<TransactionHistory {...defaultProps} />);
    
    // Should show truncated sender address
    expect(screen.getByText(/From: GSENDER12\.\.\.456789/)).toBeInTheDocument();
  });
});
