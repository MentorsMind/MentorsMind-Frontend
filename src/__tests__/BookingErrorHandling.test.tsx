import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api.error';
import BookingModal from '../components/learner/BookingModal';
import type { MentorProfile } from '../types';

vi.mock('../components/payment/PaymentModal', () => ({
  default: ({
    isOpen,
    onSuccess,
  }: {
    isOpen: boolean;
    onSuccess?: (hash: string) => void;
  }) =>
    isOpen ? (
      <div>
        <button type="button" onClick={() => onSuccess?.('mock-hash')}>
          Confirm mock payment
        </button>
      </div>
    ) : null,
}));

const mockCreate = vi.fn();

vi.mock('../services/booking.service', () => {
  return {
    default: class {
      create = mockCreate;
    }
  };
});

const mentor: MentorProfile = {
  id: 'mentor-1',
  name: 'Dr. Sarah Chen',
  title: 'Senior Blockchain Developer',
  bio: 'Mentor focused on shipping production-grade Stellar apps.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  hourlyRate: 80,
  currency: 'XLM',
  rating: 4.9,
  reviewCount: 120,
  totalSessions: 320,
  completionRate: 98,
  skills: ['Stellar', 'Soroban', 'Rust'],
  expertise: ['Web3', 'Architecture'],
  languages: ['English'],
  availability: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['09:00-12:00', '14:00-17:00'],
    timezone: 'UTC',
  },
  experienceYears: 8,
  certifications: ['Certified Stellar Developer'],
  isAvailable: true,
  responseTime: 'Within 1 hour',
  joinedDate: '2024-01-10',
};

describe('Booking Error Handling', () => {
  it('handles 501 Not Implemented error gracefully', async () => {
    // Mock crypto.randomUUID for the test environment
    if (!global.crypto.randomUUID) {
      global.crypto.randomUUID = () => 'mock-uuid' as any;
    }

    mockCreate.mockRejectedValue(new ApiError('Not Implemented', 501));

    render(<BookingModal isOpen={true} mentor={mentor} onClose={() => {}} />);

    // Select a slot
    const slotButton = (await screen.findAllByRole('button')).find((button) =>
      /AM|PM/.test(button.textContent ?? '')
    );
    fireEvent.click(slotButton!);

    // Go to confirmation
    fireEvent.click(screen.getByText('Continue to confirmation'));
    
    // Open summary
    fireEvent.click(screen.getByText('Review & Confirm'));
    
    // Click Confirm & Pay (opens PaymentModal)
    fireEvent.click(await screen.findByText('Confirm & Pay', {}, { timeout: 5000 }));
    
    // Trigger payment success which calls confirmBooking
    fireEvent.click(await screen.findByText('Confirm mock payment', {}, { timeout: 5000 }));

    // Check for graceful error message
    await waitFor(() => {
      expect(screen.getByText(/Booking feature is coming soon/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles other errors with default message', async () => {
    mockCreate.mockRejectedValue(new Error('Internal Server Error'));

    render(<BookingModal isOpen={true} mentor={mentor} onClose={() => {}} />);

    const slotButton = (await screen.findAllByRole('button')).find((button) =>
      /AM|PM/.test(button.textContent ?? '')
    );
    fireEvent.click(slotButton!);

    fireEvent.click(screen.getByText('Continue to confirmation'));
    fireEvent.click(screen.getByText('Review & Confirm'));
    fireEvent.click(await screen.findByText('Confirm & Pay', {}, { timeout: 5000 }));
    fireEvent.click(await screen.findByText('Confirm mock payment', {}, { timeout: 5000 }));

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
