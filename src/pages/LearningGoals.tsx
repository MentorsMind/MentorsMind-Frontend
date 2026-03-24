import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import GoalSetting from '../components/learner/GoalSetting';
import GoalTemplates from '../components/learner/GoalTemplates';
import MilestoneTracker from '../components/learner/MilestoneTracker';
import type { Goal, GoalStatus, GoalCategory } from '../types';

const STATUS_STYLES: Record<GoalStatus, string> = {
  active: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  paused: 'bg-gray-100 text-gray-500',
  overdue: 'bg-red-50 text-red-500',
};

const CATEGORY_ICONS: Record<GoalCategory, string> = {
  technical: '💻', career: '💼', project: '🚀', certification: '🎓', 'soft-skills': '🗣️',
};

const BADGES: Record<number, { icon: string; label: string }> = {
  1: { icon: '🌱', label: 'First Goal' },
  3: { icon: '🔥', label: 'On a Roll' },
  5: { icon: '⭐', label: 'Goal Setter' },
  10: { icon: '🏆', label: 'Champion' },
};

const FILTERS: { label: string; value: GoalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Overdue', value: 'overdue' },
];

const LearningGoals: React.FC = () => {
  const {
    filteredGoals, stats,
    editingGoal, setEditingGoal,
    filterStatus, setFilterStatus,
    addGoal, updateGoal, deleteGoal,
    toggleMilestone, applyTemplate,
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const earnedBadge = BADGES[stats.completed];

  const handleSave = (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
      setEditingGoal(null);
    } else {
      addGoal(data);
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Learning Goals</h2>
          <p className="text-gray-500">Set SMART goals and track your progress.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowTemplates((t: boolean) => !t); setShowForm(false); setEditingGoal(null); }}
            className="px-4 py-2.5 border-2 border-stellar/20 text-stellar font-bold rounded-xl text-sm hover:bg-stellar/5 transition-all"
          >
            Templates
          </button>
          <button
            onClick={() => { setShowForm((t: boolean) => !t); setShowTemplates(false); setEditingGoal(null); }}
            className="px-4 py-2.5 bg-stellar text-white font-bold rounded-xl text-sm hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all active:scale-95"
          >
            + New Goal
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: stats.total, color: 'text-gray-900' },
          { label: 'Active', value: stats.active, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'text-stellar' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Badge notification */}
      {earnedBadge && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3" role="status">
          <span className="text-2xl">{earnedBadge.icon}</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Badge Earned: {earnedBadge.label}</p>
            <p className="text-xs text-amber-600">You've completed {stats.completed} goal{stats.completed !== 1 ? 's' : ''}. Keep going!</p>
          </div>
        </div>
      )}

      {/* Templates panel */}
      {showTemplates && (
        <GoalTemplates onApply={applyTemplate} onClose={() => setShowTemplates(false)} />
      )}

      {/* New goal form */}
      {showForm && !editingGoal && (
        <GoalSetting onSave={handleSave} onCancel={() => setShowForm(false)} initial={null} />
      )}

      {/* Edit form */}
      {editingGoal && (
        <GoalSetting onSave={handleSave} onCancel={() => setEditingGoal(null)} initial={editingGoal} />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === f.value ? 'bg-stellar text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Goal cards */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold">No goals yet</p>
          <p className="text-sm mt-1">Create a goal or pick a template to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal: Goal) => {
            const completedMilestones = goal.milestones.filter((m: import('../types').Milestone) => m.completed).length;
            const pct = goal.milestones.length ? Math.round((completedMilestones / goal.milestones.length) * 100) : 0;
            const isExpanded = expandedGoal === goal.id;
            const isOverdue = goal.status === 'active' && goal.deadline < new Date().toISOString().split('T')[0];

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl mt-0.5 shrink-0">{CATEGORY_ICONS[goal.category]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{goal.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[isOverdue ? 'overdue' : goal.status]}`}>
                            {isOverdue ? 'overdue' : goal.status}
                          </span>
                          {goal.sharedWithMentor && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">Shared</span>
                          )}
                          {goal.reminderEnabled && (
                            <span className="text-[10px]" title="Reminders on" aria-label="Reminders enabled">🔔</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{goal.description}</p>

                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-stellar'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">{pct}%</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {completedMilestones}/{goal.milestones.length} milestones · Due {goal.deadline}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-xs font-bold"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse goal' : 'Expand goal'}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                      <button
                        onClick={() => { setEditingGoal(goal); setShowForm(false); setShowTemplates(false); }}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-stellar transition-colors text-xs"
                        aria-label="Edit goal"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-xs"
                        aria-label="Delete goal"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded: SMART details + milestones */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50">
                    {/* SMART breakdown */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">SMART Breakdown</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { label: 'Specific', value: goal.specific },
                          { label: 'Measurable', value: goal.measurable },
                          { label: 'Achievable', value: goal.achievable },
                          { label: 'Relevant', value: goal.relevant },
                          { label: 'Time-Bound', value: goal.timeBound },
                        ].map(item => (
                          <div key={item.label} className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-stellar uppercase mb-1">{item.label}</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{item.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Milestones</h4>
                      <MilestoneTracker
                        milestones={goal.milestones}
                        onToggle={(mid: string) => toggleMilestone(goal.id, mid)}
                      />
                    </div>

                    {/* Notes */}
                    {goal.notes && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{goal.notes}</p>
                      </div>
                    )}

                    {/* Status controls */}
                    <div className="flex gap-2 flex-wrap">
                      {(['active', 'paused', 'completed'] as GoalStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateGoal(goal.id, { status: s })}
                          disabled={goal.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                            goal.status === s ? 'bg-stellar text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-stellar/30'
                          }`}
                        >
                          Mark {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningGoals;
