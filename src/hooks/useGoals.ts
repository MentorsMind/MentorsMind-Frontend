import { useState, useCallback, useMemo } from 'react';
import type { Goal, GoalStatus, GoalStats, Milestone, GoalTemplate } from '../types';

const STORAGE_KEY = 'learner_goals';

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Master Solidity Smart Contracts',
    description: 'Build production-ready smart contracts on Stellar/EVM',
    category: 'technical',
    status: 'active',
    specific: 'Complete 3 smart contract projects using Solidity',
    measurable: 'Deploy 3 contracts to testnet with full test coverage',
    achievable: 'Dedicate 10 hours/week with mentor guidance',
    relevant: 'Core skill for blockchain developer role',
    timeBound: 'Complete by end of Q2 2026',
    deadline: '2026-06-30',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-20',
    sharedWithMentor: true,
    reminderEnabled: true,
    badge: '🏆',
    milestones: [
      { id: 'm1', title: 'Complete Solidity fundamentals course', completed: true, completedAt: '2026-03-10' },
      { id: 'm2', title: 'Build first ERC-20 token contract', completed: true, completedAt: '2026-03-18' },
      { id: 'm3', title: 'Deploy NFT marketplace contract', completed: false, dueDate: '2026-04-15' },
      { id: 'm4', title: 'Write DeFi lending protocol', completed: false, dueDate: '2026-05-30' },
    ],
  },
  {
    id: 'g2',
    title: 'Land a Web3 Developer Role',
    description: 'Transition into a full-time blockchain developer position',
    category: 'career',
    status: 'active',
    specific: 'Apply to 20 Web3 companies and land 3 interviews',
    measurable: 'Track applications in spreadsheet, get 1 offer',
    achievable: 'Build portfolio + network at 2 events/month',
    relevant: 'Primary career goal for 2026',
    timeBound: 'Secure offer by September 2026',
    deadline: '2026-09-01',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-22',
    sharedWithMentor: true,
    reminderEnabled: false,
    milestones: [
      { id: 'm5', title: 'Update resume and LinkedIn', completed: true, completedAt: '2026-03-08' },
      { id: 'm6', title: 'Build 3-project portfolio', completed: false, dueDate: '2026-05-01' },
      { id: 'm7', title: 'Apply to first 10 companies', completed: false, dueDate: '2026-06-01' },
    ],
  },
];

function loadGoals(): Goal[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Goal[]) : INITIAL_GOALS;
  } catch {
    return INITIAL_GOALS;
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    saveGoals(updated);
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newGoal: Goal = { ...goal, id: `g${Date.now()}`, createdAt: now, updatedAt: now };
    persist([...goals, newGoal]);
  }, [goals, persist]);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    persist(goals.map(g => g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString().split('T')[0] } : g));
  }, [goals, persist]);

  const deleteGoal = useCallback((id: string) => {
    persist(goals.filter(g => g.id !== id));
  }, [goals, persist]);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    const now = new Date().toISOString().split('T')[0];
    persist(goals.map(g => {
      if (g.id !== goalId) return g;
      const milestones = g.milestones.map((m: Milestone) =>
        m.id === milestoneId
          ? { ...m, completed: !m.completed, completedAt: !m.completed ? now : undefined }
          : m
      );
      const allDone = milestones.every((m: Milestone) => m.completed);
      return { ...g, milestones, status: allDone ? 'completed' : g.status, updatedAt: now };
    }));
  }, [goals, persist]);

  const applyTemplate = useCallback((template: GoalTemplate) => {
    const now = new Date().toISOString().split('T')[0];
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    addGoal({
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
      milestones: template.milestones.map((m, i) => ({ ...m, id: `m${Date.now()}${i}`, completed: false })),
      sharedWithMentor: false,
      reminderEnabled: false,
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
  }, [addGoal]);

  const filteredGoals = useMemo(() =>
    filterStatus === 'all' ? goals : goals.filter(g => g.status === filterStatus),
    [goals, filterStatus]
  );

  const stats: GoalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const active = goals.filter(g => g.status === 'active').length;
    const overdue = goals.filter(g => g.status === 'overdue' || (g.status === 'active' && g.deadline < new Date().toISOString().split('T')[0])).length;
    return { total, completed, active, overdue, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }, [goals]);

  return {
    goals, filteredGoals, stats,
    editingGoal, setEditingGoal,
    filterStatus, setFilterStatus,
    addGoal, updateGoal, deleteGoal,
    toggleMilestone, applyTemplate,
  };
}
