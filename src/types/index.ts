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
  duration: number; // minutes
  status: SessionStatus;
  price: number;
  asset: AssetType;
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
  rating: number;
  comment: string;
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
