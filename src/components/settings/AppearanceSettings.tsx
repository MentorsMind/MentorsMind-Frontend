import React from 'react';
import { Sun, Moon, Monitor, Type } from 'lucide-react';
import type { AppearanceSettings as AppearanceSettingsType, Theme, FontSize } from '../../hooks/useSettings';

interface AppearanceSettingsProps {
  settings: AppearanceSettingsType;
  onChange: (updates: Partial<AppearanceSettingsType>) => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> },
];

const FONT_OPTIONS: { value: FontSize; label: string; sample: string }[] = [
  { value: 'small', label: 'Small', sample: 'Aa' },
  { value: 'medium', label: 'Medium', sample: 'Aa' },
  { value: 'large', label: 'Large', sample: 'Aa' },
];

const FONT_SAMPLE_SIZE: Record<FontSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-xl',
};

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Theme</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ theme: opt.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                settings.theme === opt.value
                  ? 'border-stellar bg-stellar/5 text-stellar'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {opt.icon}
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {settings.theme === 'system' ? 'Follows your device\'s system preference.' : `Always uses ${settings.theme} mode.`}
        </p>
      </section>

      <div className="border-t border-gray-100" />

      {/* Font Size */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Font Size</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {FONT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ fontSize: opt.value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                settings.fontSize === opt.value
                  ? 'border-stellar bg-stellar/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`font-bold ${FONT_SAMPLE_SIZE[opt.value]} ${settings.fontSize === opt.value ? 'text-stellar' : 'text-gray-600'}`}>
                {opt.sample}
              </span>
              <span className="text-xs font-semibold text-gray-500">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
          <p className={`font-medium text-gray-800 ${FONT_SAMPLE_SIZE[settings.fontSize]}`}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AppearanceSettings;
