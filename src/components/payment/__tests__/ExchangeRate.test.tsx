import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExchangeRate from '../ExchangeRate';
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
];

describe('ExchangeRate', () => {
  const mockGetConversionPreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConversionPreview.mockImplementation(
      (_from: string, _to: string, amount: number) => amount * 8.33 // XLM -> USDC mock rate
    );
  });

  const renderRate = (overrides = {}) =>
    render(
      <ExchangeRate
        assets={MOCK_ASSETS}
        fromAsset="XLM"
        toAsset="USDC"
        amount={100}
        getConversionPreview={mockGetConversionPreview}
        {...overrides}
      />
    );

  it('renders exchange rate section', () => {
    renderRate();
    expect(screen.getByText(/exchange rate/i)).toBeInTheDocument();
  });

  it('displays from and to asset codes', () => {
    renderRate();
    expect(screen.getByText(/1\s*XLM/)).toBeInTheDocument();
    expect(screen.getAllByText(/USDC/).length).toBeGreaterThan(0);
  });

  it('shows conversion preview when amount > 0', () => {
    renderRate();
    expect(screen.getByText(/conversion preview/i)).toBeInTheDocument();
    expect(screen.getByText(/100.*XLM/i)).toBeInTheDocument();
  });

  it('does not show conversion preview when amount is 0', () => {
    renderRate({ amount: 0 });
    expect(screen.queryByText(/conversion preview/i)).not.toBeInTheDocument();
  });

  it('calls getConversionPreview with correct args', () => {
    renderRate();
    expect(mockGetConversionPreview).toHaveBeenCalledWith('XLM', 'USDC', 100);
  });

  it('shows refresh button', () => {
    renderRate();
    expect(screen.getByRole('button', { name: /refresh exchange rate/i })).toBeInTheDocument();
  });

  it('refresh button triggers re-render without error', async () => {
    renderRate();
    const refreshBtn = screen.getByRole('button', { name: /refresh exchange rate/i });
    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(screen.getByText(/updated/i)).toBeInTheDocument();
    });
  });

  it('shows last updated time', () => {
    renderRate();
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });

  it('renders nothing when assets are not found', () => {
    const { container } = render(
      <ExchangeRate
        assets={[]}
        fromAsset="XLM"
        toAsset="USDC"
        amount={100}
        getConversionPreview={mockGetConversionPreview}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
