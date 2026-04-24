import type { PaymentStatus, SessionStatus } from '../types';

const JOIN_LEAD_TIME_MS = 10 * 60 * 1000;
const DEFAULT_CANCEL_CUTOFF_MS = 24 * 60 * 60 * 1000;

export interface SessionParticipantSummary {
  id?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface SessionDetailViewModel {
  id: string;
  mentor: SessionParticipantSummary;
  mentee: SessionParticipantSummary;
  topic: string;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  paymentStatus: PaymentStatus | 'paid';
  status: SessionStatus | string;
  price?: number;
  asset?: string;
  meetingUrl?: string;
  meetingExpiresAt?: string;
  hasReview: boolean;
  canCancel?: boolean;
}

export interface SessionActionState {
  isJoinWindowOpen: boolean;
  isBeforeJoinWindow: boolean;
  isPastSessionEnd: boolean;
  isMeetingLinkMissing: boolean;
  isMeetingLinkExpired: boolean;
  shouldShowRegenerate: boolean;
  shouldShowReviewPrompt: boolean;
  canCancel: boolean;
  countdownLabel: string;
}

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const readNumber = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

const readBoolean = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
};

const readParticipant = (
  raw: RawRecord,
  nestedKey: string,
  idKeys: string[],
  nameKeys: string[],
  fallbackName: string,
): SessionParticipantSummary => {
  const nested = isRecord(raw[nestedKey]) ? raw[nestedKey] : {};

  return {
    id: readString(...idKeys.map((key) => raw[key]), nested.id),
    name:
      readString(...nameKeys.map((key) => raw[key]), nested.name, nested.email) ??
      fallbackName,
    email: readString(nested.email),
    avatarUrl: readString(nested.avatarUrl, nested.avatar, nested.imageUrl),
  };
};

const readReviewState = (raw: RawRecord) => {
  const review = raw.review;
  return Boolean(
    readBoolean(raw.hasReview, raw.reviewExists, raw.reviewed) ??
      (isRecord(review) || Array.isArray(review)),
  );
};

export const formatSessionDateTime = (isoValue: string) => {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
};

export const getUserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local timezone';

export const normalizeSessionDetail = (
  payload: unknown,
): SessionDetailViewModel => {
  const rawEnvelope = isRecord(payload) && 'data' in payload ? payload.data : payload;
  const raw = isRecord(rawEnvelope) ? rawEnvelope : {};

  const scheduledStart =
    readString(raw.scheduledAt, raw.scheduled_at, raw.startTime, raw.start_time) ??
    new Date().toISOString();
  const durationMinutes =
    readNumber(raw.duration, raw.durationMinutes, raw.duration_minutes) ?? 60;
  const explicitEnd = readString(
    raw.scheduledEnd,
    raw.scheduled_end,
    raw.endTime,
    raw.end_time,
  );
  const scheduledEnd =
    explicitEnd ??
    new Date(new Date(scheduledStart).getTime() + durationMinutes * 60 * 1000).toISOString();

  return {
    id: readString(raw.id, raw.bookingId, raw.booking_id) ?? 'session',
    mentor: readParticipant(
      raw,
      'mentor',
      ['mentorId', 'mentor_id'],
      ['mentorName', 'mentor_name'],
      'Mentor',
    ),
    mentee: readParticipant(
      raw,
      'mentee',
      ['menteeId', 'mentee_id', 'learnerId', 'learner_id'],
      ['menteeName', 'mentee_name', 'learnerName', 'learner_name'],
      'Mentee',
    ),
    topic: readString(raw.topic, raw.title, raw.subject) ?? 'Mentoring session',
    scheduledStart,
    scheduledEnd,
    durationMinutes,
    paymentStatus:
      (readString(raw.paymentStatus, raw.payment_status) as PaymentStatus | 'paid') ??
      'pending',
    status: readString(raw.status) ?? 'confirmed',
    price: readNumber(raw.price, raw.amount),
    asset: readString(raw.asset, raw.currency),
    meetingUrl: readString(raw.meetingUrl, raw.meeting_url, raw.meetingLink, raw.meeting_link),
    meetingExpiresAt: readString(
      raw.meetingExpiresAt,
      raw.meeting_expires_at,
      raw.meetingLinkExpiresAt,
      raw.meeting_link_expires_at,
    ),
    hasReview: readReviewState(raw),
    canCancel: readBoolean(raw.canCancel, raw.can_cancel),
  };
};

const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return `${seconds}s`;
};

export const getSessionActionState = (
  session: SessionDetailViewModel,
  now: Date = new Date(),
): SessionActionState => {
  const nowTime = now.getTime();
  const startTime = new Date(session.scheduledStart).getTime();
  const endTime = new Date(session.scheduledEnd).getTime();
  const meetingExpiresTime = session.meetingExpiresAt
    ? new Date(session.meetingExpiresAt).getTime()
    : Number.POSITIVE_INFINITY;

  const isBeforeJoinWindow = nowTime < startTime - JOIN_LEAD_TIME_MS;
  const isPastSessionEnd = nowTime > endTime;
  const isJoinWindowOpen = !isBeforeJoinWindow && !isPastSessionEnd;
  const isMeetingLinkMissing = !session.meetingUrl;
  const isMeetingLinkExpired = Number.isFinite(meetingExpiresTime)
    ? nowTime >= meetingExpiresTime
    : false;
  const canCancel =
    session.canCancel ??
    (!['cancelled', 'completed'].includes(session.status) &&
      nowTime < startTime - DEFAULT_CANCEL_CUTOFF_MS);

  return {
    isJoinWindowOpen,
    isBeforeJoinWindow,
    isPastSessionEnd,
    isMeetingLinkMissing,
    isMeetingLinkExpired,
    shouldShowRegenerate: isMeetingLinkMissing || isMeetingLinkExpired,
    shouldShowReviewPrompt: isPastSessionEnd && !session.hasReview,
    canCancel,
    countdownLabel: isPastSessionEnd
      ? 'Session has ended'
      : isBeforeJoinWindow
        ? `Starts in ${formatDuration(startTime - nowTime)}`
        : 'Join window is open',
  };
};
