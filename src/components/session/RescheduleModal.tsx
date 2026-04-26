import React, { useState } from 'react';
import type { AvailabilitySlot } from '../../types';
import type { RescheduleRequest } from '../../hooks/useReschedule';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slot: AvailabilitySlot, reason?: string) => void;
  originalTime: string;
  availableSlots: AvailabilitySlot[];
  pendingRequest?: RescheduleRequest | null;
  rescheduleCount: number;
  maxReschedules: number;
  isLoading?: boolean;
  error?: string | null;
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  originalTime,
  availableSlots,
  pendingRequest,
  rescheduleCount,
  maxReschedules,
  isLoading = false,
  error = null,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  if (!isOpen) return null;

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleSubmit = () => {
    if (selectedSlot) {
      onSubmit(selectedSlot, reason || undefined);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
      setSelectedSlot(null);
    } else {
      onClose();
    }
  };

  // Group slots by date
  const groupedSlots = availableSlots.reduce<Record<string, AvailabilitySlot[]>>(
    (acc, slot) => {
      const dateKey = slot.dateKey;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    },
    {}
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reschedule Session</h2>
              <p className="text-sm text-gray-500 mt-1">
                {rescheduleCount}/{maxReschedules} reschedule attempts used
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {pendingRequest ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-800">Pending Request</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You have a pending reschedule request. The other party needs to respond before you can submit a new request.
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-700">Original time:</span>
                        <span className="font-medium text-yellow-900">{formatDateTime(pendingRequest.originalTime)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-700">Proposed time:</span>
                        <span className="font-medium text-yellow-900">{formatDateTime(pendingRequest.proposedTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : step === 'select' ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current time:</span> {formatDateTime(originalTime)}
                </p>
              </div>

              {Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No available time slots</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedSlots).map(([dateKey, slots]) => (
                    <div key={dateKey}>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">
                        {slots[0]?.dateLabel}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot)}
                            className="p-3 text-sm border border-gray-200 rounded-xl hover:border-stellar hover:bg-stellar/5 transition-all text-left"
                          >
                            <div className="font-medium text-gray-900">{slot.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{slot.timezone}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Original time:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(originalTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">New time:</span>
                  <span className="font-medium text-stellar">{selectedSlot && formatDateTime(selectedSlot.start)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reschedule (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Let the other party know why you need to reschedule..."
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {step === 'confirm' ? 'Back' : 'Cancel'}
          </button>

          {step === 'confirm' && (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedSlot}
              className="px-6 py-2 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Send Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
