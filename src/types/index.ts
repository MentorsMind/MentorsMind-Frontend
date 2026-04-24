import type { Goal, GoalStatus, GoalCategory, Milestone, GoalSummary, GoalStats, CreateGoalPayload, UpdateGoalPayload, UpdateProgressPayload, LinkSessionPayload, GoalTemplate } from './goals.types.js';
import type { PaymentStatus } from './payment.types';

export type { Goal, GoalStatus, GoalCategory, Milestone, GoalSummary, GoalStats, CreateGoalPayload, UpdateGoalPayload, UpdateProgressPayload, LinkSessionPayload, GoalTemplate };
export * from './payment.types';

// Global shared types

export type Priority = 'high' | 'medium' | 'low';
export type UserRole = 'mentor' | 'learner' | 'admin';
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
export type AssetType = 'XLM' | 'USDC' | 'PYUSD';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  stellarPublicKey?: string;
  createdAt: string;
  /** Whether the user has MFA (TOTP) enabled */
  mfaEnabled?: boolean;
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string | null;
}

export interface Mentor extends User {
  bio: string;
  skills: string[];
  hourlyRate: number;
  currency: AssetType;
  rating: number;
  reviewCount: number;
  sessionCount: number;
  isVerified: boolean;
  timezone: string;
  languages: string[];
}

export interface Learner extends User {
  learningGoals: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
}

export interface Session {
  id: string;
  mentorId: string;
  learnerId: string;
  mentor?: Mentor;
  learner?: Learner;
  scheduledAt: string;
  startTime?: string; // alias for scheduledAt if used
  duration: number; // minutes
  status: SessionStatus;
  price: number;
  asset: AssetType;
  currency?: AssetType; // alias for asset
  topic?: string;
  learnerName?: string;
  notes?: string;
  meetingUrl?: string;
}

export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  asset: AssetType;
  status: PaymentStatus;
  stellarTxHash?: string;
  escrowId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  mentorId: string;
  learnerId: string;
  reviewerId?: string;
  rating: number;
  comment: string;
  helpfulCount?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'session' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Hooks generic types
export interface SessionHistoryItem { id: string; [key: string]: any; }
export interface AchievementBadge { id: string; title: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string; }
export interface LearningProgressData {
  sessionsCompleted: number;
  timeInvestedHours: number;
  learningStreakDays: number;
  goalCompletionRate: number;
  peerComparison: number;
  milestoneCelebration: string;
  skillProgression: { label: string; [key: string]: string | number }[];
  goals: { id: string; title: string; completedSteps: number; totalSteps: number; dueInWeeks: number }[];
  achievements: AchievementBadge[];
}
export interface LearningPathRecommendation { id: string; title: string; description: string; skills: string[]; estimatedHours: number; }
export interface RecommendedMentor { id: string; name: string; avatarUrl?: string; matchScore: number; topSkills: string[]; hourlyRate: number; }
export interface Reminder { id: string; type: string; title: string; message: string; scheduledFor: string; isRead: boolean; }
export interface ReminderSettings { emailEnabled: boolean; pushEnabled: boolean; customTimes: number[]; }
export interface ReminderHistoryItem { id: string; reminderId: string; sentAt: string; status: 'sent' | 'failed'; }
export type ReminderType = 'session' | 'goal' | 'system';
export interface AvailabilitySlot { id: string; startTime: string; endTime: string; isBooked: boolean; }
export interface TimeSlot { startTime: string; endTime: string; }
export interface MentorMatch { mentor: Mentor; score: number; reasons: string[]; }
export interface BookingPayload { mentorId: string; startTime: string; duration: number; topic: string; notes?: string; }
export interface CancelPayload { sessionId: string; reason: string; }
export interface ReschedulePayload { sessionId: string; newStartTime: string; reason: string; }
export interface GoalsListResponse { data: Goal[]; total: number; }
export interface AssetCode {}
export interface SkillLevel {}
export interface AgendaTemplateOption { id: string; title: string; items: string[]; }
export interface MentorResearchProfile { linkedinUrl?: string; githubUrl?: string; pastSessionsCount: number; commonTopics: string[]; }
export interface PrepChecklistItem { id: string; text: string; isCompleted: boolean; }
export interface SessionPrepState { session: Session; checklist: PrepChecklistItem[]; resources: UploadedResource[]; }
export interface UploadedResource { id: string; name: string; url: string; size: number; }
export interface RatingStats { average: number; count: number; breakdown: Record<number, number>; }
