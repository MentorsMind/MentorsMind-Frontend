import React from 'react';
import { UserRound, CheckCircle2, Loader2 } from 'lucide-react';

export interface ParticipantStatusProps {
  /** Display name of the other participant (mentor or learner). */
  name: string;
  avatarUrl?: string;
  /** When true, the other party has joined the waiting room / is ready. */
  hasJoined: boolean;
  /** Optional subtitle, e.g. &quot;Mentor&quot; or &quot;Learner&quot;. */
  roleLabel?: string;
  className?: string;
}

export const ParticipantStatus: React.FC<ParticipantStatusProps> = ({
  name,
  avatarUrl,
  hasJoined,
  roleLabel,
  className = '',
}) => {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
      aria-live="polite"
      aria-labelledby="waiting-participant-heading"
    >
      <h2 id="waiting-participant-heading" className="text-lg font-semibold text-gray-900">
        Other participant
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-500">
              {initial}
            </div>
          )}
          {hasJoined && (
            <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
              <CheckCircle2 className="h-3 w-3 text-white" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{name}</p>
          {roleLabel && <p className="text-xs text-gray-500">{roleLabel}</p>}
          {hasJoined ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              Joined — you can enter the session soon
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-800">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-600" aria-hidden />
              Hasn&apos;t joined yet — hang tight
            </p>
          )}
        </div>
      </div>

      {!hasJoined && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          You will be moved into the session automatically when both of you are ready.
        </p>
      )}
    </section>
  );
};
