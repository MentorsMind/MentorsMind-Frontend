import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import AccountService from '../services/account.service';
import toast from 'react-hot-toast';

const AccountScheduledForDeletion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const deletionDate: string | undefined = (location.state as { deletion_scheduled_for?: string } | null)?.deletion_scheduled_for;

  const formattedDate = deletionDate
    ? new Date(deletionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'in 30 days';

  const handleCancelDeletion = async () => {
    setCancelling(true);
    try {
      const accountService = new AccountService();
      await accountService.cancelDeletion();
      toast.success('Account deletion cancelled. Please log in again.');
      navigate('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error('No pending deletion request found.');
      } else {
        toast.error('Failed to cancel deletion. Please try again.');
      }
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Account Scheduled for Deletion</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your account will be permanently deleted on{' '}
            <strong className="text-gray-900">{formattedDate}</strong>.
            All your data, sessions, and history will be erased.
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You can cancel this deletion by clicking the button below. You will be redirected to log in again.
          </p>
        </div>

        <button
          onClick={handleCancelDeletion}
          disabled={cancelling}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
          {cancelling ? 'Cancelling...' : 'Cancel Deletion'}
        </button>

        <p className="text-xs text-gray-400">
          If you did not request this, please contact support immediately.
        </p>
      </div>
    </div>
  );
};

export default AccountScheduledForDeletion;
