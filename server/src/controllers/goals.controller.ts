import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.utils.js';
import { goalsStore } from '../utils/goals.store.js';
import {
  Goal,
  GoalCategory,
  GoalStatus,
  CreateGoalInput,
  UpdateGoalInput,
  UpdateProgressInput,
  LinkSessionInput,
  GoalsListResponse,
  GoalSummary,
} from '../types/goals.types.js';
import { z } from 'zod';

export class GoalsController {
  // ── List goals (with optional user filter) ──────────────────────────────────

  static async getGoals(req: Request, res: Response): Promise<Response> {
    try {
      // In a real app, `req.user.id` would come from JWT auth middleware
      // For now, we return all goals (demo)
      const goals = goalsStore.getAll();

      const stats = this.calculateStats(goals);

      // Return full goal objects (not summaries) so frontend has all data including milestones, linkedSessionIds
      return ResponseUtil.success(res, { goals, stats });
    } catch (error) {
      console.error('Get goals error:', error);
      return ResponseUtil.internalError(res, 'Failed to fetch goals', error);
    }
  }
  }

  // ── Get single goal ─────────────────────────────────────────────────────────

  static async getGoal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const goal = goalsStore.getById(id);

      if (!goal) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      // TODO: Verify ownership via req.user.id

      return ResponseUtil.success(res, goal);
    } catch (error) {
      console.error('Get goal error:', error);
      return ResponseUtil.internalError(res, 'Failed to fetch goal', error);
    }
  }

  // ── Create goal ─────────────────────────────────────────────────────────────

  static async createGoal(req: Request, res: Response): Promise<Response> {
    try {
      const body: CreateGoalInput = req.body;

      // Transform milestones: strip IDs (server generates them)
      const milestones = body.milestones.map(m => ({
        id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: m.title,
        completed: false,
        dueDate: m.dueDate,
      }));

      // TODO: Use req.user.id when auth middleware is in place
      const userId = req.user?.id || 'anonymous';

      const goal = goalsStore.create({
        ...body,
        milestones,
        userId,
      });

      return ResponseUtil.created(res, goal);
    } catch (error) {
      console.error('Create goal error:', error);
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }
      return ResponseUtil.internalError(res, 'Failed to create goal', error);
    }
  }

  // ── Update goal ─────────────────────────────────────────────────────────────

  static async updateGoal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const patch: UpdateGoalInput = req.body;

      // If milestones are being updated, ensure they have IDs (client sends full objects)
      const existing = goalsStore.getById(id);
      if (!existing) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      // TODO: Verify ownership via req.user.id

      const updated = goalsStore.update(id, patch);

      if (!updated) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      return ResponseUtil.success(res, updated);
    } catch (error) {
      console.error('Update goal error:', error);
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }
      return ResponseUtil.internalError(res, 'Failed to update goal', error);
    }
  }

  // ── Delete goal ─────────────────────────────────────────────────────────────

  static async deleteGoal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = goalsStore.delete(id);
      if (!deleted) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      return ResponseUtil.noContent(res);
    } catch (error) {
      console.error('Delete goal error:', error);
      return ResponseUtil.internalError(res, 'Failed to delete goal', error);
    }
  }

  // ── Update progress (PUT /goals/:id/progress) ───────────────────────────────

  static async updateProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { progress } = req.body as UpdateProgressInput;

      // Validate progress with Zod
      const parsed = UpdateProgressInput.parse ? UpdateProgressInput.parse({ progress }) : { progress };
      // We already have req.body validated by middleware, but double-check
      const clamped = Math.max(0, Math.min(100, progress));

      const goal = goalsStore.updateProgress(id, clamped);
      if (!goal) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      return ResponseUtil.success(res, { goalId: id, progress: clamped });
    } catch (error) {
      console.error('Update progress error:', error);
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }
      return ResponseUtil.internalError(res, 'Failed to update progress', error);
    }
  }

  // ── Link session (POST /goals/:id/link-session) ─────────────────────────────

  static async linkSession(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { sessionId } = req.body as LinkSessionInput;

      const goal = goalsStore.linkSession(id, sessionId);
      if (!goal) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      return ResponseUtil.success(res, { goalId: id, sessionId, linked: true });
    } catch (error) {
      console.error('Link session error:', error);
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return ResponseUtil.validationError(res, validationErrors);
      }
      return ResponseUtil.internalError(res, 'Failed to link session', error);
    }
  }

  // ── Unlink session (DELETE /goals/:id/link-session/:sessionId) ──────────────

  static async unlinkSession(req: Request, res: Response): Promise<Response> {
    try {
      const { id, sessionId } = req.params;

      const goal = goalsStore.unlinkSession(id, sessionId);
      if (!goal) {
        return ResponseUtil.notFound(res, 'Goal not found');
      }

      return ResponseUtil.success(res, { goalId: id, sessionId, unlinked: true });
    } catch (error) {
      console.error('Unlink session error:', error);
      return ResponseUtil.internalError(res, 'Failed to unlink session', error);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private static toSummary(goal: Goal): GoalSummary {
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      status: goal.status as GoalStatus,
      deadline: goal.deadline,
      progress: goal.progress,
      linkedSessionCount: goal.linkedSessionIds.length,
      createdAt: goal.createdAt,
      completedAt: goal.completedAt,
    };
  }

  private static calculateStats(goals: Goal[]): GoalsListResponse['stats'] {
    const total = goals.length;
    const completed = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const active = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
    const overdue = goals.filter(g => {
      if (g.status === GoalStatus.COMPLETED) return false;
      return g.deadline < new Date().toISOString().split('T')[0];
    }).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, overdue, completionRate };
  }
}
