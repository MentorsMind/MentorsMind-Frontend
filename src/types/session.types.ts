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
