import React, { useRef } from 'react';
import { useA11y } from '../../hooks/useA11y';
import FocusTrap from './FocusTrap';
import type { A11ySettings } from '../../hooks/useA11y';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONT_OPTIONS: { value: A11ySettings['fontSize']; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra Large' },
];

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
];

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const { settings, update, reset } = useA11y();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <FocusTrap
        active={isOpen}
        returnFocusRef={closeButtonRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="a11y-panel-title" className="text-xl font-bold text-gray-900">
            Accessibility Settings
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close accessibility settings"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* High Contrast */}
        <Toggle
          id="high-contrast"
          label="High Contrast Mode"
          description="Increases color contrast for better visibility"
          checked={settings.highContrast}
          onChange={v => update('highContrast', v)}
        />

        {/* Reduced Motion */}
        <Toggle
          id="reduced-motion"
          label="Reduce Motion"
          description="Minimizes animations and transitions"
          checked={settings.reducedMotion}
          onChange={v => update('reducedMotion', v)}
        />

        {/* Font Size */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-2">Text Size</legend>
          <div className="flex gap-2" role="group" aria-label="Text size options">
            {FONT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update('fontSize', opt.value)}
                aria-pressed={settings.fontSize === opt.value}
                className={[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-1',
                  settings.fontSize === opt.value
                    ? 'border-stellar bg-stellar/10 text-stellar'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Language */}
        <div>
          <label htmlFor="language-select" className="block text-sm font-semibold text-gray-700 mb-2">
            Language
          </label>
          <select
            id="language-select"
            value={settings.language}
            onChange={e => update('language', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-stellar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar transition-colors"
          >
            {LANG_OPTIONS.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar rounded"
          >
            Reset to defaults
          </button>
        </div>
      </FocusTrap>
    </div>
  );
};

interface ToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 cursor-pointer">
        {label}
      </label>
      <p id={`${id}-desc`} className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-describedby={`${id}-desc`}
      onClick={() => onChange(!checked)}
      className={[
        'relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2',
        checked ? 'bg-stellar' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
      <span className="sr-only">{checked ? 'Enabled' : 'Disabled'}</span>
    </button>
  </div>
);

export default AccessibilityPanel;
