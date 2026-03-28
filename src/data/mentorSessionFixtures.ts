import type { Session } from '../types';

/** Mentor-side booking row; extends API `Session` with UI-only fields. */
export interface ExtendedSession extends Session {
  notes?: string;
  cancelReason?: string;
  checklist: boolean[];
  feedback?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  learnerAvatar?: string;
  learnerBio?: string;
  mentorId?: string;
  mentorName?: string;
  mentorAvatar?: string;
}

export interface WaitingRoomNotePreview {
  id: string;
  sessionDate: string;
  excerpt: string;
}

/**
 * Canonical seed used by mentor session list and by `findSessionById` until the API backs this.
 */
export const MENTOR_SESSION_FIXTURES: ExtendedSession[] = [
  {
    id: 's1',
    mentorId: 'mentor-amina',
    mentorName: 'Dr. Amina Okonkwo',
    mentorAvatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
    learnerId: 'u1',
    learnerName: 'Alice Johnson',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face',
    topic: 'Stellar Smart Contracts Introduction',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    duration: 60,
    status: 'pending',
    price: 50,
    currency: 'XLM',
    checklist: [false, true, false],
    paymentStatus: 'pending',
  },
  {
    id: 's2',
    mentorId: 'mentor-amina',
    mentorName: 'Dr. Amina Okonkwo',
    mentorAvatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
    learnerId: 'u2',
    learnerName: 'Bob Smith',
    learnerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face',
    topic: 'Soroban Development Best Practices',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 45,
    status: 'confirmed',
    price: 75,
    currency: 'XLM',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    checklist: [true, true, false],
    paymentStatus: 'paid',
    notes: 'Learner struggled with Rust syntax - recommended additional resources.',
  },
  {
    id: 's3',
    mentorId: 'mentor-amina',
    mentorName: 'Dr. Amina Okonkwo',
    mentorAvatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
    learnerId: 'u3',
    learnerName: 'Carol Davis',
    learnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face',
    topic: 'Advanced Stellar SDK Usage',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    duration: 90,
    status: 'completed',
    price: 100,
    currency: 'XLM',
    checklist: [true, true, true],
    paymentStatus: 'paid',
    feedback: 'Great session! Mentor was very knowledgeable.',
    notes: 'Covered custom Soroban contracts and testing.',
  },
  {
    id: 's-hist-alice-1',
    mentorId: 'mentor-amina',
    mentorName: 'Dr. Amina Okonkwo',
    mentorAvatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
    learnerId: 'u1',
    learnerName: 'Alice Johnson',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face',
    topic: 'Stellar trustlines refresher',
    startTime: new Date(Date.now() - 86400000 * 14).toISOString(),
    duration: 45,
    status: 'completed',
    price: 40,
    currency: 'XLM',
    checklist: [true, true, true],
    paymentStatus: 'paid',
    notes: 'Covered trustlines and asset issuance. Homework: read CAP-0029 draft.',
  },
  {
    id: 's-hist-alice-2',
    mentorId: 'mentor-amina',
    mentorName: 'Dr. Amina Okonkwo',
    mentorAvatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
    learnerId: 'u1',
    learnerName: 'Alice Johnson',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face',
    topic: 'soroban-cli debugging',
    startTime: new Date(Date.now() - 86400000 * 21).toISOString(),
    duration: 60,
    status: 'completed',
    price: 50,
    currency: 'XLM',
    checklist: [true, true, true],
    paymentStatus: 'paid',
    notes: 'Debugging contract errors with soroban-cli. Next: multi-party escrow pattern.',
  },
];

export function findSessionById(sessionId: string): ExtendedSession | undefined {
  return MENTOR_SESSION_FIXTURES.find((s) => s.id === sessionId);
}

/** Prior completed sessions between the same mentor and learner (for waiting-room note previews). */
export function getPriorSessionNotesForPair(
  currentSessionId: string,
  mentorId: string,
  learnerId: string,
): WaitingRoomNotePreview[] {
  return MENTOR_SESSION_FIXTURES.filter(
    (s) =>
      s.id !== currentSessionId &&
      s.status === 'completed' &&
      s.mentorId === mentorId &&
      s.learnerId === learnerId &&
      s.notes &&
      s.notes.trim().length > 0,
  )
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .map((s) => ({
      id: s.id,
      sessionDate: s.startTime.slice(0, 10),
      excerpt: s.notes!.length > 160 ? `${s.notes!.slice(0, 157)}…` : s.notes!,
    }));
}

export function sessionToWaitingRoomDetails(session: ExtendedSession): {
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  mentor: { id: string; name: string; avatarUrl?: string };
  learner: { id: string; name: string; avatarUrl?: string };
  previousNotes: WaitingRoomNotePreview[];
} {
  const mentorId = session.mentorId ?? 'mentor-unknown';
  const mentorName = session.mentorName ?? 'Your mentor';
  const mentorAvatar = session.mentorAvatar;

  return {
    topic: session.topic,
    scheduledAt: session.startTime,
    durationMinutes: session.duration,
    mentor: {
      id: mentorId,
      name: mentorName,
      avatarUrl: mentorAvatar,
    },
    learner: {
      id: session.learnerId,
      name: session.learnerName,
      avatarUrl: session.learnerAvatar,
    },
    previousNotes: getPriorSessionNotesForPair(session.id, mentorId, session.learnerId),
  };
}
