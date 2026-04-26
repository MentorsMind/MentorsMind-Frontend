import React from 'react';
import { Shield, Eye, DollarSign, Search, Users } from 'lucide-react';
import type { PrivacySettings as PrivacySettingsType, ProfileVisibility } from '../../hooks/useSettings';

interface PrivacySettingsProps {
  settings: PrivacySettingsType;
  onChange: (updates: Partial<PrivacySettingsType>) => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stellar/30 ${checked ? 'bg-stellar' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
  </button>
);

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
  { value: 'connections', label: 'Connections only', description: 'Only people you\'ve connected with' },
  { value: 'private', label: 'Private', description: 'Only you can see your profile' },
];

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
        <Shield className="w-4 h-4 text-stellar shrink-0" />
        <span>Manage who can see your profile and what information is visible.</span>
      </div>

      {/* Profile Visibility */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Profile Visibility</h3>
        </div>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                settings.profileVisibility === opt.value
                  ? 'border-stellar bg-stellar/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="profileVisibility"
                value={opt.value}
                checked={settings.profileVisibility === opt.value}
                onChange={() => onChange({ profileVisibility: opt.value })}
                className="accent-stellar"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* Data Visibility Toggles */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-900">What others can see</h3>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Show Earnings</p>
              <p className="text-xs text-gray-400">Display your total earnings on your public profile</p>
            </div>
          </div>
          <Toggle
            checked={settings.showEarnings}
            onChange={v => onChange({ showEarnings: v })}
            label="Show earnings"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Show Session Count</p>
              <p className="text-xs text-gray-400">Display total number of sessions completed</p>
            </div>
          </div>
          <Toggle
            checked={settings.showSessionCount}
            onChange={v => onChange({ showSessionCount: v })}
            label="Show session count"
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Search Indexing</p>
              <p className="text-xs text-gray-400">Allow your profile to appear in search results</p>
            </div>
          </div>
          <Toggle
            checked={settings.allowSearchIndexing}
            onChange={v => onChange({ allowSearchIndexing: v })}
            label="Allow search indexing"
          />
        </div>
      </section>
    </div>
  );
};

export default PrivacySettings;
