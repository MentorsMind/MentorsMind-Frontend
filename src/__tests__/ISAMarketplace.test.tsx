import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ISAMarketplace from '../pages/ISAMarketplace';

vi.mock('../components/charts/LineChart', () => ({
  default: ({ title }: { title?: string }) => <div>{title}</div>,
}));

describe('ISAMarketplace', () => {
  it('renders learner ISA offers and explainer content', () => {
    render(<ISAMarketplace />);

    expect(screen.getByText('Income Share Agreements')).not.toBeNull();
    expect(screen.getByText('Choose an ISA that matches your current ramp')).not.toBeNull();
    expect(screen.getByText('How ISAs work')).not.toBeNull();
  });

  it('accepts an ISA in preview mode and switches to funder analytics', async () => {
    render(<ISAMarketplace />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Accept ISA' })[0]);

    expect(await screen.findByText(/Offer accepted in preview mode/i, {}, { timeout: 5000 })).not.toBeNull();
    expect(await screen.findByRole('button', { name: 'Accepted' }, { timeout: 5000 })).not.toBeNull();

    fireEvent.click(screen.getByText('Funder view'));

    expect(screen.getByText('Active ISAs')).not.toBeNull();
    expect(screen.getByText('Portfolio Earnings')).not.toBeNull();
  });
});
