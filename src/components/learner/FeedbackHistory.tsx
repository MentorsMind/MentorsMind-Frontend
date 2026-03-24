import React, { useState } from 'react';
import type { SessionFeedbackEntry } from '../../types';
import RatingStars from './RatingStars';

interface FeedbackHistoryProps {
  history: SessionFeedbackEntry[];
  onEdit: (feedbackId: string, review: string) => void;
}

const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ history, onEdit }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftReview, setDraftReview] = useState('');

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-gray-900">Feedback History</h3>
      <div className="mt-5 space-y-4">
        {history.map((entry) => {
          const editable = Date.now() - new Date(entry.submittedAt).getTime() <= 24 * 60 * 60 * 1000;
          const editing = editingId === entry.id;

          return (
            <div key={entry.id} className="rounded-3xl bg-gray-50 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-black text-gray-900">{entry.sessionTitle}</div>
                  <div className="mt-1 text-sm text-gray-500">with {entry.mentorName}</div>
                </div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  {new Date(entry.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-4">
                <RatingStars value={entry.rating} onChange={() => undefined} />
              </div>

              {editing ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={draftReview}
                    onChange={(event) => setDraftReview(event.target.value)}
                    className="min-h-28 w-full rounded-3xl border border-gray-100 bg-white px-4 py-4 text-sm outline-none"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(entry.id, draftReview);
                        setEditingId(null);
                      }}
                      className="rounded-2xl bg-stellar px-4 py-3 text-sm font-bold text-white"
                    >
                      Save edit
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-600">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{entry.review}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Improvement suggestions: {entry.improvementSuggestions || 'None provided'}
                  </p>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(entry.id);
                        setDraftReview(entry.review);
                      }}
                      className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-600"
                    >
                      Edit feedback
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedbackHistory;
