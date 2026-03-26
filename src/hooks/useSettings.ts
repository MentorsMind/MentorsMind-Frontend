import { useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type ProfileVisibility = 'public' | 'private' | 'connections';

export interface NotificationPrefs {
  emailSessionReminder: boolean;
  emailNewBooking: boolean;
  emailPayment: boolean;
  emailMarketing: boolean;
  inAppSessionReminder: boolean;
  inAppNewBooking: boolean;
  inAppMessages: boolean;
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
    emailNewBooking: true,
    emailPayment: true,
    emailMarketing: false,
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
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const updateSettings = useCallback(<K extends keyof SettingsState>(
    section: K,
    updates: Partial<SettingsState[K]>
  ) => {
    // Optimistic update
    setSettings((prev: SettingsState) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));

    setSaveStatus('saving');

    // Simulate async save
    setTimeout(() => {
      try {
        setSettings((prev: SettingsState) => {
          const next = { ...prev, [section]: { ...prev[section], ...updates } };
          localStorage.setItem('userSettings', JSON.stringify(next));
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
