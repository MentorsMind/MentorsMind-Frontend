import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  BookOpen,
  ClipboardList,
  LogOut,
  StickyNote,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { ConnectionTest } from '../components/session/ConnectionTest';
import { ParticipantStatus } from '../components/session/ParticipantStatus';
import { sessionToWaitingRoomDetails } from '../data/mentorSessionFixtures';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { useWaitingRoomPresence } from '../hooks/useWaitingRoomPresence';
import { ROUTES } from '../config/routes.config';

export type { WaitingRoomNotePreview } from '../data/mentorSessionFixtures';

type WaitingRoomDetailsVM = ReturnType<typeof sessionToWaitingRoomDetails>;

interface WaitingRoomLoadedProps {
  sessionId: string;
  role: 'mentor' | 'learner';
  details: WaitingRoomDetailsVM;
}

/** Isolated so `key={sessionId}` resets connection + simulated presence state without effects. */
const WaitingRoomLoaded: React.FC<WaitingRoomLoadedProps> = ({ sessionId, role, details }) => {
  const navigate = useNavigate();
  const { otherJoined } = useWaitingRoomPresence(sessionId, { enabled: true });

  const otherParty = role === 'mentor' ? details.learner : details.mentor;
  const selfLabel = role === 'mentor' ? 'Mentor' : 'Learner';
  const otherLabel = role === 'mentor' ? 'Learner' : 'Mentor';

  const [connectionReady, setConnectionReady] = useState(false);

  const handleConnectionPass = useCallback(() => {
    setConnectionReady(true);
  }, []);

  useEffect(() => {
    if (!connectionReady || !otherJoined || !sessionId) return;
    const t = window.setTimeout(() => {
      const roleQs = role === 'mentor' ? '?role=mentor' : '';
      navigate(`/sessions/${sessionId}${roleQs}`, { replace: true });
    }, 600);
    return () => window.clearTimeout(t);
  }, [connectionReady, otherJoined, navigate, sessionId, role]);

  const scheduledLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(details.scheduledAt));
    } catch {
      return details.scheduledAt;
    }
  }, [details.scheduledAt]);

  const handleLeave = () => {
    const ok = window.confirm(
      'Leave the waiting room? You can return from your sessions list when you are ready.',
    );
    if (ok) {
      navigate(-1);
    }
  };

  const checklist = [
    { id: 'devices', label: 'Camera and microphone tested', done: connectionReady },
    { id: 'network', label: 'Stable connection (run connection test)', done: connectionReady },
    {
      id: 'ready',
      label: 'Both participants ready to enter the room',
      done: connectionReady && otherJoined,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stellar">Waiting room</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Session starting soon</h1>
          <p className="mt-1 text-sm text-gray-500">
            Session ID: <span className="font-mono text-gray-700">{sessionId || '—'}</span> · You are joining as{' '}
            <span className="font-medium text-gray-800">{selfLabel}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLeave}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Leave
        </button>
      </header>

      {connectionReady && otherJoined && (
        <div
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
          role="status"
        >
          Both participants are ready — opening the session room…
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Session details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <div>
                  <dt className="text-gray-500">Topic</dt>
                  <dd className="font-medium text-gray-900">{details.topic}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <div>
                  <dt className="text-gray-500">Scheduled</dt>
                  <dd className="font-medium text-gray-900">{scheduledLabel}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <div>
                  <dt className="text-gray-500">Duration</dt>
                  <dd className="font-medium text-gray-900">{details.durationMinutes} minutes</dd>
                </div>
              </div>
              <div className="flex gap-3 border-t border-gray-100 pt-3">
                <div className="min-w-0 flex-1">
                  <dt className="text-gray-500">Mentor</dt>
                  <dd className="truncate font-medium text-gray-900">{details.mentor.name}</dd>
                </div>
                <div className="min-w-0 flex-1">
                  <dt className="text-gray-500">Learner</dt>
                  <dd className="truncate font-medium text-gray-900">{details.learner.name}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClipboardList className="h-5 w-5 text-stellar" aria-hidden />
              Preparation checklist
            </h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-sm text-gray-800">
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" aria-hidden />
                  )}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <StickyNote className="h-5 w-5 text-stellar" aria-hidden />
              Notes from previous sessions
            </h2>
            <p className="mt-1 text-xs text-gray-500">With this {otherLabel.toLowerCase()} (preview)</p>
            {details.previousNotes.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No prior notes for this pair yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {details.previousNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm text-gray-800"
                  >
                    <span className="text-xs font-semibold text-gray-500">{note.sessionDate}</span>
                    <p className="mt-1 leading-snug">{note.excerpt}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <ConnectionTest onAllChecksPass={handleConnectionPass} />
          <ParticipantStatus
            name={otherParty.name}
            avatarUrl={otherParty.avatarUrl}
            hasJoined={otherJoined}
            roleLabel={otherLabel}
          />
        </div>
      </div>
    </div>
  );
};

export const WaitingRoomPage: React.FC = () => {
  const { id: sessionId = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const role = searchParams.get('role') === 'mentor' ? 'mentor' : 'learner';

  const { session, loading, error, refetch } = useSessionDetails(sessionId || undefined);
  const details = useMemo(() => (session ? sessionToWaitingRoomDetails(session) : null), [session]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-stellar border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-gray-600">Loading session…</p>
      </div>
    );
  }

  if (error === 'network') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-gray-900 font-semibold">Could not load session</p>
        <p className="mt-2 text-sm text-gray-600">Check your connection and try again.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 rounded-xl bg-stellar px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error === 'not_found' || !details) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-gray-900 font-semibold">Session not found</p>
        <p className="mt-2 text-sm text-gray-600">
          This link may be invalid or the session was removed. Open it from your sessions list.
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="mt-6 inline-block rounded-xl bg-stellar px-4 py-2 text-sm font-semibold text-white"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return <WaitingRoomLoaded key={sessionId} sessionId={sessionId} role={role} details={details} />;
};

export default WaitingRoomPage;
