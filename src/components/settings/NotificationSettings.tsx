import React from 'react';
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';
import type { NotificationPrefs } from '../../hooks/useSettings';

interface NotificationSettingsProps {
  prefs: NotificationPrefs;
  onChange: (updates: Partial<NotificationPrefs>) => void;
}

interface EventRow {
  label: string;
  description: string;
  emailKey: keyof NotificationPrefs;
  inAppKey: keyof NotificationPrefs;
  pushKey: keyof NotificationPrefs;
}

const EVENT_ROWS: EventRow[] = [
  {
    label: 'Session Reminders',
    description: 'Before an upcoming session',
    emailKey: 'emailSessionReminder',
    inAppKey: 'inAppSessionReminder',
    pushKey: 'pushSessionReminder',
  },
  {
    label: 'New Bookings',
    description: 'When someone books a session',
    emailKey: 'emailNewBooking',
    inAppKey: 'inAppNewBooking',
    pushKey: 'pushNewBooking',
  },
  {
    label: 'Messages',
    description: 'Direct messages from users',
    emailKey: 'emailPayment',
    inAppKey: 'inAppMessages',
    pushKey: 'pushMessages',
  },
  {
    label: 'Payments',
    description: 'Payment confirmations and receipts',
    emailKey: 'emailPayment',
    inAppKey: 'inAppMessages',
    pushKey: 'pushMessages',
  },
];

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

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ prefs, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
        <Bell className="w-4 h-4 text-stellar shrink-0" />
        <span>Control how and when you receive notifications for each event type.</span>
      </div>

      {/* Channel headers */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr>
              <th className="text-left pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/2">Event</th>
              <th className="pb-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                </div>
              </th>
              <th className="pb-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In-App</span>
                </div>
              </th>
              <th className="pb-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Push</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {EVENT_ROWS.map(row => (
              <tr key={row.label} className="group">
                <td className="py-4 pr-4">
                  <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                  <p className="text-xs text-gray-400">{row.description}</p>
                </td>
                <td className="py-4 text-center">
                  <Toggle
                    checked={prefs[row.emailKey] as boolean}
                    onChange={v => onChange({ [row.emailKey]: v })}
                    label={`${row.label} email`}
                  />
                </td>
                <td className="py-4 text-center">
                  <Toggle
                    checked={prefs[row.inAppKey] as boolean}
                    onChange={v => onChange({ [row.inAppKey]: v })}
                    label={`${row.label} in-app`}
                  />
                </td>
                <td className="py-4 text-center">
                  <Toggle
                    checked={prefs[row.pushKey] as boolean}
                    onChange={v => onChange({ [row.pushKey]: v })}
                    label={`${row.label} push`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Marketing & Updates</p>
            <p className="text-xs text-gray-400">Product news, tips, and feature announcements</p>
          </div>
          <Toggle
            checked={prefs.emailMarketing}
            onChange={v => onChange({ emailMarketing: v })}
            label="Marketing emails"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
