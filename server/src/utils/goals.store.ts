import { Goal, Milestone, GoalStatus } from '../types/goals.types.js';

// In-memory store for goals (development/demo only).
// In production, replace with PostgreSQL/Prisma/your ORM of choice.

class GoalsStore {
  private goals: Map<string, Goal> = new Map();

  constructor() {
    // Seed with sample data for demo
    this.seed();
  }

  private seed(): void {
    const now = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

    const goal1: Goal = {
      id: 'g1',
      userId: 'user_learner_1', // demo user
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
      createdAt: threeMonthsAgoStr,
      updatedAt: now,
      sharedWithMentor: true,
      reminderEnabled: true,
      badge: '🏆',
      notes: 'Focus on Soroban compatibility',
      linkedSessionIds: ['s1', 's2'],
      progress: 50,
      milestones: [
        { id: 'm1', title: 'Complete Solidity fundamentals course', completed: true, completedAt: '2026-03-10' },
        { id: 'm2', title: 'Build first ERC-20 token contract', completed: true, completedAt: '2026-03-18' },
        { id: 'm3', title: 'Deploy NFT marketplace contract', completed: false, dueDate: '2026-04-15' },
        { id: 'm4', title: 'Write DeFi lending protocol', completed: false, dueDate: '2026-05-30' },
      ],
      completedAt: undefined,
    };

    const goal2: Goal = {
      id: 'g2',
      userId: 'user_learner_1',
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
      createdAt: threeMonthsAgoStr,
      updatedAt: now,
      sharedWithMentor: true,
      reminderEnabled: false,
      notes: '',
      linkedSessionIds: ['s3'],
      progress: 33,
      milestones: [
        { id: 'm5', title: 'Update resume and LinkedIn', completed: true, completedAt: '2026-03-08' },
        { id: 'm6', title: 'Build 3-project portfolio', completed: false, dueDate: '2026-05-01' },
        { id: 'm7', title: 'Apply to first 10 companies', completed: false, dueDate: '2026-06-01' },
      ],
      completedAt: undefined,
    };

    const goal3: Goal = {
      id: 'g3',
      userId: 'user_learner_1',
      title: 'Stellar Ecosystem Certification',
      description: 'Become certified in Stellar SDK and Soroban development',
      category: 'certification',
      status: 'completed',
      specific: 'Pass both Stellar and Soroban certification exams',
      measurable: 'Score at least 80% on each exam',
      achievable: 'Study 5 hours/week',
      relevant: 'Required for senior blockchain positions',
      timeBound: 'Complete by Q1 2026',
      deadline: '2026-03-31',
      createdAt: '2026-01-15',
      updatedAt: '2026-03-15',
      sharedWithMentor: true,
      reminderEnabled: false,
      badge: '🎓',
      notes: 'Certificate received and added to profile',
      linkedSessionIds: ['s4', 's5', 's6'],
      progress: 100,
      milestones: [
        { id: 'm8', title: 'Complete Stellar SDK fundamentals', completed: true, completedAt: '2026-02-10' },
        { id: 'm9', title: 'Build Soroban smart contract', completed: true, completedAt: '2026-03-01' },
        { id: 'm10', title: 'Pass certification exam', completed: true, completedAt: '2026-03-15' },
      ],
      completedAt: '2026-03-15',
    };

    this.goals.set(goal1.id, goal1);
    this.goals.set(goal2.id, goal2);
    this.goals.set(goal3.id, goal3);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  getAll(userId?: string): Goal[] {
    const all = Array.from(this.goals.values());
    if (!userId) return all;
    return all.filter(g => g.userId === userId);
  }

  getById(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  create(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'linkedSessionIds' | 'progress' | 'completedAt'>): Goal {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString().split('T')[0];
    const milestoneCount = data.milestones.length;
    const completedCount = data.milestones.filter(m => m.completed).length;
    const progress = milestoneCount ? Math.round((completedCount / milestoneCount) * 100) : 0;
    const status: GoalStatus = milestoneCount && completedCount === milestoneCount ? GoalStatus.COMPLETED : GoalStatus.ACTIVE;

    const goal: Goal = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      linkedSessionIds: [],
      progress,
      completedAt: status === GoalStatus.COMPLETED ? now : undefined,
    };

    this.goals.set(id, goal);
    return goal;
  }

  update(id: string, patch: Partial<Goal>): Goal | undefined {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updated: Goal = {
      ...goal,
      ...patch,
      id: goal.id, // prevent ID mutation
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Recalculate progress from milestones
    if (patch.milestones) {
      const total = updated.milestones.length;
      const completed = updated.milestones.filter(m => m.completed).length;
      updated.progress = total ? Math.round((completed / total) * 100) : 0;
      // Auto-update status based on milestone completion
      if (updated.progress === 100 && updated.status !== GoalStatus.COMPLETED) {
        updated.status = GoalStatus.COMPLETED;
        updated.completedAt = updated.updatedAt;
      }
    }

    this.goals.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.goals.delete(id);
  }

  // ── Special operations ─────────────────────────────────────────────────────

  updateProgress(id: string, progress: number): Goal | undefined {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const clamped = Math.max(0, Math.min(100, progress));
    const updated: Goal = {
      ...goal,
      progress: clamped,
      status: clamped === 100 ? GoalStatus.COMPLETED : goal.status,
      completedAt: clamped === 100 ? new Date().toISOString().split('T')[0] : goal.completedAt,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    this.goals.set(id, updated);
    return updated;
  }

  linkSession(id: string, sessionId: string): Goal | undefined {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    if (!goal.linkedSessionIds.includes(sessionId)) {
      goal.linkedSessionIds.push(sessionId);
      goal.updatedAt = new Date().toISOString().split('T')[0];
      this.goals.set(id, { ...goal });
    }
    return goal;
  }

  unlinkSession(id: string, sessionId: string): Goal | undefined {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    goal.linkedSessionIds = goal.linkedSessionIds.filter(sid => sid !== sessionId);
    goal.updatedAt = new Date().toISOString().split('T')[0];
    this.goals.set(id, { ...goal });
    return goal;
  }

  getByUser(userId: string): Goal[] {
    return this.getAll().filter(g => g.userId === userId);
  }
}

// Singleton
export const goalsStore = new GoalsStore();
