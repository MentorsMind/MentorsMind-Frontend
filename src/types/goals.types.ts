// Goals feature types (shared between frontend and backend conceptually)
// These types are used in components, hooks, and services.

export type GoalStatus = 'active' | 'completed' | 'paused' | 'overdue';
export type GoalCategory = 'technical' | 'career' | 'project' | 'certification' | 'soft-skills';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  deadline: string; // YYYY-MM-DD
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  sharedWithMentor: boolean;
  reminderEnabled: boolean;
  badge?: string;
  notes?: string;
  milestones: Milestone[];
  linkedSessionIds: string[];
  progress: number; // 0-100
  completedAt?: string; // ISO date
}

// Summary for dashboard list views
export interface GoalSummary {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  deadline: string;
  progress: number;
  linkedSessionCount: number;
  createdAt: string;
  completedAt?: string;
}

// Stats for the stats bar
export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

// API response for GET /goals
export interface GoalsListResponse {
  goals: Goal[];
  stats: GoalStats;
}

// Create/update DTOs (what gets sent to backend)
export interface CreateGoalPayload {
  title: string;
  description: string;
  category: GoalCategory;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  deadline: string;
  sharedWithMentor?: boolean;
  reminderEnabled?: boolean;
  badge?: string;
  notes?: string;
  milestones?: Partial<Milestone>[]; // omit id/completedAt on create
}

export interface UpdateGoalPayload extends Partial<Omit<CreateGoalPayload, 'milestones'>> {
  status?: GoalStatus;
  milestones?: Milestone[]; // full milestone objects with ids on update
  linkedSessionIds?: string[];
}

export interface UpdateProgressPayload {
  progress: number; // 0-100
}

export interface LinkSessionPayload {
  sessionId: string;
}

// Goal template (for quick-create)
export interface GoalTemplate {
  id: string;
  icon: string;
  title: string;
  category: GoalCategory;
  description: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  milestones: { title: string; dueDate?: string }[];
}
