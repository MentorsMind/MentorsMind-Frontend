import React from 'react';
import {
  Bell, Mail, Smartphone, Monitor, Clock, Newspaper,
  VolumeX, CalendarCheck, BadgeDollarSign, Star,
} from 'lucide-react';
import type { NotificationPrefs, ReminderTiming } from '../../hooks/useSettings';
import DeviceManager from '../notifications/DeviceManager';

interface NotificationSettingsProps {
  prefs: NotificationPrefs;
  onChange: (updates: Partial<NotificationPrefs>) => void;
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

const Toggle: React.FC<{
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ id, checked, onChange, label }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors
      focus:outline-none focus:ring-2 focus:ring-stellar/30
      ${checked ? 'bg-stellar' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow
        transition-transform ${checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5'}`}
    />
  </button>
);

// ─── Per-event rows ───────────────────────────────────────────────────────────

interface EventRowDef {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  emailKey: keyof NotificationPrefs;
  inAppKey: keyof NotificationPrefs;
  pushKey: keyof NotificationPrefs;
}

const EVENT_ROWS: EventRowDef[] = [
  {
    id: 'session-booked',
    label: 'Session Booked',
    description: 'Confirmation when a session is scheduled',
    icon: <CalendarCheck className="w-4 h-4 text-stellar shrink-0" />,
    emailKey: 'emailSessionBooked',
    inAppKey: 'inAppNewBooking',
    pushKey: 'pushNewBooking',
  },
  {
    id: 'session-reminder',
    label: 'Session Reminder',
    description: 'Reminder before an upcoming session',
    icon: <Clock className="w-4 h-4 text-blue-500 shrink-0" />,
    emailKey: 'emailSessionReminder',
    inAppKey: 'inAppSessionReminder',
    pushKey: 'pushSessionReminder',
  },
  {
    id: 'payment-received',
    label: 'Payment Received',
    description: 'Payment confirmations and receipts',
    icon: <BadgeDollarSign className="w-4 h-4 text-green-500 shrink-0" />,
    emailKey: 'emailPaymentReceived',
    inAppKey: 'inAppMessages',
    pushKey: 'pushMessages',
  },
  {
    id: 'review-received',
    label: 'Review Received',
    description: 'After a learner leaves you a review',
    icon: <Star className="w-4 h-4 text-amber-500 shrink-0" />,
    emailKey: 'emailReviewReceived',
    inAppKey: 'inAppMessages',
    pushKey: 'pushMessages',
  },
];

// ─── Reminder Timing ─────────────────────────────────────────────────────────

const REMINDER_OPTIONS: { value: ReminderTiming; label: string; sub: string }[] = [
  { value: '24h', label: '24h before', sub: 'Day-ahead prompt' },
  { value: '1h',  label: '1h before',  sub: 'One hour notice' },
  { value: '15min', label: '15 min before', sub: 'Last-minute alert' },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title, description, children,
}) => (
  <section className="space-y-3">
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    {children}
  </section>
);

// ─── Main component ───────────────────────────────────────────────────────────

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ prefs, onChange }) => {

  /** Set every boolean toggle to false — leaves reminderTiming untouched */
  const handleUnsubscribeAll = () => {
    onChange({
      emailSessionBooked: false,
      emailSessionReminder: false,
      emailPaymentReceived: false,
      emailReviewReceived: false,
      emailNewBooking: false,
      emailPayment: false,
      emailMarketing: false,
      emailWeeklyDigest: false,
      inAppSessionReminder: false,
      inAppNewBooking: false,
      inAppMessages: false,
      pushSessionReminder: false,
      pushNewBooking: false,
      pushMessages: false,
    });
  };

  const allOff =
    !prefs.emailSessionBooked &&
    !prefs.emailSessionReminder &&
    !prefs.emailPaymentReceived &&
    !prefs.emailReviewReceived &&
    !prefs.emailMarketing &&
    !prefs.emailWeeklyDigest &&
    !prefs.inAppSessionReminder &&
    !prefs.inAppNewBooking &&
    !prefs.inAppMessages &&
    !prefs.pushSessionReminder &&
    !prefs.pushNewBooking &&
    !prefs.pushMessages;

  return (
    <div className="space-y-8" id="notification-settings-panel">

      {/* Info banner */}
      <div className="flex items-start gap-2.5 text-sm text-gray-500 bg-gray-50 rounded-xl p-3.5">
        <Bell className="w-4 h-4 text-stellar shrink-0 mt-0.5" />
        <span>
          Control exactly which emails and alerts you receive. Changes are saved automatically
          and synced to your account.
        </span>
      </div>

      {/* ── Per-event toggles table ── */}
      <Section
        title="Notification Events"
        description="Choose which events trigger notifications for each channel."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className="text-left pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/2">
                  Event
                </th>
                <th className="pb-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Email
                    </span>
                  </div>
                </th>
                <th className="pb-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Monitor className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      In-App
                    </span>
                  </div>
                </th>
                <th className="pb-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Push
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {EVENT_ROWS.map((row) => (
                <tr key={row.id} className="group">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                        <p className="text-xs text-gray-400">{row.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <Toggle
                      id={`${row.id}-email`}
                      checked={prefs[row.emailKey] as boolean}
                      onChange={(v) => onChange({ [row.emailKey]: v })}
                      label={`${row.label} email`}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <Toggle
                      id={`${row.id}-inapp`}
                      checked={prefs[row.inAppKey] as boolean}
                      onChange={(v) => onChange({ [row.inAppKey]: v })}
                      label={`${row.label} in-app`}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <Toggle
                      id={`${row.id}-push`}
                      checked={prefs[row.pushKey] as boolean}
                      onChange={(v) => onChange({ [row.pushKey]: v })}
                      label={`${row.label} push`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="border-t border-gray-100" />

      {/* ── Reminder timing ── */}
      <Section
        title="Session Reminder Timing"
        description="How far in advance should we send your session reminder emails?"
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Reminder timing"
        >
          {REMINDER_OPTIONS.map((opt) => {
            const active = prefs.reminderTiming === opt.value;
            return (
              <button
                key={opt.value}
                id={`reminder-${opt.value}`}
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ reminderTiming: opt.value })}
                className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2
                  text-left transition-all focus:outline-none focus:ring-2 focus:ring-stellar/30
                  ${active
                    ? 'border-stellar bg-stellar/5 text-stellar'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className={`text-xs ${active ? 'text-stellar/70' : 'text-gray-400'}`}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <div className="border-t border-gray-100" />

      {/* ── Weekly digest ── */}
      <Section title="Digest & Updates">
        <div className="space-y-4">
          {/* Weekly digest */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Weekly Digest</p>
                <p className="text-xs text-gray-400">Summary of your week: sessions, earnings, and progress</p>
              </div>
            </div>
            <Toggle
              id="email-weekly-digest"
              checked={prefs.emailWeeklyDigest}
              onChange={(v) => onChange({ emailWeeklyDigest: v })}
              label="Weekly digest email"
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Marketing &amp; Updates</p>
                <p className="text-xs text-gray-400">Product news, tips, and feature announcements</p>
              </div>
            </div>
            <Toggle
              id="email-marketing"
              checked={prefs.emailMarketing}
              onChange={(v) => onChange({ emailMarketing: v })}
              label="Marketing emails"
            />
          </div>
        </div>
      </Section>

      <div className="border-t border-gray-100" />

      {/* ── Push Notification Devices ── */}
      <Section
        title="Push Notification Devices"
        description="Manage the devices registered to receive push notifications on your account."
      >
        <DeviceManager />
      </Section>

      <div className="border-t border-gray-100" />

      {/* ── Unsubscribe from all ── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
        p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2.5">
          <VolumeX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Unsubscribe from All</p>
            <p className="text-xs text-gray-400">
              Turn off every notification channel at once. You can re-enable them individually above.
            </p>
          </div>
        </div>
        <button
          id="unsubscribe-all-btn"
          onClick={handleUnsubscribeAll}
          disabled={allOff}
          aria-label="Unsubscribe from all notifications"
          className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl border border-red-200
            text-red-600 hover:bg-red-50 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allOff ? 'All notifications off' : 'Unsubscribe from all'}
        </button>
      </section>

    </div>
  );
};

export default NotificationSettings;
