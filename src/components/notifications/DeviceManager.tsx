import React, { useEffect, useState } from 'react';
import pushNotificationService from '../../services/pushNotification.service';
import type { PushDevice } from '../../types/pushNotification.types';

type TestStatus = 'idle' | 'sending' | 'sent' | 'error';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Loading spinner ──────────────────────────────────────────────────────────
function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function DeviceManager() {
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeErrors, setRemoveErrors] = useState<Record<string, string>>({});
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  // ── Fetch devices on mount ─────────────────────────────────────────────────
  async function fetchDevices() {
    setLoading(true);
    setError(null);
    try {
      const data = await pushNotificationService.getTokens();
      setDevices(data);
    } catch {
      setError('Failed to load registered devices.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  // ── Remove a device ────────────────────────────────────────────────────────
  async function handleRemove(token: string) {
    setRemovingId(token);
    setRemoveErrors((prev) => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    try {
      await pushNotificationService.unsubscribe(token);
      setDevices((prev) => prev.filter((d) => d.token !== token));
    } catch {
      setRemoveErrors((prev) => ({ ...prev, [token]: 'Failed to remove device. Please try again.' }));
    } finally {
      setRemovingId(null);
    }
  }

  // ── Send test notification ─────────────────────────────────────────────────
  async function handleSendTest() {
    setTestStatus('sending');
    setTestError(null);
    try {
      await pushNotificationService.sendTest();
      setTestStatus('sent');
    } catch {
      setTestStatus('error');
      setTestError('Failed to send test notification. Please try again.');
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Registered Devices</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Devices currently registered to receive push notifications.
          </p>
        </div>

        {/* Send test notification button */}
        <button
          onClick={handleSendTest}
          disabled={testStatus === 'sending'}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {testStatus === 'sending' && <Spinner className="h-3.5 w-3.5" />}
          Send test notification
        </button>
      </div>

      {/* Test notification feedback */}
      {testStatus === 'sent' && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          Test notification sent!
        </div>
      )}
      {testStatus === 'error' && testError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {testError}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <Spinner className="h-6 w-6" />
          <span className="ml-2 text-sm">Loading devices…</span>
        </div>
      )}

      {/* Fetch error state */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchDevices}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && devices.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-400">
          No devices registered
        </div>
      )}

      {/* Device list */}
      {!loading && !error && devices.length > 0 && (
        <ul className="divide-y divide-gray-100" role="list">
          {devices.map((device) => (
            <li key={device.token} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{device.deviceName}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {device.browser} · Last active {formatDate(device.lastActiveAt)}
                </p>
                {removeErrors[device.token] && (
                  <p className="mt-1 text-xs text-red-600">{removeErrors[device.token]}</p>
                )}
              </div>

              <button
                onClick={() => handleRemove(device.token)}
                disabled={removingId === device.token}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removingId === device.token && <Spinner className="h-3 w-3" />}
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeviceManager;
