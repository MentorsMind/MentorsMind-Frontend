export interface Review {
  id: string;
  mentorId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  isVerified: boolean;
  mentorResponse?: {
    text: string;
    date: string;
  };
  isFlagged?: boolean;
}

export interface RatingDistribution {
  star: number;
  count: number;
}

export interface RatingStats {
  average: number;
  totalReviews: number;
  distribution: RatingDistribution[];
  trends: {
    labels: string[];
    values: number[];
  };
}

export type OnboardingStepId =
  | "profile"
  | "wallet"
  | "availability"
  | "pricing"
  | "tutorial"
  | "complete";

export type LearnerStepId =
  | "goals"
  | "assessment"
  | "matching"
  | "wallet"
  | "tutorial"
  | "complete";

export interface LearnerGoal {
  id: string;
  label: string;
  icon: string;
}

export interface SkillLevel {
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
}

export interface MentorMatch {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  hourlyRate: number;
  matchScore: number;
  avatar: string;
}

export interface LearnerOnboardingState {
  currentStep: LearnerStepId;
  completedSteps: LearnerStepId[];
  isDismissed: boolean;
  isCelebrated: boolean;
  data: {
    goals?: string[];
    skills?: SkillLevel[];
    selectedMentor?: string;
    wallet?: { address: string; connected: boolean };
  };
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export type AssetCode = "XLM" | "USDC" | "yXLM";

export interface WalletAsset {
  code: AssetCode;
  balance: number;
  usdValue: number;
}

export type TxType = "earning" | "payout" | "fee" | "refund";
export type TxStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  asset: AssetCode;
  usdAmount: number;
  description: string;
  sessionId?: string;
  date: string;
  fee?: number;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  asset: AssetCode;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  txHash?: string;
}

export interface EarningsBySession {
  sessionId: string;
  studentName: string;
  topic: string;
  date: string;
  duration: number; // minutes
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  asset: AssetCode;
}

export interface WalletState {
  address: string;
  assets: WalletAsset[];
  pendingEarnings: number;
  availableEarnings: number;
  totalEarned: number;
  transactions: Transaction[];
  payoutHistory: PayoutRequest[];
  sessionEarnings: EarningsBySession[];
  forecastNextMonth: number;
  platformFeeRate: number; // e.g. 0.05 = 5%
}

export interface OnboardingState {
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  isDismissed: boolean;
  isCelebrated: boolean;
  data: {
    profile?: {
      bio: string;
      specialization: string;
    };
    wallet?: {
      address: string;
      connected: boolean;
    };
    availability?: {
      timezone: string;
      slots: string[];
    };
    pricing?: {
      hourlyRate: number;
      currency: string;
    };
  };
}

// ── Learning Goals ────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused' | 'overdue';
export type GoalCategory = 'technical' | 'career' | 'project' | 'certification' | 'soft-skills';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  // SMART fields
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  // Progress
  milestones: Milestone[];
  deadline: string;
  createdAt: string;
  updatedAt: string;
  sharedWithMentor: boolean;
  reminderEnabled: boolean;
  badge?: string;
  notes?: string;
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  icon: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  milestones: Omit<Milestone, 'id' | 'completed' | 'completedAt'>[];
}

export interface GoalStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  completionRate: number;
}


export type SessionStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled";

export interface Session {
  id: string;
  learnerId: string;
  learnerName: string;
  topic: string;
  startTime: string;
  duration: number; // in minutes
  status: SessionStatus;
  price: number;
  currency: string;
  meetingLink?: string;
}

export interface EarningsData {
  totalEarned: number;
  pendingPayout: number;
  history: {
    date: string;
    amount: number;
  }[];
}

export interface Activity {
  id: string;
  type: "booking" | "payment" | "review" | "system";
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

export interface MentorDashboardData {
  upcomingSessions: Session[];
  earnings: EarningsData;
  performance: {
    averageRating: number;
    completionRate: number;
    totalSessions: number;
  };
  recentReviews: Review[];
  activities: Activity[];
  profileCompletion: number;
  pendingMessagesCount: number;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentTransaction {
  id: string;
  type: "session" | "subscription" | "refund";
  mentorId: string;
  mentorName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string; // ISO date string
  stellarTxHash: string;
  description: string;
  sessionId?: string;
  sessionTopic?: string;
}

export interface PaymentAnalytics {
  totalSpent: number;
  totalCompleted: number;
  totalPending: number;
  totalRefunded: number;
  totalFailed: number;
  transactionCount: number;
}

export type ReminderType = "email" | "sms" | "in-app" | "prep" | "calendar";
export type ReminderStatus = "pending" | "sent" | "snoozed" | "cancelled";

export interface ReminderSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  customTimes: number[]; // minutes before session (e.g., 60, 1440)
  sessionPrepReminders: boolean;
  calendarSyncReminders: boolean;
  mentorSpecificPreferences: Record<string, Partial<ReminderSettings>>;
}

export interface Reminder {
  id: string;
  sessionId: string;
  type: ReminderType;
  scheduledTime: string; // ISO date string
  status: ReminderStatus;
  snoozeCount: number;
  lastSnoozedAt?: string;
  message: string;
}

export interface ReminderHistoryItem extends Reminder {
  sentAt: string;
}

// Mentor Search & Discovery Types
export interface MentorProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  hourlyRate: number;
  currency: string;
  rating: number;
  reviewCount: number;
  totalSessions: number;
  completionRate: number;
  skills: string[];
  expertise: string[];
  languages: string[];
  availability: {
    days: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']
    timeSlots: string[]; // e.g., ['9:00-12:00', '14:00-17:00']
    timezone: string;
  };
  experienceYears: number;
  certifications?: string[];
  isAvailable: boolean;
  responseTime?: string; // e.g., 'Within 2 hours'
  joinedDate: string;
}

export interface SearchFilters {
  searchQuery: string;
  skills: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availabilityDays: string[];
  languages: string[];
  sortBy: "rating" | "price_low" | "price_high" | "experience" | "sessions";
}

export interface SearchResult {
  mentors: MentorProfile[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface RecentlyViewedMentor {
  mentorId: string;
  viewedAt: string;
  mentor: MentorProfile;
}

export type UserRole = 'mentor' | 'learner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Session History Types
export type {
  SessionHistoryItem,
  LearningAnalytics,
  SkillProgress,
  MentorInteraction,
  SessionFrequencyData,
  LearningVelocityData,
  SpendingAnalytics,
  BookingSessionType,
  AvailabilitySlot,
  BookingDraft,
  BookingPricingBreakdown,
  CalendarInvite,
  LearnerCalendarEvent,
  BookingConfirmationDetails,
  RecommendedMentor,
  LearningPathRecommendation,
  LearningPathStep,
  RecommendationReason,
  SuccessStory,
  SkillRoadmapItem,
  RecommendedTopic,
  AgendaTemplateOption,
  PrepChecklistItem,
  UploadedResource,
  MentorResearchProfile,
  SessionPrepState,
  ProgressGoal,
  SkillProgressTrendPoint,
  AchievementBadge,
  LearningProgressData,
  NoteTemplate,
  NoteAttachment,
  NoteVersion,
  BookmarkedResource,
  LearnerNote,
  FeedbackCategoryRatings,
  SessionFeedbackEntry
} from "./session.types";

export * from "./pricing.types";
