import React, { useState } from 'react';
import { User, Mail, Lock, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface AccountSettingsProps {
  userEmail: string;
  userName: string;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ userEmail, userName }) => {
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.password) return;
    setEmailStatus('saving');
    await new Promise(r => setTimeout(r, 800));
    setEmailStatus('saved');
    setEmailForm({ newEmail: '', password: '' });
    setTimeout(() => setEmailStatus('idle'), 2000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) return;
    setPasswordStatus('saving');
    await new Promise(r => setTimeout(r, 800));
    setPasswordStatus('saved');
    setPasswordForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPasswordStatus('idle'), 2000);
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar bg-white';

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-stellar/10 flex items-center justify-center">
          <User className="w-7 h-7 text-stellar" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{userName}</p>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Change Email */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Change Email</h3>
        </div>
        <form onSubmit={handleEmailChange} className="space-y-3">
          <input
            type="email"
            placeholder="New email address"
            value={emailForm.newEmail}
            onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="password"
            placeholder="Confirm with your password"
            value={emailForm.password}
            onChange={e => setEmailForm(p => ({ ...p, password: e.target.value }))}
            className={inputClass}
            required
          />
          <button
            type="submit"
            disabled={emailStatus === 'saving'}
            className="px-5 py-2 bg-stellar text-white text-sm font-semibold rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-60"
          >
            {emailStatus === 'saving' ? 'Updating...' : emailStatus === 'saved' ? 'Updated!' : 'Update Email'}
          </button>
        </form>
      </section>

      <div className="border-t border-gray-100" />

      {/* Change Password */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              placeholder="Current password"
              value={passwordForm.current}
              onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
              className={inputClass}
              required
            />
            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPasswords.next ? 'text' : 'password'}
              placeholder="New password"
              value={passwordForm.next}
              onChange={e => setPasswordForm(p => ({ ...p, next: e.target.value }))}
              className={inputClass}
              required
            />
            <button type="button" onClick={() => setShowPasswords(p => ({ ...p, next: !p.next }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPasswords.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirm}
            onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
            className={`${inputClass} ${passwordForm.confirm && passwordForm.next !== passwordForm.confirm ? 'border-red-300 focus:ring-red-200' : ''}`}
            required
          />
          {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
            <p className="text-xs text-red-500">Passwords don't match</p>
          )}
          <button
            type="submit"
            disabled={passwordStatus === 'saving' || (!!passwordForm.confirm && passwordForm.next !== passwordForm.confirm)}
            className="px-5 py-2 bg-stellar text-white text-sm font-semibold rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-60"
          >
            {passwordStatus === 'saving' ? 'Updating...' : passwordStatus === 'saved' ? 'Updated!' : 'Update Password'}
          </button>
        </form>
      </section>

      <div className="border-t border-gray-100" />

      {/* Delete Account */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-red-600">Delete Account</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
        >
          Delete My Account
        </button>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm you want to permanently delete your account.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={inputClass}
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-40 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
