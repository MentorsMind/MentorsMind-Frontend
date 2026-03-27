import React from 'react';

interface MilestoneModalProps {
  visible: boolean;
  message?: string;
  onClose: () => void;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ visible, message, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-black text-gray-900">🎉 Milestone Unlocked</p>
            <p className="mt-3 text-gray-600">{message || 'You reached a new milestone! Keep going!'}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
        <div className="mt-5 space-x-2">
          <button
            onClick={onClose}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Got it
          </button>
          <button
            onClick={() => {
              onClose();
              setTimeout(() => window.alert('Share to your network!'), 50);
            }}
            className="rounded-2xl border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
