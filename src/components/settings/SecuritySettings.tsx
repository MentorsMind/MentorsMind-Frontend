import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Laptop, Smartphone, Globe, AlertCircle, Loader2 } from 'lucide-react';
import AccountService, { ActiveSession } from '../../services/account.service';
import MFASettings from './MFASettings';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stellar/30 focus:border-stellar bg-white';

const SecuritySettings: React.FC = () => {
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving'>('idle');
  
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  
  const accountService = new AccountService();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await accountService.getActiveSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
      // Fallback for demo if API fails
      setSessions([
        { id: '1', deviceName: 'MacBook Pro - Safari', ipAddress: '192.168.1.1', lastActive: new Date().toISOString(), locationFlag: 'US', isCurrentSession: true },
        { id: '2', deviceName: 'iPhone 13 - Safari', ipAddress: '192.168.1.2', lastActive: new Date(Date.now() - 86400000).toISOString(), locationFlag: 'US', isCurrentSession: false },
      ]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) return;
    setPasswordStatus('saving');
    
    try {
      await accountService.changePassword({
        current: passwordForm.current,
        next: passwordForm.next
      });
      toast.success('Password updated successfully');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error('Failed to update password');
      console.error(err);
    } finally {
      setPasswordStatus('idle');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await accountService.revokeSession(sessionId);
      toast.success('Session revoked');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      toast.error('Failed to revoke session');
      console.error(err);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setRevokingSessionId('all');
    try {
      await accountService.revokeAllOtherSessions();
      toast.success('All other sessions revoked');
      setSessions(prev => prev.filter(s => s.isCurrentSession));
    } catch (err) {
      toast.error('Failed to revoke sessions');
      console.error(err);
    } finally {
      setRevokingSessionId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Change Password */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-700" />
          <h3 className="font-bold text-gray-900 text-lg">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
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
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
              className={`${inputClass} ${passwordForm.confirm && passwordForm.next !== passwordForm.confirm ? 'border-red-300 focus:ring-red-200' : ''}`}
              required
            />
            {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={passwordStatus === 'saving' || (!!passwordForm.confirm && passwordForm.next !== passwordForm.confirm) || !passwordForm.current || !passwordForm.next}
            className="px-5 py-2.5 bg-stellar text-white text-sm font-bold rounded-xl hover:bg-stellar-dark transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {passwordStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </section>

      <div className="border-t border-gray-100" />

      {/* MFA Settings */}
      <section>
        <MFASettings />
      </section>

      <div className="border-t border-gray-100" />

      {/* Active Sessions */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Laptop className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900 text-lg">Active Sessions</h3>
            </div>
            <p className="text-sm text-gray-500">Manage devices currently logged into your account.</p>
          </div>
          <button
            onClick={handleRevokeAllOtherSessions}
            disabled={revokingSessionId === 'all' || sessions.length <= 1}
            className="px-4 py-2 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {revokingSessionId === 'all' ? 'Revoking...' : 'Revoke All Other Sessions'}
          </button>
        </div>

        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50 gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${session.isCurrentSession ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {session.deviceName.toLowerCase().includes('iphone') || session.deviceName.toLowerCase().includes('android') ? (
                      <Smartphone className={`w-5 h-5 ${session.isCurrentSession ? 'text-green-600' : 'text-gray-500'}`} />
                    ) : (
                      <Laptop className={`w-5 h-5 ${session.isCurrentSession ? 'text-green-600' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{session.deviceName}</p>
                      {session.isCurrentSession && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Current Session</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {session.ipAddress} {session.locationFlag && `· ${session.locationFlag}`}</span>
                      <span>·</span>
                      <span>Last active: {new Date(session.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {!session.isCurrentSession && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revokingSessionId === session.id}
                    className="self-start sm:self-auto px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {revokingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SecuritySettings;
