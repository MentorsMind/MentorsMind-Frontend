import React from 'react';
import { Loader2 } from 'lucide-react';

interface EndSessionModalProps {
  elapsed: number;
  escrowStatus: 'idle' | 'releasing' | 'released';
  onConfirm: () => void;
  onCancel: () => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const EndSessionModal: React.FC<EndSessionModalProps> = ({ elapsed, escrowStatus, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
      <h2 className="text-xl font-bold text-gray-900">End Session?</h2>
      <p className="text-sm text-gray-500">
        Session duration: <span className="font-semibold text-gray-800">{fmt(elapsed)}</span>
      </p>
      <p className="text-sm text-gray-500">
        Ending will automatically release escrow funds to the mentor and redirect you to the review page.
      </p>

      {escrowStatus === 'releasing' && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Releasing escrow…
        </div>
      )}
      {escrowStatus === 'released' && (
        <p className="text-sm font-medium text-green-600">✓ Escrow released</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={escrowStatus === 'releasing'}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={escrowStatus === 'releasing'}
          className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  </div>
);

export default EndSessionModal;
