import { Router } from 'express';
import { GoalsController } from '../controllers/goals.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ── Validation Schemas ─────────────────────────────────────────────────────────

const createGoalBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.enum(['technical', 'career', 'project', 'certification', 'soft-skills']),
  specific: z.string().min(1).max(500),
  measurable: z.string().min(1).max(500),
  achievable: z.string().min(1).max(500),
  relevant: z.string().min(1).max(500),
  timeBound: z.string().min(1).max(500),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sharedWithMentor: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  badge: z.string().optional(),
  notes: z.string().optional(),
  milestones: z.array(z.object({
    title: z.string().min(1),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })).min(1).default([]),
});

const updateGoalBody = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  category: z.enum(['technical', 'career', 'project', 'certification', 'soft-skills']).optional(),
  status: z.enum(['active', 'completed', 'paused', 'overdue']).optional(),
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

const updateProgressBody = z.object({
  progress: z.number().min(0).max(100),
});

const linkSessionBody = z.object({
  sessionId: z.string().min(1),
});

// ── Routes ─────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/goals
 * @desc    List all goals (with stats)
 * @access  Private (learner)
 */
router.get('/', GoalsController.getGoals);

/**
 * @route   GET /api/v1/goals/:id
 * @desc    Get single goal by ID
 * @access  Private
 */
router.get('/:id', GoalsController.getGoal);

/**
 * @route   POST /api/v1/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', validateRequest({ body: createGoalBody }), GoalsController.createGoal);

/**
 * @route   PATCH /api/v1/goals/:id
 * @desc    Update a goal (partial update)
 * @access  Private
 */
router.patch('/:id', validateRequest({ params: z.object({ id: z.string() }), body: updateGoalBody }), GoalsController.updateGoal);

/**
 * @route   DELETE /api/v1/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/:id', GoalsController.deleteGoal);

/**
 * @route   PUT /api/v1/goals/:id/progress
 * @desc    Update goal progress (0-100%)
 * @access  Private
 */
router.put('/:id/progress', validateRequest({ 
  params: z.object({ id: z.string() }), 
  body: updateProgressBody 
}), GoalsController.updateProgress);

/**
 * @route   POST /api/v1/goals/:id/link-session
 * @desc    Link a completed session to a goal
 * @access  Private
 */
router.post('/:id/link-session', validateRequest({ 
  params: z.object({ id: z.string() }), 
  body: linkSessionBody 
}), GoalsController.linkSession);

/**
 * @route   DELETE /api/v1/goals/:id/link-session/:sessionId
 * @desc    Unlink a session from a goal
 * @access  Private
 */
router.delete('/:id/link-session/:sessionId', GoalsController.unlinkSession);

export default router;
