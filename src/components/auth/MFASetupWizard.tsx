/**
 * MFASetupWizard
 *
 * Three-step wizard for enabling TOTP-based MFA:
 *   Step 1 – Scan QR code in an authenticator app
 *   Step 2 – Enter the 6-digit TOTP code to confirm setup
 *   Step 3 – Save the 8 backup codes (copyable grid + .txt download)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import * as authService from '../../services/auth.service';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MFASetupWizardProps {
  /** Called when the wizard completes successfully */
  onComplete: () => void;
  /** Called when the user cancels before finishing */
  onCancel: () => void;
}

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

// ─── Step 1: QR Code ──────────────────────────────────────────────────────────

interface Step1Props {
  qrCode: string;
  secret: string;
  onNext: () => void;
  onCancel: () => void;
}

function Step1QRCode({ qrCode, secret, onNext, onCancel }: Step1Props) {
  const [copied, setCopied] = useState(false);

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and scan
        the QR code below to add your account.
      </p>

      {/* QR code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl inline-block shadow-sm">
          <img
            src={qrCode}
            alt="MFA QR code — scan with your authenticator app"
            className="w-48 h-48"
          />
        </div>
      </div>

      {/* Manual entry fallback */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Can't scan? Enter this key manually
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-gray-800 break-all select-all">
            {secret}
          </code>
          <button
            onClick={copySecret}
            aria-label="Copy secret key"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <ClipboardCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <Alert type="info">
        After scanning, your app will show a 6-digit code that refreshes every 30 seconds.
      </Alert>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onNext} className="flex-1">
          I've scanned it →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Verify TOTP ──────────────────────────────────────────────────────

interface Step2Props {
  onVerified: (backupCodes: string[]) => void;
  onBack: () => void;
}

function Step2Verify({ onVerified, onBack }: Step2Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = useCallback(async (totp: string) => {
    if (totp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const { backupCodes } = await authService.mfaVerifySetup(totp);
      onVerified(backupCodes);
    } catch {
      setError('Invalid code. Make sure your device clock is correct and try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  }, [onVerified]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Enter the 6-digit code shown in your authenticator app to confirm the setup.
      </p>

      {error && <Alert type="error">{error}</Alert>}

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

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          ← Back
        </Button>
        <Button
          onClick={() => submit(code)}
          loading={loading}
          disabled={code.length !== 6}
          className="flex-1"
        >
          Verify
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Backup Codes ─────────────────────────────────────────────────────

interface Step3Props {
  backupCodes: string[];
  onDone: () => void;
}

function Step3BackupCodes({ backupCodes, onDone }: Step3Props) {
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const content = [
      'MentorsMind — MFA Backup Codes',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Each code can only be used once.',
      'Store these somewhere safe.',
      '',
      ...backupCodes,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mentorsmind-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <Alert type="warning" title="Save these codes now">
        These backup codes will <strong>not</strong> be shown again. Store them somewhere safe
        — you can use one to sign in if you lose access to your authenticator app.
      </Alert>

      {/* Backup codes grid */}
      <div
        className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200"
        aria-label="Backup codes"
      >
        {backupCodes.map((code, i) => (
          <div
            key={i}
            className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded-lg
              border border-gray-200 text-center tracking-widest select-all"
          >
            {code}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyAll} className="flex-1">
          {copied ? (
            <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Copied!</>
          ) : (
            <><ClipboardCopy className="w-3.5 h-3.5" /> Copy all</>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={download} className="flex-1">
          <Download className="w-3.5 h-3.5" />
          Download .txt
        </Button>
      </div>

      <Button onClick={onDone} className="w-full">
        <ShieldCheck className="w-4 h-4" />
        Done — MFA is enabled
      </Button>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Scan QR code', 'Verify code', 'Save backup codes'];

export default function MFASetupWizard({ onComplete, onCancel }: MFASetupWizardProps) {
  const [step, setStep] = useState(0);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [setupError, setSetupError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Kick off setup as soon as the wizard mounts
  useEffect(() => {
    let cancelled = false;
    authService.mfaSetup()
      .then(({ qrCode, secret }) => {
        if (cancelled) return;
        setQrCode(qrCode);
        setSecret(secret);
      })
      .catch(() => {
        if (!cancelled) setSetupError('Failed to start MFA setup. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoadingSetup(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loadingSetup) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Generating your QR code…</p>
      </div>
    );
  }

  if (setupError) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {setupError}
        </div>
        <Button variant="outline" onClick={onCancel} className="w-full">Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' : 'bg-gray-100 text-gray-400'}`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-indigo-700' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <Step1QRCode
          qrCode={qrCode}
          secret={secret}
          onNext={() => setStep(1)}
          onCancel={onCancel}
        />
      )}
      {step === 1 && (
        <Step2Verify
          onVerified={codes => { setBackupCodes(codes); setStep(2); }}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <Step3BackupCodes
          backupCodes={backupCodes}
          onDone={onComplete}
        />
      )}
    </div>
  );
}
