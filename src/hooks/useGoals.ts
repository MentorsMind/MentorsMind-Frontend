import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Goal, GoalStatus, GoalStats, Milestone, GoalTemplate, CreateGoalPayload, UpdateGoalPayload } from '../types';
import GoalsService from '../services/goals.service';

const goalsService = new GoalsService();

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals from API
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await goalsService.getGoals();
      setGoals(response.goals);
    } catch (err: any) {
      console.error('Failed to fetch goals:', err);
      setError(err?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Persist to localStorage (simple cache for offline/quick reload)
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('learner_goals', JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'linkedSessionIds' | 'progress' | 'completedAt'>) => {
    try {
      const payload: CreateGoalPayload = {
        title: goal.title,
        description: goal.description,
        category: goal.category,
        specific: goal.specific,
        measurable: goal.measurable,
        achievable: goal.achievable,
        relevant: goal.relevant,
        timeBound: goal.timeBound,
        deadline: goal.deadline,
        sharedWithMentor: goal.sharedWithMentor,
        reminderEnabled: goal.reminderEnabled,
        badge: goal.badge,
        notes: goal.notes,
        milestones: goal.milestones.map(m => ({ title: m.title, dueDate: m.dueDate })),
      };
      const newGoal = await goalsService.createGoal(payload);
      setGoals(prev => [...prev, newGoal]);
      return newGoal;
    } catch (err: any) {
      console.error('Failed to create goal:', err);
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, patch: UpdateGoalPayload) => {
    try {
      const updated = await goalsService.updateGoal(id, patch);
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      if (editingGoal?.id === id) {
        setEditingGoal(updated);
      }
      return updated;
    } catch (err: any) {
      console.error('Failed to update goal:', err);
      throw err;
    }
  }, [editingGoal]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalsService.deleteGoal(id);
      // GoalController.delete returns 204 No Content - remove from local state based on request ID
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      console.error('Failed to delete goal:', err);
      throw err;
    }
  }, []);

  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const milestones = goal.milestones.map(m =>
        m.id === milestoneId
          ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString().split('T')[0] : undefined }
          : m
      );

      const updatedGoal = await goalsService.updateGoal(goalId, { milestones });
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
    } catch (err: any) {
      console.error('Failed to toggle milestone:', err);
      throw err;
    }
  }, [goals]);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    try {
      const result = await goalsService.updateProgress(id, progress);
      // Refetch goals to get updated state including auto-status changes
      await fetchGoals();
      return result;
    } catch (err: any) {
      console.error('Failed to update progress:', err);
      throw err;
    }
  }, [fetchGoals]);

  const linkSession = useCallback(async (id: string, sessionId: string) => {
    try {
      const result = await goalsService.linkSession(id, sessionId);
      // Refetch to get updated session count
      await fetchGoals();
      return result;
    } catch (err: any) {
      console.error('Failed to link session:', err);
      throw err;
    }
  }, [fetchGoals]);

  const unlinkSession = useCallback(async (id: string, sessionId: string) => {
    try {
      await goalsService.unlinkSession(id, sessionId);
      await fetchGoals();
    } catch (err: any) {
      console.error('Failed to unlink session:', err);
      throw err;
    }
  }, [fetchGoals]);

  const applyTemplate = useCallback(async (template: GoalTemplate) => {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    const newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'linkedSessionIds' | 'progress' | 'completedAt'> = {
      title: template.title,
      description: template.description,
      category: template.category,
      status: 'active',
      specific: template.specific,
      measurable: template.measurable,
      achievable: template.achievable,
      relevant: template.relevant,
      timeBound: `Complete by ${deadline.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      deadline: deadline.toISOString().split('T')[0],
      milestones: template.milestones.map(m => ({ id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, title: m.title, completed: false, dueDate: m.dueDate })),
      userId: '', // Will be set by backend
      sharedWithMentor: false,
      reminderEnabled: false,
      notes: '',
    };
    return addGoal(newGoal);
  }, [addGoal]);

  const filteredGoals = useMemo(() =>
    filterStatus === 'all' ? goals : goals.filter(g => g.status === filterStatus),
    [goals, filterStatus]
  );

  // Separate active vs completed goals
  const { activeGoals, completedGoals } = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    const active: Goal[] = [];
    const completed: Goal[] = [];
    for (const g of goals) {
      if (g.status === 'completed') {
        completed.push(g);
      } else {
        const isOverdue = g.deadline < now;
        active.push(isOverdue ? { ...g, status: 'overdue' as const } : g);
      }
    }
    return { activeGoals: active, completedGoals: completed };
  }, [goals]);

  const stats: GoalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const overdue = goals.filter(g => {
      if (g.status === 'completed') return false;
      return g.deadline < new Date().toISOString().split('T')[0];
    }).length;
    return { total, completed, active, overdue, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }, [goals]);

  return {
    goals,
    activeGoals,
    completedGoals,
    filteredGoals,
    stats,
    editingGoal,
    setEditingGoal,
    filterStatus,
    setFilterStatus,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    updateProgress,
    linkSession,
    unlinkSession,
    applyTemplate,
    refresh: fetchGoals,
  };
}
