/**
 * MFAChallengeScreen
 *
 * Shown after a successful password login when the backend returns
 * `mfa_required: true`. The user must enter their 6-digit TOTP code
 * (or a backup code) to complete sign-in.
 */

import React, { useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  disabled?: boolean;
}

function OTPInput({ value, onChange, onComplete, disabled }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const focus = (i: number) => inputs.current[i]?.focus();

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    const joined = next.join('');
    onChange(joined);
    if (digit && i < 5) focus(i + 1);
    if (joined.replace(/\s/g, '').length === 6) onComplete(joined);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) focus(i - 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      onComplete(pasted);
      focus(5);
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="6-digit verification code">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl
            border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
            focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400
            bg-white"
        />
      ))}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MFAChallengeScreen() {
  const { mfaPending, completeMFAChallenge, user } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // All hooks must be called before any conditional returns
  const submit = useCallback(async (totp: string) => {
    if (!totp || totp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      await completeMFAChallenge(totp);
      navigate('/learner/dashboard');
    } catch {
      setError('Invalid code. Please try again.');
      setCode('');
      setBackupCode('');
    } finally {
      setLoading(false);
    }
  }, [completeMFAChallenge, navigate]);

  // If there's no pending MFA challenge, redirect appropriately
  if (!mfaPending) {
    return <Navigate to={user ? '/learner/dashboard' : '/'} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-factor verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            {useBackup
              ? 'Enter one of your backup codes to continue.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {error && (
          <Alert type="error" className="mb-5">{error}</Alert>
        )}

        {useBackup ? (
          /* Backup code input */
          <div className="space-y-4">
            <input
              type="text"
              value={backupCode}
              onChange={e => setBackupCode(e.target.value.trim())}
              placeholder="xxxxxxxx"
              disabled={loading}
              aria-label="Backup code"
              className="w-full px-4 py-3 text-center font-mono text-lg border-2 rounded-xl
                border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                focus:outline-none transition-colors disabled:bg-gray-50"
            />
            <Button
              onClick={() => submit(backupCode)}
              loading={loading}
              disabled={backupCode.length < 6}
              className="w-full"
            >
              Verify backup code
            </Button>
          </div>
        ) : (
          /* TOTP OTP input */
          <div className="space-y-5">
            <OTPInput
              value={code}
              onChange={setCode}
              onComplete={submit}
              disabled={loading}
            />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </div>
            )}

            <Button
              onClick={() => submit(code)}
              loading={loading}
              disabled={code.length !== 6}
              className="w-full"
            >
              Verify
            </Button>
          </div>
        )}

        {/* Toggle between TOTP and backup code */}
        <button
          onClick={() => {
            setUseBackup(b => !b);
            setCode('');
            setBackupCode('');
            setError('');
          }}
          className="mt-5 w-full text-sm text-indigo-600 hover:underline text-center"
        >
          {useBackup
            ? 'Use authenticator app instead'
            : "Can't access your app? Use a backup code"}
        </button>
      </div>
    </div>
  );
}
