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
  skills: string[];
  amount: number;
  currency: string;
  outcome?: 'excellent' | 'good' | 'needs-improvement';
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
