import { useMemo } from 'react';
import type { BookingDraft, BookingPricingBreakdown } from '../../types';

interface BookingSummaryModalProps {
  isOpen: boolean;
  draft: BookingDraft;
  pricing: BookingPricingBreakdown;
  mentorName: string;
  userTimezone: string;
  mentorTimezone: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BookingSummaryModal({
  isOpen,
  draft,
  pricing,
  mentorName,
  userTimezone,
  mentorTimezone,
  onConfirm,
  onCancel,
  isSubmitting,
}: BookingSummaryModalProps) {
  const formatDateTime = (dateStr: string, timezone: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const userDateTime = useMemo(() => {
    if (!draft.selectedSlot) return null;
    return formatDateTime(draft.selectedSlot.start, userTimezone);
  }, [draft.selectedSlot, userTimezone]);

  const mentorDateTime = useMemo(() => {
    if (!draft.selectedSlot || userTimezone === mentorTimezone) return null;
    return formatDateTime(draft.selectedSlot.start, mentorTimezone);
  }, [draft.selectedSlot, userTimezone, mentorTimezone]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-[101] w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Confirm Your Booking
        </h3>

        <div className="space-y-4 mb-6">
          {/* Mentor */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {mentorName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{mentorName}</p>
              <p className="text-sm text-gray-500">Mentor</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Session Type</span>
              <span className="text-sm font-semibold text-gray-900">
                {draft.sessionType === '1:1'
                  ? '1:1 Session'
                  : draft.sessionType === 'group'
                  ? 'Group Session'
                  : 'Workshop'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="text-sm font-semibold text-gray-900">
                {draft.duration} minutes
              </span>
            </div>
          </div>

          {/* Date & Time */}
          {userDateTime && (
            <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Your Time ({userTimezone})
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {userDateTime.date}
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  {userDateTime.time}
                </p>
              </div>

              {mentorDateTime && (
                <div className="pt-3 border-t border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Mentor's Time ({mentorTimezone})
                  </p>
                  <p className="text-sm text-gray-700">
                    {mentorDateTime.date} at {mentorDateTime.time}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Session Fee</span>
              <span className="font-medium text-gray-900">
                {pricing.sessionFee.toFixed(2)} {pricing.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee (5%)</span>
              <span className="font-medium text-gray-900">
                {pricing.platformFee.toFixed(2)} {pricing.currency}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-indigo-600">
                {pricing.totalAmount.toFixed(2)} {pricing.currency}
              </span>
            </div>
          </div>

          {/* Notes */}
          {draft.notes && (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Session Notes
              </p>
              <p className="text-sm text-gray-700">{draft.notes}</p>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-yellow-800 mb-1">
            ⚠️ Important
          </p>
          <p className="text-xs text-yellow-700">
            By confirming, you agree to proceed with payment. An idempotency key
            will be generated to prevent duplicate bookings. You can only submit
            this booking once.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
