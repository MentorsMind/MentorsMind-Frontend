/**
 * usePasskey hook
 *
 * Encapsulates all passkey / WebAuthn state and operations so components
 * stay thin.  Follows the same patterns as the existing useSettings hook.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isBiometricSupported,
  registerPasskey,
  authenticateWithPasskey,
  listPasskeys,
  removePasskey,
  type PasskeyDevice,
} from '../services/webauthn.service';

export type PasskeyStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UsePasskeyReturn {
  /** Whether the current device supports biometric / platform authenticator */
  isSupported: boolean;
  /** True while the support check is still running */
  checkingSupport: boolean;
  /** Registered passkeys for the current user */
  passkeys: PasskeyDevice[];
  /** True while fetching the passkey list */
  loadingPasskeys: boolean;
  /** Status of the most recent register / authenticate / remove operation */
  status: PasskeyStatus;
  /** Human-readable error message from the last failed operation */
  error: string | null;
  /** Register a new passkey on this device */
  register: (deviceName: string) => Promise<PasskeyDevice | null>;
  /** Authenticate using a passkey (returns auth tokens on success) */
  authenticate: () => Promise<{ user: import('../types').User; token: string; refreshToken: string } | null>;
  /** Remove a passkey by its server-side ID */
  remove: (passkeyId: string) => Promise<boolean>;
  /** Reload the passkey list from the server */
  refresh: () => Promise<void>;
  /** Clear the last error */
  clearError: () => void;
}

export function usePasskey(): UsePasskeyReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [checkingSupport, setCheckingSupport] = useState(true);
  const [passkeys, setPasskeys] = useState<PasskeyDevice[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [status, setStatus] = useState<PasskeyStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // ── Support detection ──────────────────────────────────────────────────────
  useEffect(() => {
    isBiometricSupported()
      .then(setIsSupported)
      .finally(() => setCheckingSupport(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const handleError = useCallback((err: unknown): string => {
    if (err instanceof DOMException) {
      // User cancelled the authenticator prompt
      if (err.name === 'NotAllowedError') return 'Biometric prompt was cancelled or timed out.';
      if (err.name === 'InvalidStateError') return 'This device is already registered.';
      if (err.name === 'NotSupportedError') return 'This authenticator type is not supported.';
    }
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred.';
  }, []);

  // ── Passkey list ───────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoadingPasskeys(true);
    try {
      const list = await listPasskeys();
      setPasskeys(list);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoadingPasskeys(false);
    }
  }, [handleError]);

  // Load passkeys once on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Registration ───────────────────────────────────────────────────────────
  const register = useCallback(
    async (deviceName: string): Promise<PasskeyDevice | null> => {
      setStatus('loading');
      setError(null);
      try {
        const device = await registerPasskey(deviceName);
        setPasskeys(prev => [...prev, device]);
        setStatus('success');
        return device;
      } catch (err) {
        const msg = handleError(err);
        setError(msg);
        setStatus('error');
        return null;
      }
    },
    [handleError],
  );

  // ── Authentication ─────────────────────────────────────────────────────────
  const authenticate = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await authenticateWithPasskey();
      setStatus('success');
      return result;
    } catch (err) {
      const msg = handleError(err);
      setError(msg);
      setStatus('error');
      return null;
    }
  }, [handleError]);

  // ── Removal ────────────────────────────────────────────────────────────────
  const remove = useCallback(
    async (passkeyId: string): Promise<boolean> => {
      setStatus('loading');
      setError(null);
      try {
        await removePasskey(passkeyId);
        setPasskeys(prev => prev.filter(p => p.id !== passkeyId));
        setStatus('success');
        return true;
      } catch (err) {
        const msg = handleError(err);
        setError(msg);
        setStatus('error');
        return false;
      }
    },
    [handleError],
  );

  return {
    isSupported,
    checkingSupport,
    passkeys,
    loadingPasskeys,
    status,
    error,
    register,
    authenticate,
    remove,
    refresh,
    clearError,
  };
}
