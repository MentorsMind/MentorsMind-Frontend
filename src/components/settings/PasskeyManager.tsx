/**
 * PasskeyManager
 *
 * "Manage passkeys" section shown inside the Security settings tab.
 * Lets users:
 *  - See whether their device supports biometric login
 *  - Register a new passkey (with a custom device name)
 *  - View all registered passkeys (name + registration date)
 *  - Remove any passkey
 */

import React, { useState } from 'react';
import {
  Fingerprint,
  Plus,
  Trash2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { usePasskey } from '../../hooks/usePasskey';
import Button from '../ui/Button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Suggest a device name based on the user-agent string */
function guessDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android device';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux device';
  return 'My device';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RegisterFormProps {
  onRegister: (name: string) => Promise<void>;
  loading: boolean;
}

function RegisterForm({ onRegister, loading }: RegisterFormProps) {
  const [deviceName, setDeviceName] = useState(guessDeviceName());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    await onRegister(deviceName.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        type="text"
        value={deviceName}
        onChange={e => setDeviceName(e.target.value)}
        placeholder="Device name"
        maxLength={64}
        required
        aria-label="Device name for new passkey"
        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          bg-white disabled:bg-gray-50"
        disabled={loading}
      />
      <Button type="submit" size="sm" loading={loading} disabled={!deviceName.trim()}>
        <Plus className="w-3.5 h-3.5" />
        Register
      </Button>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PasskeyManager: React.FC = () => {
  const {
    isSupported,
    checkingSupport,
    passkeys,
    loadingPasskeys,
    status,
    error,
    register,
    remove,
    clearError,
  } = usePasskey();

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (deviceName: string) => {
    clearError();
    setSuccessMsg(null);
    const device = await register(deviceName);
    if (device) {
      setSuccessMsg(`"${device.name}" registered successfully.`);
      setShowRegisterForm(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove passkey "${name}"? You won't be able to use it to sign in.`)) return;
    setRemovingId(id);
    clearError();
    await remove(id);
    setRemovingId(null);
  };

  const isLoading = status === 'loading';

  return (
    <section aria-labelledby="passkey-heading" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
          <Fingerprint className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 id="passkey-heading" className="font-semibold text-gray-900">
            Passkeys &amp; Biometric Login
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Sign in with fingerprint, Face ID, or Windows Hello — no password needed.
          </p>
        </div>
      </div>

      {/* Support banner */}
      {checkingSupport ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking device support…
        </div>
      ) : isSupported ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          This device supports biometric login.
        </div>
      ) : (
        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Biometric login is not available on this device or browser. You can still use a
            password to sign in.
          </span>
        </div>
      )}

      {/* Error / success feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-2.5 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-xl"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Registered passkeys list */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Registered devices
        </p>

        {loadingPasskeys ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading passkeys…
          </div>
        ) : passkeys.length === 0 ? (
          <p className="text-sm text-gray-400 py-3">No passkeys registered yet.</p>
        ) : (
          <ul className="space-y-2" aria-label="Registered passkeys">
            {passkeys.map(pk => (
              <li
                key={pk.id}
                className="flex items-center justify-between gap-3 px-4 py-3
                  border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{pk.name}</p>
                    <p className="text-xs text-gray-400">
                      Registered {formatDate(pk.registeredAt)}
                      {pk.lastUsedAt && ` · Last used ${formatDate(pk.lastUsedAt)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(pk.id, pk.name)}
                  disabled={removingId === pk.id || isLoading}
                  aria-label={`Remove passkey for ${pk.name}`}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                    rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {removingId === pk.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Register new passkey */}
      {isSupported && (
        <div>
          {showRegisterForm ? (
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Give this device a name so you can identify it later.
              </p>
              <RegisterForm onRegister={handleRegister} loading={isLoading} />
              <button
                onClick={() => { setShowRegisterForm(false); clearError(); }}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowRegisterForm(true); clearError(); setSuccessMsg(null); }}
              disabled={isLoading}
            >
              <Plus className="w-3.5 h-3.5" />
              Set up biometric login on this device
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default PasskeyManager;
