import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentModal from '../PaymentModal';
import type { PaymentDetails } from '../../../types/payment.types';

const mockDetails: PaymentDetails = {
  mentorId: 'm1',
  mentorName: 'Dr. Sarah Chen',
  sessionId: 's1',
  sessionTopic: 'Soroban Smart Contracts Deep Dive',
  amount: 10,
};

describe('PaymentModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <PaymentModal isOpen={false} onClose={() => {}} details={mockDetails} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders asset selection when opened', () => {
    render(<PaymentModal isOpen={true} onClose={() => {}} details={mockDetails} />);
    expect(screen.getByText('Select Asset')).toBeDefined();
    expect(screen.getByText('Lumen')).toBeDefined();
    expect(screen.getByText('USD Coin')).toBeDefined();
  });

  it('navigates to review step after selecting asset', () => {
    render(<PaymentModal isOpen={true} onClose={() => {}} details={mockDetails} />);
    fireEvent.click(screen.getByText('Lumen'));
    expect(screen.getByText('Review Payment')).toBeDefined();
    expect(screen.getByText('Mentor Fee')).toBeDefined();
  });

  it('transitions to processing then success', async () => {
    // Mock Math.random to always succeed (fail rate is 0.1)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    render(<PaymentModal isOpen={true} onClose={() => {}} details={mockDetails} />);
    
    // Select asset
    fireEvent.click(screen.getByText('Lumen'));
    
    // Click pay (wait for it to appear just in case)
    const payButton = await screen.findByText(/Confirm & Pay/);
    fireEvent.click(payButton);
    
    // Check processing state
    expect(await screen.findByText('Processing Payment')).toBeDefined();
    
    // Wait for success (2.5s delay in hook)
    const successTitle = await screen.findByText('Payment Successful', {}, { timeout: 5000 });
    expect(successTitle).toBeDefined();
    expect(screen.getByText('Download Receipt (PDF)')).toBeDefined();
    
    randomSpy.mockRestore();
  });

  it('shows error state when transaction fails', async () => {
    // Mock Math.random to always fail
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05);
    
    render(<PaymentModal isOpen={true} onClose={() => {}} details={mockDetails} />);
    
    fireEvent.click(screen.getByText('Lumen'));
    const payButton = await screen.findByText(/Confirm & Pay/);
    fireEvent.click(payButton);
    
    const failTitle = await screen.findByText('Payment Failed', {}, { timeout: 5000 });
    expect(failTitle).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined();
    
    randomSpy.mockRestore();
  });
});
