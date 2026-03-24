import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../components/payment/PaymentModal', () => ({
  default: ({
    isOpen,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (hash: string) => void;
  }) =>
    isOpen ? (
      <div>
        <div>Mock Payment Modal</div>
        <button type="button" onClick={() => onSuccess?.('mock-hash')}>
          Confirm mock payment
        </button>
        <button type="button" onClick={onClose}>
          Close mock payment
        </button>
      </div>
    ) : null,
}));

import BookingModal from '../components/learner/BookingModal';
import { useBooking } from '../hooks/useBooking';
import type { BookingConfirmationDetails, MentorProfile } from '../types';

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

describe('Booking flow', () => {
  it('generates availability and learner calendar data from the booking hook', () => {
    const { result } = renderHook(() => useBooking(mentor));

    expect(result.current.availability.length).toBeGreaterThan(0);
    expect(Object.keys(result.current.groupedAvailability).length).toBeGreaterThan(0);

    act(() => {
      result.current.selectSlot(result.current.availability[0]);
    });

    let confirmation: BookingConfirmationDetails | null = null;
    act(() => {
      confirmation = result.current.confirmBooking('tx-1234');
    });

    expect(result.current.learnerCalendar).toHaveLength(1);
    expect(result.current.confirmedBooking?.calendarInvite.filename).toContain('.ics');
    expect(result.current.confirmedBooking?.paymentTransactionHash).toBe('tx-1234');
    expect(confirmation).toBeDefined();
  });

  it('completes the booking modal flow through payment and success', async () => {
    render(<BookingModal isOpen={true} mentor={mentor} onClose={() => {}} />);

    const slotButton = (await screen.findAllByRole('button')).find((button) =>
      /AM|PM/.test(button.textContent ?? '')
    );
    expect(slotButton).toBeDefined();
    fireEvent.click(slotButton!);

    fireEvent.change(screen.getByLabelText('Session notes'), {
      target: { value: 'Please review my Soroban milestone before the session.' },
    });

    fireEvent.click(screen.getByText('Continue to confirmation'));
    expect(screen.getByText('Review everything before paying')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Proceed to payment'));
    fireEvent.click(await screen.findByText('Confirm mock payment'));
    fireEvent.click(screen.getByText('Close mock payment'));

    await waitFor(() => {
      expect(screen.getByText('Booking success')).toBeInTheDocument();
      expect(screen.getByText('Download invite')).toBeInTheDocument();
      expect(screen.getByText(/Added to learner calendar/i)).toBeInTheDocument();
    });
  });
});
