import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetSelector from '../AssetSelector';
import type { AssetWithMeta } from '../../../hooks/useAssets';

const MOCK_ASSETS: AssetWithMeta[] = [
  {
    code: 'XLM',
    name: 'Lumen',
    icon: '🚀',
    balance: 450.25,
    priceInUSD: 0.12,
    priceChange24h: 3.4,
    volume24h: 48_200_000,
    trustlineEstablished: true,
    minBalance: 1,
    maxSendLimit: 10_000,
  },
  {
    code: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    balance: 125.5,
    priceInUSD: 1.0,
    priceChange24h: 0.01,
    volume24h: 2_100_000_000,
    trustlineEstablished: true,
    minBalance: 0.5,
    maxSendLimit: 50_000,
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
  {
    code: 'PYUSD',
    name: 'PayPal USD',
    icon: '🅿️',
    balance: 85.0,
    priceInUSD: 1.0,
    priceChange24h: -0.02,
    volume24h: 320_000_000,
    trustlineEstablished: false,
    minBalance: 0.5,
    maxSendLimit: 25_000,
    issuer: 'GACVHHKJSXMBGMGKPF2XJMMFK5GQZCRNMGYW2JTQM6XQQYAPQBDQBKN',
  },
];

describe('AssetSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSelector = (overrides = {}) =>
    render(
      <AssetSelector
        assets={MOCK_ASSETS}
        selectedAsset="XLM"
        onSelect={mockOnSelect}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        {...overrides}
      />
    );

  it('renders the selected asset trigger button', () => {
    renderSelector();
    expect(screen.getByRole('button', { name: /selected asset: lumen/i })).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all assets in dropdown', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onSelect when an asset is clicked', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]); // USDC
    expect(mockOnSelect).toHaveBeenCalledWith('USDC');
  });

  it('closes dropdown after selection', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows search input when dropdown is open', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    expect(screen.getByPlaceholderText(/search assets/i)).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    fireEvent.change(screen.getByPlaceholderText(/search assets/i), {
      target: { value: 'USD' },
    });
    expect(mockOnSearchChange).toHaveBeenCalledWith('USD');
  });

  it('shows "No trustline" badge for assets without trustline', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    expect(screen.getByText(/no trustline/i)).toBeInTheDocument();
  });

  it('marks the currently selected asset with aria-selected', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', { name: /selected asset: lumen/i }));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('is disabled when disabled prop is true', () => {
    renderSelector({ disabled: true });
    expect(screen.getByRole('button', { name: /selected asset: lumen/i })).toBeDisabled();
  });

  it('shows empty state when no assets match', () => {
    renderSelector({ assets: [] });
    fireEvent.click(screen.getByRole('button', { name: /selected asset/i }));
    expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
  });
});
