import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletAddress } from '../WalletAddress';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
});

// Mock share API
Object.assign(navigator, {
  share: vi.fn(() => Promise.resolve())
});

describe('WalletAddress', () => {
  const mockPublicKey = 'GDJKL5JKLJKLJ5KLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5JKLJKL5J';
  const mockNickname = 'My Main Wallet';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wallet address correctly', () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    expect(screen.getByText('Receive Funds')).toBeInTheDocument();
    expect(screen.getByText(mockPublicKey)).toBeInTheDocument();
  });

  it('displays wallet nickname when provided', () => {
    render(<WalletAddress publicKey={mockPublicKey} nickname={mockNickname} />);
    
    expect(screen.getByText(mockNickname)).toBeInTheDocument();
  });

  it('renders QR code canvas', () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '200');
    expect(canvas).toHaveAttribute('height', '200');
  });

  it('copies address to clipboard when copy button is clicked', async () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    const copyButton = screen.getByText('Copy').closest('button')!;
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey);
    });
    
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('shows "Copied!" message temporarily after copying', async () => {
    vi.useFakeTimers();
    try {
      render(<WalletAddress publicKey={mockPublicKey} />);
      
      const copyButton = screen.getByText('Copy').closest('button')!;
      fireEvent.click(copyButton);
      
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('downloads QR code when download button is clicked', () => {
    render(<WalletAddress publicKey={mockPublicKey} nickname={mockNickname} />);
    
    // Mock createElement and click
    const mockLink = {
      click: vi.fn(),
      download: '',
      href: ''
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    
    const downloadButton = screen.getByText('Download').closest('button')!;
    fireEvent.click(downloadButton);
    
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain('stellar-wallet');
  });

  it('shows share button when navigator.share is available', () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('calls navigator.share when share button is clicked', async () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    const shareButton = screen.getByText('Share').closest('button')!;
    fireEvent.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'My Stellar Wallet Address',
      text: `Send Stellar assets to: ${mockPublicKey}`
    });
  });

  it('displays security warning message', () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    expect(screen.getByText(/Only send Stellar/)).toBeInTheDocument();
    expect(screen.getByText(/Sending other cryptocurrencies may result in permanent loss/)).toBeInTheDocument();
  });

  it('displays "Your Wallet Address" label', () => {
    render(<WalletAddress publicKey={mockPublicKey} />);
    
    expect(screen.getByText('Your Wallet Address')).toBeInTheDocument();
  });
});
