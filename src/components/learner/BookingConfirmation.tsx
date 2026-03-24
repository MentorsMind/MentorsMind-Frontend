import React from 'react';
import type { BookingDraft, BookingPricingBreakdown } from '../../types';

interface BookingConfirmationProps {
  draft: BookingDraft;
  pricing: BookingPricingBreakdown;
}

const currency = (amount: number, code: string) => `${amount.toFixed(2)} ${code}`;

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ draft, pricing }) => {
  if (!draft.selectedSlot) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gray-50 p-5">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Session</div>
        <h3 className="mt-2 text-2xl font-black text-gray-900">
          {draft.sessionType} with {draft.mentorName}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {draft.selectedSlot.dateLabel} · {draft.selectedSlot.label} · {draft.duration} minutes
        </p>
        <p className="mt-3 text-sm text-gray-600">{draft.notes || 'No additional notes provided.'}</p>
      </div>

      <div className="rounded-3xl border border-gray-100 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Base session cost</span>
          <span className="font-semibold text-gray-900">
            {currency(pricing.baseAmount, pricing.currency)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Session type adjustment</span>
          <span className="font-semibold text-gray-900">
            {currency(pricing.sessionTypeFee, pricing.currency)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-500">Platform fee</span>
          <span className="font-semibold text-gray-900">
            {currency(pricing.platformFee, pricing.currency)}
          </span>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">Total</span>
          <span className="text-2xl font-black text-stellar">
            {currency(pricing.totalAmount, pricing.currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
