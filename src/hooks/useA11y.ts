import { useState, useEffect, useCallback } from 'react';
import { prefersReducedMotion, prefersHighContrast, announce } from '../utils/a11y.utils';

const STORAGE_KEY = 'a11y_settings';

export interface A11ySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  language: string;
}

const defaultSettings = (): A11ySettings => ({
  highContrast: prefersHighContrast(),
  reducedMotion: prefersReducedMotion(),
  fontSize: 'normal',
  language: navigator.language.split('-')[0] || 'en',
});

export const useA11y = () => {
  const [settings, setSettings] = useState<A11ySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings(), ...JSON.parse(saved) } : defaultSettings();
    } catch {
      return defaultSettings();
    }
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply high contrast class to root
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  // Apply reduced motion class to root
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  }, [settings.reducedMotion]);

  // Apply font size class to root
  useEffect(() => {
    document.documentElement.classList.remove('font-large', 'font-xlarge');
    if (settings.fontSize !== 'normal') {
      document.documentElement.classList.add(`font-${settings.fontSize}`);
    }
  }, [settings.fontSize]);

  // Sync with OS-level preference changes
  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMq = window.matchMedia('(prefers-contrast: more)');

    const onMotion = (e: MediaQueryListEvent) =>
      setSettings(s => ({ ...s, reducedMotion: e.matches }));
    const onContrast = (e: MediaQueryListEvent) =>
      setSettings(s => ({ ...s, highContrast: e.matches }));

    motionMq.addEventListener('change', onMotion);
    contrastMq.addEventListener('change', onContrast);
    return () => {
      motionMq.removeEventListener('change', onMotion);
      contrastMq.removeEventListener('change', onContrast);
    };
  }, []);

  const update = useCallback(<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings());
    announce('Accessibility settings reset to defaults.');
  }, []);

  return { settings, update, reset, announce };
};
