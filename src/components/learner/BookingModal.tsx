import React, { useEffect, useMemo, useState } from 'react';
import SessionTypeSelector from './SessionTypeSelector';
import AvailabilityPicker from './AvailabilityPicker';
import BookingConfirmation from './BookingConfirmation';
import PaymentModal from '../payment/PaymentModal';
import { useBooking } from '../../hooks/useBooking';
import type { MentorProfile } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  mentor: MentorProfile | null;
  onClose: () => void;
}

type BookingStep = 'details' | 'confirmation' | 'success';

const DURATIONS = [30, 45, 60, 90, 120];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, mentor, onClose }) => {
  const {
    draft,
    groupedAvailability,
    selectedDateKey,
    pricing,
    learnerCalendar,
    confirmedBooking,
    paymentDetails,
    setSessionType,
    setDuration,
    setNotes,
    selectSlot,
    confirmBooking,
    reset,
    canReviewBooking,
  } = useBooking(isOpen ? mentor : null);
  const [step, setStep] = useState<BookingStep>('details');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setPaymentOpen(false);
      setPaymentCompleted(false);
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (paymentCompleted && confirmedBooking) {
      setStep('success');
    }
  }, [confirmedBooking, paymentCompleted]);

  const handleClose = () => {
    setStep('details');
    setPaymentOpen(false);
    setPaymentCompleted(false);
    reset();
    onClose();
  };

  const handlePaymentSuccess = (transactionHash: string) => {
    confirmBooking(transactionHash);
    setPaymentCompleted(true);
  };

  const handlePaymentClose = () => {
    setPaymentOpen(false);
  };

  const handleDownloadInvite = () => {
    if (!confirmedBooking) {
      return;
    }

    const blob = new Blob([confirmedBooking.calendarInvite.content], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = confirmedBooking.calendarInvite.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pricingSummary = useMemo(() => {
    if (!pricing) {
      return 'Choose a slot to see pricing.';
    }

    return `${pricing.totalAmount.toFixed(2)} ${pricing.currency} total`;
  }, [pricing]);

  if (!isOpen || !mentor || !draft) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative z-[91] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <aside className="bg-gradient-to-br from-stellar via-blue-600 to-cyan-500 p-8 text-white">
              <div className="flex items-center gap-4">
                {mentor.avatar ? (
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black">
                    {mentor.name[0]}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                    Book Mentor
                  </div>
                  <h2 className="text-2xl font-black">{mentor.name}</h2>
                  <p className="text-sm text-white/80">{mentor.title}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                    Response Time
                  </div>
                  <div className="mt-2 text-lg font-bold">{mentor.responseTime || 'Within 24 hours'}</div>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                    Pricing Snapshot
                  </div>
                  <div className="mt-2 text-lg font-bold">{pricingSummary}</div>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                    What Happens Next
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    Pick a slot, review the total, complete payment, and we will generate a calendar invite for your learner calendar.
                  </p>
                </div>
              </div>
            </aside>

            <section className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                    {step === 'details' && 'Booking Details'}
                    {step === 'confirmation' && 'Confirm Booking'}
                    {step === 'success' && 'Booking Confirmed'}
                  </div>
                  <h3 className="mt-2 text-3xl font-black text-gray-900">
                    {step === 'details' && 'Plan your session'}
                    {step === 'confirmation' && 'Review everything before paying'}
                    {step === 'success' && 'Your session is locked in'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl bg-gray-50 px-4 py-2 text-sm font-bold text-gray-500 transition-all hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              {step === 'details' && (
                <div className="mt-8 space-y-8">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-900">Session type</label>
                    <SessionTypeSelector value={draft.sessionType} onChange={setSessionType} />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-900">Duration</label>
                    <div className="flex flex-wrap gap-3">
                      {DURATIONS.map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setDuration(duration)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                            draft.duration === duration
                              ? 'border-stellar bg-stellar text-white'
                              : 'border-gray-100 bg-white text-gray-700 hover:border-stellar/30'
                          }`}
                        >
                          {duration} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-900">
                      Availability calendar
                    </label>
                    <AvailabilityPicker
                      groupedAvailability={groupedAvailability}
                      selectedDateKey={selectedDateKey}
                      selectedSlotId={draft.selectedSlot?.id}
                      onSelect={selectSlot}
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-notes" className="mb-3 block text-sm font-bold text-gray-900">
                      Session notes
                    </label>
                    <textarea
                      id="booking-notes"
                      value={draft.notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Share goals, links, blockers, or what you want to cover."
                      className="min-h-32 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none transition-all focus:border-stellar focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!canReviewBooking}
                      onClick={() => setStep('confirmation')}
                      className="rounded-2xl bg-stellar px-6 py-4 text-sm font-black text-white shadow-xl shadow-stellar/20 transition-all hover:bg-stellar-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue to confirmation
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirmation' && draft.selectedSlot && pricing && (
                <div className="mt-8 space-y-6">
                  <BookingConfirmation draft={draft} pricing={pricing} />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="rounded-2xl border border-gray-100 px-6 py-4 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentOpen(true)}
                      className="rounded-2xl bg-stellar px-6 py-4 text-sm font-black text-white shadow-xl shadow-stellar/20 transition-all hover:bg-stellar-dark"
                    >
                      Proceed to payment
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && confirmedBooking && (
                <div className="mt-8 space-y-6">
                  <div className="rounded-[2rem] bg-emerald-50 p-6">
                    <div className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">
                      Booking success
                    </div>
                    <h4 className="mt-2 text-2xl font-black text-gray-900">
                      {confirmedBooking.sessionType} with {confirmedBooking.mentorName}
                    </h4>
                    <p className="mt-2 text-sm text-gray-600">
                      {confirmedBooking.slot.dateLabel} · {confirmedBooking.slot.label} ·{' '}
                      {confirmedBooking.pricing.totalAmount.toFixed(2)} {confirmedBooking.pricing.currency}
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      Added to learner calendar and ready for invite download.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-gray-100 p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                        Calendar invite
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Download an `.ics` invite and import it into Google Calendar, Apple Calendar, or Outlook.
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadInvite}
                        className="mt-4 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white"
                      >
                        Download invite
                      </button>
                    </div>

                    <div className="rounded-3xl border border-gray-100 p-5">
                      <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                        Learner calendar
                      </div>
                      <div className="mt-3 space-y-3">
                        {learnerCalendar.slice(0, 2).map((event) => (
                          <div key={event.id} className="rounded-2xl bg-gray-50 p-4">
                            <div className="text-sm font-bold text-gray-900">{event.title}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              {new Date(event.start).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-2xl bg-stellar px-6 py-4 text-sm font-black text-white shadow-xl shadow-stellar/20 transition-all hover:bg-stellar-dark"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {paymentDetails && (
        <PaymentModal
          isOpen={paymentOpen}
          onClose={handlePaymentClose}
          details={paymentDetails}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default BookingModal;
