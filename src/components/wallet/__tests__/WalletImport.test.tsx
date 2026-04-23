import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletImport } from '../WalletImport';
import * as stellarUtils from '../../../utils/stellar.utils';
import { Keypair } from '@stellar/stellar-sdk';

// Mock the stellar utils
vi.mock('../../../utils/stellar.utils', () => ({
  validateMnemonic: vi.fn(),
  deriveKeypairFromMnemonic: vi.fn(),
}));

describe('WalletImport', () => {
  const mockOnImport = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default secret key method', () => {
    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Import Existing Wallet')).toBeInTheDocument();
    expect(screen.getAllByText(/Secret Key/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('S...')).toBeInTheDocument();
  });

  it('switches to mnemonic method when clicked', () => {
    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    const mnemonicButton = screen.getByText('Mnemonic Phrase').closest('button')!;
    fireEvent.click(mnemonicButton);
    
    expect(screen.getByPlaceholderText('Enter your 12 or 24 word mnemonic phrase...')).toBeInTheDocument();
  });

  it('validates secret key correctly', async () => {
    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    const textarea = screen.getByPlaceholderText('S...');
    fireEvent.change(textarea, { target: { value: 'invalid-key' } });
    
    const importButton = screen.getByText('Import Wallet');
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid secret key format/)).toBeInTheDocument();
    });
    expect(mockOnImport).not.toHaveBeenCalled();
  });

  it('calls onImport with secret key when valid', async () => {
    const validSecret = 'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    const textarea = screen.getByPlaceholderText('S...');
    fireEvent.change(textarea, { target: { value: validSecret } });
    
    const importButton = screen.getByText('Import Wallet');
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith(validSecret, undefined);
    });
  });

  it('calls onImport with derived key when mnemonic is valid', async () => {
    const validMnemonic = 'apple banana cherry date egg fish goat habit ice jacket kite lemon';
    const mockSecret = 'SBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
    const mockKeypair = { secret: () => mockSecret } as Keypair;

    vi.mocked(stellarUtils.validateMnemonic).mockReturnValue(true);
    vi.mocked(stellarUtils.deriveKeypairFromMnemonic).mockReturnValue(mockKeypair);

    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    // Switch to mnemonic
    const mnemonicButton = screen.getByText('Mnemonic Phrase').closest('button')!;
    fireEvent.click(mnemonicButton);
    
    const textarea = screen.getByPlaceholderText('Enter your 12 or 24 word mnemonic phrase...');
    fireEvent.change(textarea, { target: { value: validMnemonic } });
    
    const importButton = screen.getByText('Import Wallet');
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(stellarUtils.validateMnemonic).toHaveBeenCalledWith(validMnemonic);
      expect(stellarUtils.deriveKeypairFromMnemonic).toHaveBeenCalledWith(validMnemonic);
      expect(mockOnImport).toHaveBeenCalledWith(mockSecret, undefined);
    });
  });

  it('shows error when mnemonic is invalid', async () => {
    const invalidMnemonic = 'invalid mnemonic phrase';
    vi.mocked(stellarUtils.validateMnemonic).mockReturnValue(false);

    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    // Switch to mnemonic
    const mnemonicButton = screen.getByText('Mnemonic Phrase').closest('button')!;
    fireEvent.click(mnemonicButton);
    
    const textarea = screen.getByPlaceholderText('Enter your 12 or 24 word mnemonic phrase...');
    fireEvent.change(textarea, { target: { value: invalidMnemonic } });
    
    const importButton = screen.getByText('Import Wallet');
    fireEvent.click(importButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid mnemonic phrase/)).toBeInTheDocument();
    });
    expect(mockOnImport).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<WalletImport onImport={mockOnImport} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
