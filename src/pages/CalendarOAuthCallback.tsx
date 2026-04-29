import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

/**
 * Landing page for the Google Calendar OAuth callback.
 *
 * The backend (CalendarController.googleCallback) redirects here:
 *   GET /settings/calendar?connected=true          — success
 *   GET /settings/calendar?error=<message>         — failure
 *   GET /settings/calendar                         — no params (broken redirect)
 *
 * The "connect" button in Settings sets a sessionStorage flag
 * (`calendarOAuthPending`) before navigating to the backend OAuth URL.
 * If we land here without ?connected or ?error, we check that flag to
 * decide whether to show a "may have failed" warning.
 *
 * After a short delay the user is redirected to /settings (connected tab).
 * The origin is never hardcoded — window.location.origin is used wherever
 * the current frontend URL is needed.
 */

const REDIRECT_DELAY_MS = 3000;
const PENDING_FLAG = 'calendarOAuthPending';

type Status = 'success' | 'error' | 'ambiguous' | 'loading';

const CalendarOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateSettings } = useSettings();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const pending = sessionStorage.getItem(PENDING_FLAG);

    if (connected === 'true') {
      // Clear the pending flag — OAuth completed successfully
      sessionStorage.removeItem(PENDING_FLAG);
      // Persist the connected state into settings
      updateSettings('connected', { calendarSync: true, calendarProvider: 'google' });
      setStatus('success');
    } else if (error) {
      sessionStorage.removeItem(PENDING_FLAG);
      setErrorMessage(decodeURIComponent(error));
      setStatus('error');
    } else if (pending) {
      // No recognised params but we know an OAuth flow was started —
      // the redirect URL was likely broken (e.g. APP_CLIENT_URL unset on backend)
      sessionStorage.removeItem(PENDING_FLAG);
      setStatus('ambiguous');
    } else {
      // Navigated here directly with no context — treat as error
      setStatus('error');
      setErrorMessage('No calendar connection information found.');
    }
  }, [searchParams, updateSettings]);

  // Auto-redirect to settings connected tab after delay
  useEffect(() => {
    if (status === 'loading') return;
    const timer = setTimeout(() => {
      navigate('/settings', { replace: true, state: { tab: 'connected' } });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  const settingsPath = '/settings';

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center space-y-4">
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900">Calendar connected!</h1>
            <p className="text-sm text-gray-500">
              Your Google Calendar has been linked. Sessions will now sync automatically.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900">Connection failed</h1>
            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {errorMessage}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Please return to settings and try connecting again.
            </p>
          </>
        )}

        {status === 'ambiguous' && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900">Connection may have failed</h1>
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Calendar connection may have failed. Please try again.
            </p>
            <p className="text-sm text-gray-500">
              If the problem persists, contact support.
            </p>
          </>
        )}

        <p className="text-xs text-gray-400">
          Redirecting to settings in {REDIRECT_DELAY_MS / 1000} seconds…
        </p>

        <a
          href={settingsPath}
          className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
        >
          Go to settings now
        </a>
      </div>
    </div>
  );
};

export default CalendarOAuthCallback;
