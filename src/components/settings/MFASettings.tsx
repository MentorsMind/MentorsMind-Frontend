/**
 * MFASettings
 *
 * "Two-Factor Authentication" section shown inside the Security settings tab.
 * Lets users:
 *  - See whether MFA is currently enabled
 *  - Enable MFA via the setup wizard (in a modal)
 *  - Disable MFA by confirming with a current TOTP code
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as authService from '../../services/auth.service';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import MFASetupWizard from '../auth/MFASetupWizard';

// ─── Disable confirmation dialog ──────────────────────────────────────────────

interface DisableDialogProps {
  onConfirm: (totp: string) => Promise<void>;
  onCancel: () => void;
}

function DisableDialog({ onConfirm, onCancel }: DisableDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onConfirm(code.trim());
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="warning" title="This will disable two-factor authentication">
        Anyone with your password will be able to sign in without a second factor.
      </Alert>

      <div className="space-y-1">
        <label htmlFor="disable-totp" className="text-sm font-medium text-gray-700">
          Enter your current authenticator code (or a backup code) to confirm
        </label>
        <input
          id="disable-totp"
          type="text"
          inputMode="numeric"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\s/g, ''))}
          placeholder="6-digit code"
          maxLength={8}
          disabled={loading}
          className="w-full px-3 py-2 border-2 rounded-xl text-sm font-mono
            border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100
            focus:outline-none transition-colors disabled:bg-gray-50"
        />
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" type="button" onClick={onCancel} disabled={loading} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" type="submit" loading={loading} disabled={!code.trim()} className="flex-1">
          Disable MFA
        </Button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const MFASettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const mfaEnabled = user?.mfaEnabled ?? false;

  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSetupComplete = async () => {
    setShowSetup(false);
    await refreshUser();
    flash('Two-factor authentication is now enabled.');
  };

  const handleDisable = async (totp: string) => {
    await authService.mfaDisable(totp);
    setShowDisable(false);
    await refreshUser();
    flash('Two-factor authentication has been disabled.');
  };

  return (
    <section aria-labelledby="mfa-heading" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 id="mfa-heading" className="font-semibold text-gray-900">
            Two-Factor Authentication
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add a second layer of security using a time-based one-time password (TOTP).
          </p>
        </div>
      </div>

      {/* Status banner */}
      {mfaEnabled ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Two-factor authentication is <strong>enabled</strong> on your account.
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl">
          <ShieldOff className="w-4 h-4 shrink-0" />
          Two-factor authentication is <strong>not enabled</strong>. We strongly recommend enabling it.
        </div>
      )}

      {/* Success feedback */}
      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Action button */}
      {mfaEnabled ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDisable(true)}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Disable two-factor authentication
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSetup(true)}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Set up two-factor authentication
        </Button>
      )}

      {/* Setup wizard modal */}
      <Modal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        title="Set up two-factor authentication"
        size="lg"
      >
        <MFASetupWizard
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      </Modal>

      {/* Disable confirmation modal */}
      <Modal
        isOpen={showDisable}
        onClose={() => setShowDisable(false)}
        title="Disable two-factor authentication"
        size="sm"
      >
        <DisableDialog
          onConfirm={handleDisable}
          onCancel={() => setShowDisable(false)}
        />
      </Modal>
    </section>
  );
};

export default MFASettings;
