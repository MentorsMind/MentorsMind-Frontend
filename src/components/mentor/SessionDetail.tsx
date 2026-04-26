import React, { useState, MouseEvent, ChangeEvent, FormEvent } from 'react';
import type { ExtendedSession } from '../../hooks/useMentorSessions';
import SessionNotes from './SessionNotes';
import RescheduleModal from './RescheduleModal';
import { useMentorSessions } from '../../hooks/useMentorSessions';

interface SessionDetailProps {
  session: ExtendedSession;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetail: React.FC<SessionDetailProps> = ({ session, isOpen, onClose }) => {
  const { completeSession, toggleChecklist, updateNotes } = useMentorSessions();
  const [showReschedule, setShowReschedule] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const checklistItems = [
    'Learner prepared questions/agenda',
    'Technical setup verified (screen share, mic)',
    'Review previous session notes',
    'Payment confirmed',
  ];

  if (!isOpen) return null;

  const handleComplete = () => {
    completeSession(session.id);
    onClose();
  };

  const handleFeedbackSubmit = () => {
    // Mock save feedback
    console.log('Feedback:', feedbackText);
    setShowFeedback(false);
    setFeedbackText('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] w-full overflow-y-auto shadow-2xl border border-gray-100" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${{
                confirmed: 'bg-green-500',
                pending: 'bg-yellow-500',
                completed: 'bg-blue-500',
                cancelled: 'bg-gray-400',
                rescheduled: 'bg-orange-500',
              }[session.status] || 'bg-gray-300'}`} />
              <h2 className="text-2xl font-black text-gray-900">{session.topic}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                session.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                session.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.paymentStatus.toUpperCase()}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{new Date(session.startTime).toLocaleString()}</span>
            <span>•</span>
            <span>{session.duration} min</span>
            <span>•</span>
            <span>{session.currency} {session.price}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Learner Profile */}
          <div className="border border-gray-100 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Learner: {session.learnerName}
            </h3>
            <div className="flex items-start gap-4">
              <img src={session.learnerAvatar || '/default-avatar.png'} alt={session.learnerName} className="w-16 h-16 rounded-2xl border-4 border-gray-100" />
              <div>
                <p className="text-gray-600 mb-2">{session.learnerBio || 'No bio available.'}</p>
                {session.meetingLink && (
                  <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Join Meeting
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Pre-session Checklist */}
          {session.status !== 'completed' && (
            <div className="border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Pre-Session Checklist</h3>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <label key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={session.checklist[index] || false}
                      onChange={() => toggleChecklist(session.id, index)}
                      className="w-5 h-5 rounded-lg text-stellar focus:ring-stellar border-gray-300 transition-all"
                    />
                    <span className="text-sm group-hover:text-gray-900">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Session Notes */}
          <SessionNotes sessionId={session.id} initialNotes={session.notes || ''} />

          {/* Post-session Feedback */}
          {session.status === 'completed' && !session.feedback && (
            <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50">
              <button
                onClick={() => setShowFeedback(true)}
                className="px-6 py-3 bg-stellar text-white font-bold rounded-2xl hover:bg-stellar-dark shadow-lg shadow-stellar/20 transition-all"
              >
                Add Post-Session Feedback →
              </button>
            </div>
          )}

          {session.feedback && (
            <div className="border border-gray-100 rounded-2xl p-6 bg-green-50/50">
              <h3 className="font-bold text-lg mb-2">Learner Feedback</h3>
              <p className="text-gray-700 italic">"{session.feedback}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-6 flex flex-wrap gap-3 justify-end p-2">
            {session.status === 'pending' && (
              <button className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all">
                Confirm Session
              </button>
            )}
            <button
              onClick={() => setShowReschedule(true)}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-md shadow-orange-100 transition-all"
              disabled={session.status === 'cancelled' || session.status === 'completed'}
            >
              Reschedule
            </button>
            {session.status === 'confirmed' && (
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[70vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b">
              <h3 className="font-bold text-xl mb-2">Learner Feedback</h3>
              <p className="text-sm text-gray-600">What did the learner say about this session?</p>
            </div>
            <div className="p-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter feedback..."
                className="w-full p-4 border border-gray-200 rounded-xl resize-vertical min-h-[120px] focus:ring-2 focus:ring-stellar focus:border-transparent"
              />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="px-6 py-2 bg-stellar text-white font-bold rounded-xl shadow-md hover:bg-stellar-dark"
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {showReschedule && (
        <RescheduleModal
          sessionId={session.id}
          currentTime={session.startTime}
          isOpen={showReschedule}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </div>
  );
};

export default SessionDetail;

