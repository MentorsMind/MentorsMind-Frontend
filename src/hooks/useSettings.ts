import { useState, useCallback, useEffect } from 'react';
import api from '../services/api.client';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type ProfileVisibility = 'public' | 'private' | 'connections';
export type ReminderTiming = '24h' | '1h' | '15min';

export interface NotificationPrefs {
  // Per-event email toggles
  emailSessionReminder: boolean;
  emailSessionBooked: boolean;
  emailPaymentReceived: boolean;
  emailReviewReceived: boolean;
  // Legacy key kept for backward compatibility
  emailNewBooking: boolean;
  emailPayment: boolean;
  // Extra email preferences
  emailMarketing: boolean;
  emailWeeklyDigest: boolean;
  // Session reminder lead time
  reminderTiming: ReminderTiming;
  // In-app toggles
  inAppSessionReminder: boolean;
  inAppNewBooking: boolean;
  inAppMessages: boolean;
  // Push toggles
  pushSessionReminder: boolean;
  pushNewBooking: boolean;
  pushMessages: boolean;
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  showEarnings: boolean;
  showSessionCount: boolean;
  allowSearchIndexing: boolean;
}

export interface AppearanceSettings {
  theme: Theme;
  fontSize: FontSize;
}

export interface SessionPreferences {
  defaultDuration: number;
  bufferTime: number;
  timezone: string;
  language: string;
}

export interface ConnectedAccounts {
  stellarWallet: string | null;
  calendarSync: boolean;
  calendarProvider: 'google' | 'outlook' | null;
}

export interface SettingsState {
  notifications: NotificationPrefs;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  session: SessionPreferences;
  connected: ConnectedAccounts;
}

const DEFAULT_SETTINGS: SettingsState = {
  notifications: {
    emailSessionReminder: true,
    emailSessionBooked: true,
    emailPaymentReceived: true,
    emailReviewReceived: true,
    // Legacy
    emailNewBooking: true,
    emailPayment: true,
    emailMarketing: false,
    emailWeeklyDigest: false,
    reminderTiming: '24h',
    inAppSessionReminder: true,
    inAppNewBooking: true,
    inAppMessages: true,
    pushSessionReminder: false,
    pushNewBooking: false,
    pushMessages: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEarnings: false,
    showSessionCount: true,
    allowSearchIndexing: true,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
  },
  session: {
    defaultDuration: 60,
    bufferTime: 15,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
  },
  connected: {
    stellarWallet: null,
    calendarSync: false,
    calendarProvider: null,
  },
};

function loadSettings(): SettingsState {
  try {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications ?? {}) },
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

/** Call PATCH /api/users/notifications with graceful localStorage fallback */
async function patchNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await api.patch('/users/notifications', prefs);
  } catch {
    // Backend unavailable in demo — silently fall back to localStorage-only persistence
  }
}

/** Call GET /api/users/notifications; returns null when the endpoint is unavailable */
async function fetchNotificationPrefs(): Promise<Partial<NotificationPrefs> | null> {
  try {
    const res = await api.get<Partial<NotificationPrefs>>('/users/notifications');
    return res.data;
  } catch {
    return null;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // On mount: attempt to fetch notification preferences from the server
  // and merge them over any locally-stored values, so the UI always
  // reflects the authoritative server state (AC: "Show current preference state on load")
  useEffect(() => {
    let cancelled = false;
    fetchNotificationPrefs().then((serverPrefs) => {
      if (!cancelled && serverPrefs) {
        setSettings((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, ...serverPrefs },
        }));
      }
    });
    return () => { cancelled = true; };
  }, []);

  const updateSettings = useCallback(<K extends keyof SettingsState>(
    section: K,
    updates: Partial<SettingsState[K]>
  ) => {
    // Optimistic UI update
    setSettings((prev: SettingsState) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));

    setSaveStatus('saving');

    setTimeout(() => {
      try {
        setSettings((prev: SettingsState) => {
          const next = { ...prev, [section]: { ...prev[section], ...updates } };
          localStorage.setItem('userSettings', JSON.stringify(next));

          // Persist notification preferences to the server
          // (AC: "Save preferences via PATCH /api/users/notifications")
          if (section === 'notifications') {
            void patchNotificationPrefs(next.notifications);
          }

          return next;
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 600);
  }, []);

  const resetSection = useCallback(<K extends keyof SettingsState>(section: K) => {
    updateSettings(section, DEFAULT_SETTINGS[section] as any);
  }, [updateSettings]);

  return { settings, updateSettings, resetSection, saveStatus };
}
