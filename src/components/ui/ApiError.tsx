import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { tokenStorage } from '../../utils/token.storage.utils';

interface ApiErrorProps {
  error: any;
  onRetry?: () => void;
}

export default function ApiError({ error, onRetry }: ApiErrorProps) {
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);
  const [attemptingRefresh, setAttemptingRefresh] = useState(false);
  const { logout } = useAuthContext();

  useEffect(() => {
    if (!error) return;
    const status = error?.status ?? error?.response?.status;
    if (status === 429) {
      const header = error?.headers?.get ? error.headers.get('Retry-After') : error?.response?.headers?.['retry-after'] ?? null;
      const sec = header ? parseInt(String(header), 10) : null;
      setRetryAfterSec(isNaN(sec as number) ? null : sec);
    }

    // For 401, try silent refresh once
    if (status === 401 && !attemptingRefresh) {
      (async () => {
        setAttemptingRefresh(true);
        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) throw new Error('no refresh token');
          const res = await authService.refreshToken(refreshToken);
          if (res?.token) {
            tokenStorage.setTokens(res.token, res.refreshToken || refreshToken);
            // ask consumer to retry the failed request
            onRetry?.();
            return;
          }
        } catch {
          // fallthrough to show login prompt
        } finally {
          setAttemptingRefresh(false);
        }
      })();
    }
  }, [error]);

  if (!error) return null;

  const status = error?.status ?? error?.response?.status;

  if (status === 429) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-900">
        <div className="font-semibold">Too many requests</div>
        <div className="text-sm mt-1">Try again{retryAfterSec ? ` in ${retryAfterSec} second${retryAfterSec !== 1 ? 's' : ''}` : ''}.</div>
        <div className="mt-3">
          <button onClick={onRetry} className="px-3 py-1 rounded bg-yellow-600 text-white text-sm">Retry now</button>
        </div>
      </div>
    );
  }

  if (status === 401) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-900">
        <div className="font-semibold">Not signed in</div>
        <div className="text-sm mt-1">Please sign in again to continue.</div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { logout(); }} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Sign out</button>
          <button onClick={onRetry} className="px-3 py-1 rounded bg-white text-red-600 border border-red-200 text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-900">
      <div className="font-semibold">Failed to load</div>
      <div className="text-sm mt-1">{String(error?.message ?? error)}</div>
      <div className="mt-3">
        <button onClick={onRetry} className="px-3 py-1 rounded bg-stellar text-white text-sm">Retry</button>
      </div>
    </div>
  );
}
