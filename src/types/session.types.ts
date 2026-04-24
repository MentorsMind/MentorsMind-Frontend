export interface SessionHistoryItem {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  topic: string;
  date: string;
  duration: number;
  status: 'completed' | 'cancelled' | 'no-show';
  rating?: number;
  notes?: string;
  sharedNotes?: string;
  skills: string[];
  amount: number;
  currency: string;
  outcome?: 'excellent' | 'good' | 'needs-improvement';
}

export interface ExtendedSession {
  notes?: string;
  cancelReason?: string;
  checklist: boolean[];
  feedback?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  learnerAvatar?: string;
  learnerBio?: string;
}

export interface LearningAnalytics {
  totalSessions: number;
  totalTimeInvested: number; // in minutes
  totalSpent: number;
  averageSessionDuration: number;
  completionRate: number;
  skillProgress: SkillProgress[];
  mentorInteractions: MentorInteraction[];
  sessionFrequency: SessionFrequencyData;
  learningVelocity: LearningVelocityData;
  spendingAnalytics: SpendingAnalytics;
}

export interface SkillProgress {
  skill: string;
  sessionsCount: number;
  timeInvested: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
}

export interface MentorInteraction {
  mentorId: string;
  mentorName: string;
  sessionsCount: number;
  totalTime: number;
  averageRating: number;
  lastSession: string;
}

export interface SessionFrequencyData {
  labels: string[];
  values: number[];
}

export interface LearningVelocityData {
  weeklyAverage: number;
  monthlyTrend: number;
  consistencyScore: number;
}

export interface SpendingAnalytics {
  byMentor: { name: string; amount: number }[];
  bySkill: { skill: string; amount: number }[];
  monthlyTrend: { month: string; amount: number }[];
}

export type BookingSessionType = '1:1' | 'group' | 'workshop';

export interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  label: string;
  dateLabel: string;
  dateKey: string;
  timezone: string;
}

export interface BookingDraft {
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  sessionType: BookingSessionType;
  duration: number;
  notes: string;
  selectedSlot?: AvailabilitySlot;
}

export interface BookingPricingBreakdown {
  hourlyRate: number;
  duration: number;
  baseAmount: number;
  sessionTypeMultiplier: number;
  sessionTypeFee: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
}

export interface CalendarInvite {
  filename: string;
  content: string;
}

export interface LearnerCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  mentorName: string;
  notes: string;
  status: 'scheduled';
}

export interface BookingConfirmationDetails {
  sessionId: string;
  mentorId: string;
  mentorName: string;
  sessionType: BookingSessionType;
  duration: number;
  notes: string;
  slot: AvailabilitySlot;
  pricing: BookingPricingBreakdown;
  calendarInvite: CalendarInvite;
  learnerCalendarEvent: LearnerCalendarEvent;
  paymentTransactionHash?: string;
}

export interface RecommendationReason {
  title: string;
  detail: string;
}

export interface SuccessStory {
  learnerName: string;
  startingPoint: string;
  outcome: string;
  timeframeWeeks: number;
}

export interface RecommendedMentor {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  matchScore: number;
  hourlyRate: number;
  currency: string;
  skills: string[];
  whyRecommended: RecommendationReason[];
  successStory: SuccessStory;
  estimatedWeeksToGoal: number;
  feedback?: 'helpful' | 'not-helpful';
  bookmarked: boolean;
}

export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  durationWeeks: number;
  status: 'recommended' | 'in-progress' | 'next';
  resources: string[];
}

export interface SkillRoadmapItem {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'intermediate' | 'advanced' | 'expert';
  progress: number;
  milestone: string;
}

export interface RecommendedTopic {
  id: string;
  title: string;
  type: 'topic' | 'course' | 'workshop';
  duration: string;
  reason: string;
}

export interface LearningPathRecommendation {
  id: string;
  title: string;
  goal: string;
  estimatedWeeks: number;
  explanation: string;
  steps: LearningPathStep[];
  roadmap: SkillRoadmapItem[];
  topics: RecommendedTopic[];
  bookmarked: boolean;
}

export interface AgendaTemplateOption {
  id: string;
  title: string;
  description: string;
  agenda: string[];
}

export interface PrepChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface UploadedResource {
  id: string;
  name: string;
  sizeLabel: string;
  kind: 'document' | 'image' | 'link' | 'code';
}

export interface MentorResearchProfile {
  mentorName: string;
  specialties: string[];
  recentFocus: string[];
  sessionStyle: string;
  responseTime: string;
}

export interface SessionPrepState {
  selectedTemplateId: string;
  goals: string;
  objectives: string;
  agendaNotes: string;
  checklist: PrepChecklistItem[];
  uploadedResources: UploadedResource[];
  previousSessionNotes: string[];
  reminderSummary: string;
  timeManagementTips: string[];
  mentorResearch: MentorResearchProfile;
  progress: number;
}

export interface ProgressGoal {
  id: string;
  title: string;
  completedSteps: number;
  totalSteps: number;
  dueInWeeks: number;
}

export interface SkillProgressTrendPoint {
  label: string;
  stellar: number;
  soroban: number;
  product: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface LearningProgressData {
  sessionsCompleted: number;
  timeInvestedHours: number;
  learningStreakDays: number;
  goalCompletionRate: number;
  peerComparison?: number;
  skillProgression: SkillProgressTrendPoint[];
  goals: ProgressGoal[];
  achievements: AchievementBadge[];
  milestoneCelebration?: string;
}

export interface NoteTemplate {
  id: string;
  title: string;
  content: string;
}

export interface NoteAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
}

export interface NoteVersion {
  id: string;
  savedAt: string;
  content: string;
}

export interface BookmarkedResource {
  id: string;
  title: string;
  url: string;
  tags: string[];
}

export interface LearnerNote {
  id: string;
  sessionId: string;
  sessionTitle: string;
  mentorName: string;
  content: string;
  tags: string[];
  sharedWithMentor: boolean;
  sharedWithLearner?: boolean;
  reminder?: string;
  attachments: NoteAttachment[];
  resourceLinks: ResourceLink[];
  versions: NoteVersion[];
  updatedAt: string;
}

export interface FeedbackCategoryRatings {
  communication: number;
  knowledge: number;
  helpfulness: number;
}

export interface SessionFeedbackEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  mentorName: string;
  rating: number;
  categories: FeedbackCategoryRatings;
  review: string;
  improvementSuggestions: string;
  anonymous: boolean;
  submittedAt: string;
}
