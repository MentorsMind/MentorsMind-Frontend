import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (choice: 'Yes' | 'No') => void;
  proposal: {
    title: string;
    id: string;
  };
  choice: 'Yes' | 'No';
  votingPower: number;
}

const VoteModal: React.FC<VoteModalProps> = ({ isOpen, onClose, onConfirm, proposal, choice, votingPower }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(choice);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-gray-900 leading-none">Confirm Vote</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Proposal #{proposal.id}</span>
            <h3 className="text-lg font-bold text-gray-900 leading-snug">{proposal.title}</h3>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Your Choice</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                choice === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {choice === 'Yes' ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />}
                {`Vote ${choice}`}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Voting Power</span>
              <span className="text-lg font-black text-gray-900">
                {`${votingPower.toLocaleString()} VP`}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-stellar/5 border border-stellar/10">
            <ShieldCheck className="h-5 w-5 text-stellar mt-0.5" />
            <p className="text-xs text-stellar/80 font-medium leading-relaxed">
              This action requires a cryptographic signature via your wallet. 
              Signing confirms your identity and the integrity of your vote on-chain.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl text-sm font-black text-white shadow-xl transition-all active:scale-95 ${
              choice === 'Yes' ? 'bg-green-600 shadow-green-600/20' : 'bg-red-600 shadow-red-600/20'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Confirm Vote ${choice}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteModal;
