import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrustlineSetup from '../TrustlineSetup';
import type { AssetWithMeta } from '../../../hooks/useAssets';

const ASSET_NO_TRUSTLINE: AssetWithMeta = {
  code: 'PYUSD',
  name: 'PayPal USD',
  icon: '🅿️',
  balance: 0,
  priceInUSD: 1.0,
  priceChange24h: -0.02,
  volume24h: 320_000_000,
  trustlineEstablished: false,
  minBalance: 0.5,
  maxSendLimit: 25_000,
  issuer: 'GACVHHKJSXMBGMGKPF2XJMMFK5GQZCRNMGYW2JTQM6XQQYAPQBDQBKN',
};

const ASSET_WITH_TRUSTLINE: AssetWithMeta = {
  ...ASSET_NO_TRUSTLINE,
  trustlineEstablished: true,
};

describe('TrustlineSetup', () => {
  const mockOnSetup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows active trustline state when already established', () => {
    render(<TrustlineSetup asset={ASSET_WITH_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    expect(screen.getByText(/trustline active/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /establish trustline/i })).not.toBeInTheDocument();
  });

  it('shows setup UI when trustline is not established', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    expect(screen.getByText(/trustline required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /establish trustline/i })).toBeInTheDocument();
  });

  it('displays asset name and code', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    expect(screen.getByText('PayPal USD')).toBeInTheDocument();
    expect(screen.getByText('PYUSD')).toBeInTheDocument();
  });

  it('shows issuer address when provided', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    expect(screen.getByText(/GACVHHKJSXMBGMGKPF2XJMMFK5/i)).toBeInTheDocument();
  });

  it('calls onSetup with asset code when button clicked', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    fireEvent.click(screen.getByRole('button', { name: /establish trustline/i }));
    expect(mockOnSetup).toHaveBeenCalledWith('PYUSD');
  });

  it('shows loading state', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="loading" />);
    expect(screen.getByText(/setting up trustline/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows success state', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="success" />);
    expect(screen.getByText(/trustline established successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error state', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="error" />);
    expect(screen.getByText(/setup failed/i)).toBeInTheDocument();
    // Button should still be enabled to retry
    expect(screen.getByRole('button', { name: /establish trustline/i })).not.toBeDisabled();
  });

  it('shows stellar expert link when issuer is present', () => {
    render(<TrustlineSetup asset={ASSET_NO_TRUSTLINE} onSetup={mockOnSetup} status="idle" />);
    const link = screen.getByRole('link', { name: /view on stellar expert/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('stellar.expert'));
    expect(link).toHaveAttribute('target', '_blank');
  });
});
