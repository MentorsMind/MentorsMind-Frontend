import { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import GoalCard from '../components/learner/GoalCard';
import GoalTemplates from '../components/learner/GoalTemplates';
import AddGoalModal from '../components/learner/AddGoalModal';
import GoalEditModal from '../components/learner/GoalEditModal';
import type { Goal, GoalTemplate } from '../types';

// Empty state SVG illustration — clean goal/goal tracking theme
const EmptyStateIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-48 h-40 mx-auto opacity-90" aria-hidden="true">
    <rect x="20" y="20" width="160" height="120" rx="12" fill="#f3f4f6" />
    <circle cx="60" cy="60" r="20" fill="#e0e7ff" />
    <path d="M60 54 L64 58 L56 58 Z" fill="white" />
    <rect x="100" y="50" width="60" height="12" rx="6" fill="#d1d5db" />
    <rect x="100" y="70" width="40" height="8" rx="4" fill="#e5e7eb" />
    <rect x="20" y="100" width="80" height="12" rx="6" fill="#d1d5db" />
    <rect x="20" y="118" width="60" height="8" rx="4" fill="#e5e7eb" />
    <rect x="20" y="138" width="70" height="8" rx="4" fill="#e5e7eb" />
    {/* Star decoration */}
    <text x="140" y="130" fontSize="24" fill="#a5b4fc">★</text>
  </svg>
);

const LearningGoals: React.FC = () => {
  const {
    goals,
    activeGoals,
    completedGoals,
    stats,
    filterStatus,
    setFilterStatus,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    applyTemplate,
    refresh,
  } = useGoals();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleSave = async (data: { title: string; description: string; deadline: string; category: any }) => {
    // Create basic SMART defaults when user only provides minimal fields
    const now = new Date().toISOString().split('T')[0];
    await addGoal({
      title: data.title,
      description: data.description,
      category: data.category,
      status: 'active',
      specific: data.description,
      measurable: 'Track progress via milestones',
      achievable: 'With mentor guidance',
      relevant: 'Aligned with learning objectives',
      timeBound: `Complete by ${new Date(data.deadline).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      deadline: data.deadline,
      milestones: [],
      userId: '',
      sharedWithMentor: false,
      reminderEnabled: false,
      notes: '',
    });
  };

  const handleEditSave = async (updatedGoal: Goal) => {
    await updateGoal(updatedGoal.id, {
      title: updatedGoal.title,
      description: updatedGoal.description,
      deadline: updatedGoal.deadline,
      category: updatedGoal.category,
      specific: updatedGoal.specific,
      measurable: updatedGoal.measurable,
      achievable: updatedGoal.achievable,
      relevant: updatedGoal.relevant,
      timeBound: updatedGoal.timeBound,
      notes: updatedGoal.notes,
    });
    setEditingGoal(null);
  };

  // Filter display based on tab
  let displayGoals = goals;
  if (filterStatus === 'active') displayGoals = activeGoals;
  if (filterStatus === 'completed') displayGoals = completedGoals;
  if (filterStatus === 'overdue') {
    const now = new Date().toISOString().split('T')[0];
    displayGoals = goals.filter(g => g.status === 'active' && g.deadline < now);
  }

  const hasAnyGoals = goals.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-stellar border-t-transparent mx-auto mb-3"></div>
          <p>Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-2">{error}</p>
        <button onClick={refresh} className="text-stellar hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1">Learning Goals</h2>
          <p className="text-gray-500">Set goals, track progress, and link mentoring sessions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowTemplates(t => !t); setShowAddModal(false); }}
            className="px-4 py-2.5 border-2 border-stellar/20 text-stellar font-bold rounded-xl text-sm hover:bg-stellar/5 transition-all"
          >
            Templates
          </button>
          <button
            onClick={() => { setShowAddModal(true); setShowTemplates(false); }}
            className="px-4 py-2.5 bg-stellar text-white font-bold rounded-xl text-sm hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all active:scale-95"
          >
            + Add Goal
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

      {/* Templates panel */}
      {showTemplates && (
        <GoalTemplates onApply={(tpl) => { applyTemplate(tpl); setShowTemplates(false); }} onClose={() => setShowTemplates(false)} />
      )}

      {/* Add Goal Modal */}
      <AddGoalModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleSave} />

      {/* Edit Goal Modal */}
      <GoalEditModal
        isOpen={editingGoal !== null}
        onClose={() => setEditingGoal(null)}
        goal={editingGoal}
        onSave={handleEditSave}
      />

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'Active', value: 'active' as const },
          { label: 'Completed', value: 'completed' as const },
          { label: 'Overdue', value: 'overdue' as const },
        ].map(f => (
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

      {/* Empty state */}
      {!hasAnyGoals ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EmptyStateIllustration />
          <h3 className="text-xl font-bold text-gray-900 mt-6">No goals yet</h3>
          <p className="text-gray-500 max-w-sm mt-2">
            Start your learning journey by creating your first goal. Pick a template or add a custom goal.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2.5 border-2 border-stellar/20 text-stellar font-bold rounded-xl text-sm hover:bg-stellar/5 transition-all"
            >
              Browse Templates
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-stellar text-white font-bold rounded-xl text-sm hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all active:scale-95"
            >
              + Add Your First Goal
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700">Active Goals</h3>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{activeGoals.length}</span>
              </div>
              {activeGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onRefresh={refresh} />
              ))}
            </div>
          )}

          {/* Completed goals section */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 group"
                aria-expanded={showCompleted}
              >
                <span className={`text-lg transition-transform duration-200 ${showCompleted ? 'rotate-90' : ''}`}>▶</span>
                <h3 className="text-sm font-semibold text-gray-700">Completed Goals</h3>
                <span className="px-2 py-0.5 bg-emerald-100 rounded-full text-xs font-bold text-emerald-700">{completedGoals.length}</span>
              </button>
              {showCompleted && (
                <div className="space-y-4 pl-6 animate-in fade-in slide-in-from-left-2 duration-300">
                  {completedGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onRefresh={refresh} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearningGoals;
