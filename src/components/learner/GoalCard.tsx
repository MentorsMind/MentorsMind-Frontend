import { useState } from 'react';
import type { Goal } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import GoalsService from '../../services/goals.service';
import SessionService from '../../services/session.service';
import { useAuth } from '../../hooks/useAuth';
import type { Session } from '../../types';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onRefresh: () => Promise<void>;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
  paused: 'bg-gray-100 text-gray-500',
  overdue: 'bg-red-50 text-red-500',
};

const CATEGORY_ICONS: Record<string, string> = {
  technical: '💻',
  career: '💼',
  project: '🚀',
  certification: '🎓',
  'soft-skills': '🗣️',
};

export default function GoalCard({ goal, onEdit, onRefresh }: GoalCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.progress);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<'completed' | 'paused' | null>(null);

  const isOverdue = goal.status === 'active' && goal.deadline < new Date().toISOString().split('T')[0];
  const displayStatus = isOverdue ? 'overdue' : goal.status;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  const goalsService = new GoalsService();

  // Fetch completed sessions for linking
  const fetchCompletedSessions = async () => {
    setLoadingSessions(true);
    try {
      // Fetch from /bookings endpoint as specified in requirements
      const response = await fetch('/api/bookings');
      const bookingsData = await response.json();
      
      // Filter client-side: mentee_id === currentUserId AND status === 'completed'
      // Don't filter out already linked sessions - we want to show them with disabled state
      const available = (bookingsData.data || [])
        .filter((s: Session) => 
          s.learnerId === user?.id && 
          s.status === 'completed'
        );
      
      setCompletedSessions(available);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      // Fallback to existing method if bookings endpoint fails
      try {
        const sessionService = new SessionService();
        const response = await sessionService.getLearnerSessions({ status: 'completed' });
        const available = (response.data || [])
          .filter((s: Session) => 
            s.learnerId === user?.id
          );
        setCompletedSessions(available);
      } catch (fallbackErr) {
        console.error('Failed to fetch sessions with fallback:', fallbackErr);
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleOpenLinkModal = () => {
    fetchCompletedSessions();
    setShowLinkModal(true);
  };

  const handleLinkSession = async (sessionId: string) => {
    try {
      await goalsService.linkSession(goal.id, sessionId);
      // Immediately call GET /goals/:id to refetch the updated goal
      await goalsService.getGoal(goal.id);
      await onRefresh();
      setShowLinkModal(false);
    } catch (err) {
      console.error('Failed to link session:', err);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    const clamped = Math.max(0, Math.min(100, val));
    setProgressValue(clamped);
  };

  const handleProgressCommit = async () => {
    if (progressValue === goal.progress) return;
    setIsUpdatingProgress(true);
    try {
      await goalsService.updateProgress(goal.id, progressValue);
      await onRefresh();
    } catch (err) {
      console.error('Failed to update progress:', err);
      setProgressValue(goal.progress);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleDelete = async () => {
    try {
      await goalsService.deleteGoal(goal.id);
      // GoalController.delete returns 204 No Content - the frontend must remove the goal from local state
      // based on the request's goal ID, not from the response body
      await onRefresh();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    try {
      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString().split('T')[0] : undefined }
          : m
      );
      await goalsService.updateGoal(goal.id, { milestones: updatedMilestones });
      await onRefresh();
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleStatusUpdate = async (status: Goal['status']) => {
    try {
      await goalsService.updateGoal(goal.id, { status });
      await onRefresh();
      setShowStatusConfirm(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-xl mt-0.5 shrink-0">{CATEGORY_ICONS[goal.category]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-bold text-gray-900">{goal.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[displayStatus]}`}>
                  {displayStatus}
                </span>
                {goal.sharedWithMentor && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">Shared</span>
                )}
                {goal.reminderEnabled && (
                  <span className="text-[10px]" title="Reminders on">🔔</span>
                )}
              </div>
              {goal.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{goal.description}</p>
              )}

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-stellar'}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">{goal.progress}%</span>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[11px] text-gray-400">
                  {completedMilestones}/{goal.milestones.length} milestones
                </p>
                <p className="text-[11px] text-gray-400">
                  Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                {goal.linkedSessionIds.length > 0 && (
                  <p className="text-[11px] text-stellar font-medium">
                    {goal.linkedSessionIds.length} session{goal.linkedSessionIds.length !== 1 ? 's' : ''} linked
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors text-xs font-bold"
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse goal' : 'Expand goal'}
            >
              {expanded ? '▲' : '▼'}
            </button>
            <button
              onClick={() => { onEdit(goal); }}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-stellar transition-colors text-xs"
              aria-label="Edit goal"
            >
              ✏️
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-xs"
              aria-label="Delete goal"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Milestones</h4>
              <span className="text-xs text-gray-400">{completedMilestones}/{goal.milestones.length} completed</span>
            </div>
            <div className="space-y-2">
              {goal.milestones.map(m => (
                <div key={m.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-100">
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={() => toggleMilestone(m.id)}
                    className="mt-0.5 w-4 h-4 rounded text-stellar border-gray-300 focus:ring-stellar"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${m.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {m.title}
                    </p>
                    {(m.dueDate || m.completedAt) && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {m.completed && m.completedAt ? `Completed ${m.completedAt}` : `Due ${m.dueDate}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {goal.notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">{goal.notes}</p>
            </div>
          )}

          {/* Progress control */}
          {goal.status !== 'completed' && (
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Update Progress</h4>
                <span className="text-sm font-bold text-stellar">{progressValue}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={handleProgressChange}
                  onMouseUp={handleProgressCommit}
                  onTouchEnd={handleProgressCommit}
                  onBlur={handleProgressCommit}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-stellar"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={handleProgressChange}
                  onBlur={handleProgressCommit}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center"
                />
              </div>
              {isUpdatingProgress && (
                <p className="text-[11px] text-gray-400 mt-2">Updating...</p>
              )}
            </div>
          )}

          {/* Actions row */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => onEdit(goal)}>
              Edit Goal
            </Button>
            <Button size="sm" variant="outline" onClick={handleOpenLinkModal}>
              🔗 Link Session ({goal.linkedSessionIds.length})
            </Button>
            {goal.status !== 'completed' && (
              <Button size="sm" variant="ghost" onClick={() => setShowStatusConfirm('completed')}>
                Mark Completed
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowStatusConfirm('paused')}>
              Pause
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Goal" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{goal.title}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Status change confirmation modal */}
      <Modal isOpen={showStatusConfirm !== null} onClose={() => setShowStatusConfirm(null)} title="Change Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Change status of <strong>{goal.title}</strong> to <strong>{showStatusConfirm}</strong>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowStatusConfirm(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => showStatusConfirm && handleStatusUpdate(showStatusConfirm)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Link Session Modal */}
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link a Completed Session" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select a completed session to associate with this goal.</p>
          {loadingSessions ? (
            <div className="text-center py-8 text-gray-400">Loading sessions...</div>
          ) : completedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No completed sessions available.</p>
              <p className="text-xs mt-1">Complete some mentoring sessions to link them.</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {completedSessions.map(session => {
                const isAlreadyLinked = goal.linkedSessionIds.includes(session.id);
                return (
                  <div
                    key={session.id}
                    onClick={() => !isAlreadyLinked && handleLinkSession(session.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      isAlreadyLinked 
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                        : 'bg-gray-50 border-gray-200 hover:border-stellar/50 hover:bg-stellar/5 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isAlreadyLinked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {session.notes || `Session with Mentor`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.scheduledAt).toLocaleDateString()} · {session.duration} min
                        </p>
                      </div>
                      {isAlreadyLinked ? (
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Already linked
                        </span>
                      ) : (
                        <span className="text-stellar text-lg">+</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
