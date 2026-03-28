import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SessionRoom from './SessionRoom';
import { useSessionDetails } from '../hooks/useSessionDetails';
import { ROUTES } from '../config/routes.config';

/**
 * Route shell for `/sessions/:id` — loads session metadata and mounts the video room.
 */
export const SessionRoomPage: React.FC = () => {
  const { id: sessionId = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') === 'mentor' ? 'mentor' : 'learner';

  const { session, loading, error, refetch } = useSessionDetails(sessionId || undefined);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden
          />
          <p className="mt-4 text-sm text-white/80">Loading session…</p>
        </div>
      </div>
    );
  }

  if (error === 'network') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="font-semibold text-gray-900">Connection error</p>
          <p className="mt-2 text-sm text-gray-600">We could not load this session. Check your network.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-xl bg-stellar px-6 py-3 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (error === 'not_found' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="font-semibold text-gray-900">Session not found</p>
          <p className="mt-2 text-sm text-gray-600">
            This session does not exist or you no longer have access.
          </p>
          <Link
            to={ROUTES.DASHBOARD}
            className="mt-6 inline-block rounded-xl bg-stellar px-6 py-3 text-sm font-bold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const counterpartyName =
    role === 'mentor' ? session.learnerName : session.mentorName ?? 'Mentor';

  return (
    <SessionRoom
      sessionId={session.id}
      meetingLink={session.meetingLink}
      sessionTopic={session.topic}
      counterpartyName={counterpartyName}
    />
  );
};

export default SessionRoomPage;
