import React from 'react';
import FocusTrap from '../a11y/FocusTrap';
import type { RecordingConsentRequest } from '../../hooks/useRecording';

interface RecordingConsentProps {
  request: RecordingConsentRequest | null;
  secondsRemaining: number;
  onAccept: () => void;
  onDecline: () => void;
}

const roleLabel = (role: RecordingConsentRequest['requesterRole']) => (role === 'mentor' ? 'Mentor' : 'Learner');

const RecordingConsent: React.FC<RecordingConsentProps> = ({
  request,
  secondsRemaining,
  onAccept,
  onDecline,
}) => {
  if (!request) {
    return null;
  }

  const actionLabel = request.type === 'start' ? 'record this session' : 'stop recording';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-sm">
      <FocusTrap active>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recording-consent-title"
          className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        >
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Recording Consent
        </div>
        <h2 id="recording-consent-title" className="mt-4 text-2xl font-black text-gray-950">
          {roleLabel(request.requesterRole)} wants to {actionLabel}. Allow?
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Accepting this request stores the consent decision as on-chain session metadata and starts the retention window immediately.
        </p>

        <div className="mt-5 rounded-2xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-950">Privacy notice</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Recordings are stored for 30 days then deleted.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Auto-declines in {secondsRemaining}s
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onDecline}
            className="rounded-2xl bg-gray-100 px-5 py-3 font-bold text-gray-700 transition-all hover:bg-gray-200"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="rounded-2xl bg-stellar px-5 py-3 font-bold text-white transition-all hover:bg-stellar-dark"
          >
            Accept
          </button>
        </div>
      </div>
      </FocusTrap>
    </div>
  );
};

export default RecordingConsent;
