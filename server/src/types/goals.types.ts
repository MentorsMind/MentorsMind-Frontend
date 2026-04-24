import { z } from 'zod';

// ── Enums ────────────────────────────────────────────────────────────────────

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  OVERDUE = 'overdue',
}

export enum GoalCategory {
  TECHNICAL = 'technical',
  CAREER = 'career',
  PROJECT = 'project',
  CERTIFICATION = 'certification',
  SOFT_SKILLS = 'soft-skills',
}

// ── Milestone ─────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
}

// ── Goal (DB entity) ─────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  specific: string;   // SMART - Specific
  measurable: string; // SMART - Measurable
  achievable: string;// SMART - Achievable
  relevant: string;  // SMART - Relevant
  timeBound: string; // SMART - Time-bound
  deadline: string;  // YYYY-MM-DD
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  sharedWithMentor: boolean;
  reminderEnabled: boolean;
  badge?: string;
  notes?: string;
  milestones: Milestone[];
  linkedSessionIds: string[]; // IDs of sessions linked to this goal
  progress: number; // 0-100 overall progress (derived from milestones but stored for quick access)
  completedAt?: string; // ISO date when marked completed
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.nativeEnum(GoalCategory),
  specific: z.string().min(1).max(500),
  measurable: z.string().min(1).max(500),
  achievable: z.string().min(1).max(500),
  relevant: z.string().min(1).max(500),
  timeBound: z.string().min(1).max(500),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sharedWithMentor: z.boolean().default(false),
  reminderEnabled: z.boolean().default(false),
  badge: z.string().optional(),
  notes: z.string().optional(),
  milestones: z.array(z.object({
    title: z.string().min(1),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })).min(1).default([]),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  category: z.nativeEnum(GoalCategory).optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  specific: z.string().min(1).max(500).optional(),
  measurable: z.string().min(1).max(500).optional(),
  achievable: z.string().min(1).max(500).optional(),
  relevant: z.string().min(1).max(500).optional(),
  timeBound: z.string().min(1).max(500).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sharedWithMentor: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  badge: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string().min(1),
    completed: z.boolean(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })).optional(),
  linkedSessionIds: z.array(z.string()).optional(),
});

export const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

export const linkSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type LinkSessionInput = z.infer<typeof linkSessionSchema>;

// ── API Responses ────────────────────────────────────────────────────────────

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

export interface GoalDetail extends Goal {
  // Extends full Goal
}

export interface GoalsListResponse {
  goals: Goal[];
  stats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
}

export interface PaginatedGoalsResponse {
  data: GoalSummary[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}
