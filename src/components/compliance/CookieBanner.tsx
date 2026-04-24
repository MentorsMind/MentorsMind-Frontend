import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'mm_cookie_consent';

interface CookieConsent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
}

const defaultPreferences = {
  analytics: false,
  marketing: false,
};

function loadConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as CookieConsent : null;
  } catch {
    return null;
  }
}

const CookieBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => !loadConsent());
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const openPreferences = () => {
      const saved = loadConsent();
      setPreferences({
        analytics: saved?.analytics ?? false,
        marketing: saved?.marketing ?? false,
      });
      setExpanded(true);
      setIsOpen(true);
    };

    window.addEventListener('open-cookie-preferences', openPreferences);
    return () => window.removeEventListener('open-cookie-preferences', openPreferences);
  }, []);

  const persist = (analytics: boolean, marketing: boolean) => {
    const payload: CookieConsent = {
      essential: true,
      analytics,
      marketing,
      acceptedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setIsOpen(false);
    setExpanded(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-[105] md:left-auto md:max-w-xl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-950">Cookie preferences</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              We use essential cookies to keep MentorMinds secure. Optional analytics and marketing cookies are off until you opt in.
            </p>
          </div>
          <button
            onClick={() => setExpanded((current) => !current)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            {expanded ? 'Hide' : 'Manage'}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
            <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
              <span>
                <span className="block font-semibold text-slate-900">Essential cookies</span>
                <span className="block text-xs text-slate-500">Required for login, security, and wallet sessions.</span>
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">Always on</span>
            </label>

            <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
              <span>
                <span className="block font-semibold text-slate-900">Analytics cookies</span>
                <span className="block text-xs text-slate-500">Help us understand performance and feature usage.</span>
              </span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between gap-4 text-sm text-slate-700">
              <span>
                <span className="block font-semibold text-slate-900">Marketing cookies</span>
                <span className="block text-xs text-slate-500">Used only if you want product updates and campaigns.</span>
              </span>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => persist(true, true)}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Accept all
          </button>
          <button
            onClick={() => persist(false, false)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Essential only
          </button>
          <button
            onClick={() => persist(preferences.analytics, preferences.marketing)}
            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            Save preferences
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Read our <Link to="/privacy" className="font-semibold text-blue-700 hover:underline">Privacy Policy</Link> for details on data retention and portability.
        </p>
      </div>
    </div>
  );
};

export default CookieBanner;
