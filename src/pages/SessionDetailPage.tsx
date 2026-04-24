import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Link2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Alert, Badge, Button, Card, Modal, Spinner } from '../components/ui';
import UserAvatar from '../components/ui/UserAvatar';
import PostSessionReview from '../components/session/PostSessionReview';
import api from '../services/api.client';
import {
  cancelBooking,
  getBooking,
  regenerateMeetingLink,
} from '../services/booking.service';
import type { SessionHistoryItem } from '../types/session.types';
import {
  formatSessionDateTime,
  getSessionActionState,
  getUserTimeZone,
  normalizeSessionDetail,
  type SessionDetailViewModel,
} from '../utils/session-detail.utils';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
  rescheduled: 'warning',
};

const paymentVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success',
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'danger',
  refunded: 'default',
};

const getDisplayName = (name: string, fallback: string) =>
  name && name !== fallback ? name : fallback;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ParticipantCard({
  title,
  participant,
}: {
  title: string;
  participant: SessionDetailViewModel['mentor'];
}) {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-4">
        <UserAvatar
          avatarUrl={participant.avatarUrl}
          name={participant.name}
          size="lg"
          className="rounded-2xl"
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <p className="text-base font-black text-gray-900">
            {participant.name}
          </p>
          {participant.email && (
            <p className="text-sm text-gray-500">{participant.email}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [regenerating, setRegenerating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [updatedRating, setUpdatedRating] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setError('Session ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const booking = await getBooking(sessionId);
      setSession(normalizeSessionDetail(booking));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load this session right now.',
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const actionState = useMemo(
    () => (session ? getSessionActionState(session, now) : null),
    [now, session],
  );

  const handleJoinSession = () => {
    if (!session?.meetingUrl || !actionState?.isJoinWindowOpen) {
      return;
    }

    window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRegenerateLink = async () => {
    if (!sessionId) {
      return;
    }

    setRegenerating(true);
    setActionMessage(null);
    setError(null);

    try {
      const updated = await regenerateMeetingLink(sessionId);
      setSession(normalizeSessionDetail(updated));
      setActionMessage('Meeting link regenerated successfully.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to regenerate the meeting link.',
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancel = async () => {
    if (!sessionId || !session) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const cancelled = await cancelBooking(sessionId);
      setSession({
        ...session,
        ...normalizeSessionDetail(cancelled),
        status: 'cancelled',
      });
      setActionMessage('Session cancelled successfully.');
      setShowCancelConfirm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to cancel this session right now.',
      );
    } finally {
      setCancelling(false);
    }
  };

  const reviewSession = useMemo<SessionHistoryItem | null>(() => {
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      mentorId: session.mentor.id ?? '',
      mentorName: session.mentor.name,
      topic: session.topic,
      date: session.scheduledStart,
      duration: session.durationMinutes,
      status: 'completed',
      skills: [],
      amount: session.price ?? 0,
      currency: session.asset ?? 'USDC',
    };
  }, [session]);

  const submitReview = async (data: {
    rating: number;
    comment: string;
    skillTags: string[];
  }) => {
    if (!session) {
      return;
    }

    await api.post(`/sessions/${session.id}/review`, {
      mentorId: session.mentor.id,
      ...data,
    });

    setUpdatedRating(data.rating);
    setReviewSubmitted(true);
    setSession({ ...session, hasReview: true });
    setActionMessage('Review submitted successfully.');
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
          <Spinner size="lg" />
          Loading session details...
        </div>
      </div>
    );
  }

  if (!session || error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Back to sessions
        </button>
        <Alert type="error" title="Session unavailable">
          {error ?? 'We could not find this session.'}
        </Alert>
        <Button onClick={loadSession} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const joinDisabled =
    !actionState?.isJoinWindowOpen ||
    actionState.isMeetingLinkMissing ||
    actionState.isMeetingLinkExpired;
  const sessionCost =
    session.price !== undefined && session.asset
      ? `${session.price} ${session.asset}`
      : 'Not available';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm lg:flex-row lg:items-center">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Back to sessions
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[session.status] ?? 'default'}>
              {session.status}
            </Badge>
            <Badge variant={paymentVariant[session.paymentStatus] ?? 'default'}>
              Payment: {session.paymentStatus}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950">
            {session.topic}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Times are shown in your timezone: {getUserTimeZone()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-left shadow-sm lg:min-w-[260px]">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Clock className="h-4 w-4 text-indigo-600" />
            {actionState?.countdownLabel}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Join opens 10 minutes before the scheduled start.
          </p>
        </div>
      </div>

      {actionMessage && (
        <Alert type="success" onClose={() => setActionMessage(null)}>
          {actionMessage}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantCard
          title="Mentor"
          participant={{
            ...session.mentor,
            name: getDisplayName(session.mentor.name, 'Mentor'),
          }}
        />
        <ParticipantCard
          title="Mentee"
          participant={{
            ...session.mentee,
            name: getDisplayName(session.mentee.name, 'Mentee'),
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-950">
                Session schedule
              </h2>
              <p className="text-sm text-gray-500">
                Confirm the time, duration, and payment state before joining.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              label="Starts"
              value={formatSessionDateTime(session.scheduledStart)}
            />
            <DetailRow
              label="Ends"
              value={formatSessionDateTime(session.scheduledEnd)}
            />
            <DetailRow
              label="Duration"
              value={`${session.durationMinutes} minutes`}
            />
            <DetailRow label="Session cost" value={sessionCost} />
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-50 p-3 text-green-600">
              <Link2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-950">
                Meeting room
              </h2>
              <p className="text-sm text-gray-500">
                Secure meeting access from the confirmed booking.
              </p>
            </div>
          </div>

          {actionState?.shouldShowRegenerate ? (
            <Alert type="warning" title="Meeting link needs attention">
              {actionState.isMeetingLinkMissing
                ? 'No meeting URL is available for this booking yet.'
                : 'The existing meeting URL has expired.'}
            </Alert>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Meeting link ready
              </div>
              <p className="mt-1 break-all text-green-700">
                {session.meetingUrl}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={joinDisabled}
              onClick={handleJoinSession}
            >
              <ExternalLink className="h-4 w-4" />
              Join Session
            </Button>

            {actionState?.shouldShowRegenerate && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                loading={regenerating}
                onClick={handleRegenerateLink}
              >
                {!regenerating && <RefreshCw className="h-4 w-4" />}
                Regenerate Link
              </Button>
            )}

            {joinDisabled && !actionState?.shouldShowRegenerate && (
              <p className="text-xs font-medium text-gray-500">
                The join button activates within 10 minutes of the scheduled
                start and remains available until the session ends.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {actionState?.shouldShowReviewPrompt && (
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <MessageSquareText className="mt-1 h-5 w-5 text-amber-600" />
              <div>
                <h2 className="font-black text-amber-950">
                  Leave a review for this session
                </h2>
                <p className="mt-1 text-sm text-amber-800">
                  This session has ended and no review is recorded yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
                >
                  Leave Review
                </button>
              </div>
            </div>
          </Card>
        )}

        {actionState?.canCancel && (
          <Card className="border-red-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h2 className="font-black text-gray-950">Cancel session</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Cancellation is still allowed for this booking. You will be
                  asked to confirm before the session is cancelled.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  className="mt-4"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Session
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancel this session?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-red-800">
            <XCircle className="mt-0.5 h-5 w-5" />
            <p className="text-sm">
              This action will cancel the booking and notify both participants.
              Continue only if you are sure.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Session
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling
                </>
              ) : (
                'Confirm Cancel'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {showReviewModal && reviewSession && (
        <PostSessionReview
          session={reviewSession}
          submitted={reviewSubmitted}
          updatedRating={updatedRating}
          onSubmit={submitReview}
          onDismiss={() => setShowReviewModal(false)}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
