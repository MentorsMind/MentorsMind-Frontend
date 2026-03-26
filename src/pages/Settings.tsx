import { useEffect, useMemo, useState } from 'react';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';

type EmailNotificationPreferences = {
  sessionReminders: boolean;
  sessionUpdates: boolean;
  mentorMessages: boolean;
  productUpdates: boolean;
  marketing: boolean;
  securityAlerts: boolean;
};

const STORAGE_KEY = 'emailNotificationPreferences';

const DEFAULT_PREFERENCES: EmailNotificationPreferences = {
  sessionReminders: true,
  sessionUpdates: true,
  mentorMessages: true,
  productUpdates: true,
  marketing: false,
  securityAlerts: true,
};

function readPreferences(): EmailNotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<EmailNotificationPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(prefs: EmailNotificationPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function ToggleRow(props: {
  id: keyof EmailNotificationPreferences;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const { id, label, description, checked, disabled, onChange } = props;

  return (
    <div className="flex items-start justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <label htmlFor={String(id)} className="block text-sm font-extrabold text-gray-900">
          {label}
        </label>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="pt-0.5">
        <button
          id={String(id)}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled ? 'true' : undefined}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={[
            'relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-stellar/15',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            checked ? 'bg-stellar border-stellar/30' : 'bg-gray-100 border-gray-200 hover:bg-gray-200',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState<EmailNotificationPreferences>(() => readPreferences());
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    document.title = 'Settings — Email Notifications';
  }, []);

  useEffect(() => {
    writePreferences(prefs);
    setStatus('saved');
    const t = window.setTimeout(() => setStatus('idle'), 1400);
    return () => window.clearTimeout(t);
  }, [prefs]);

  const sections = useMemo(
    () => [
      {
        title: 'Sessions',
        icon: Mail,
        items: [
          {
            id: 'sessionReminders' as const,
            label: 'Session reminders',
            description: 'Get a heads-up before your upcoming sessions.',
          },
          {
            id: 'sessionUpdates' as const,
            label: 'Session updates',
            description: 'Be notified about reschedules, cancellations, and confirmations.',
          },
        ],
      },
      {
        title: 'Messages',
        icon: Mail,
        items: [
          {
            id: 'mentorMessages' as const,
            label: 'Mentor messages',
            description: 'Receive an email when you get a new message from a mentor or learner.',
          },
        ],
      },
      {
        title: 'Product',
        icon: Sparkles,
        items: [
          {
            id: 'productUpdates' as const,
            label: 'Product updates',
            description: 'Occasional updates about new features and improvements.',
          },
          {
            id: 'marketing' as const,
            label: 'Tips and offers',
            description: 'Personalized tips, promotions, and platform announcements.',
          },
        ],
      },
      {
        title: 'Security',
        icon: ShieldCheck,
        items: [
          {
            id: 'securityAlerts' as const,
            label: 'Security alerts',
            description: 'Important account and security notifications (recommended).',
            disabled: true,
          },
        ],
      },
    ],
    [],
  );

  return (
    <div className="bg-gradient-to-b from-stellar/5 via-white to-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stellar/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-stellar">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email notifications
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900">
              Notification <span className="text-stellar">Preferences</span>
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Choose what you want to receive via email. Changes are saved automatically on this device.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              aria-live="polite"
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-all',
                status === 'saved'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-100 bg-white text-gray-400',
              ].join(' ')}
            >
              {status === 'saved' ? 'Saved' : 'Up to date'}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100">
                    <Icon className="h-5 w-5 text-stellar" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-black text-gray-900">{section.title}</h2>
                </div>

                <div className="grid gap-4">
                  {section.items.map((item) => (
                    <ToggleRow
                      key={String(item.id)}
                      id={item.id}
                      label={item.label}
                      description={item.description}
                      checked={prefs[item.id]}
                      disabled={'disabled' in item ? item.disabled : false}
                      onChange={(next) =>
                        setPrefs((prev) => ({
                          ...prev,
                          [item.id]: next,
                        }))
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

