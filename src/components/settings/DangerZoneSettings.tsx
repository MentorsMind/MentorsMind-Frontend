import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FocusTrap from '../a11y/FocusTrap';
import AccountService from '../../services/account.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white';

const DangerZoneSettings: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const accountService = new AccountService();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const result = await accountService.requestDeletion();
      // Tokens are revoked server-side — log out immediately
      await logout();
      setShowDeleteModal(false);
      // Redirect to the scheduled-for-deletion page with the date
      navigate('/account-scheduled-for-deletion', {
        state: { deletion_scheduled_for: result.deletion_scheduled_for },
        replace: true,
      });
    } catch (err) {
      toast.error('Failed to schedule account deletion');
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 border border-red-100 bg-red-50/30 rounded-3xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-1">Delete Account</h3>
            <p className="text-sm text-red-700/80 mb-4 max-w-xl">
              Schedule your account for permanent deletion. You will have 30 days to cancel before all data is erased.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <FocusTrap active>
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Account?</h3>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Your account will be <strong className="text-gray-900">permanently deleted in 30 days</strong>. You will be logged out immediately. You can cancel the deletion by logging back in during the grace period.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  To verify, type <span className="font-mono text-red-600 select-all">DELETE</span> below:
                </label>
                <input
                  type="text"
                  aria-label="Delete confirmation input"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-red-600/20"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Scheduling...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
};

export default DangerZoneSettings;
