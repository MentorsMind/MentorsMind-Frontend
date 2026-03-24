import { useState, useCallback, useEffect } from 'react';
import type { Session, Reminder, ReminderSettings, ReminderHistoryItem, ReminderType } from '../types';

const INITIAL_SETTINGS: ReminderSettings = {
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  customTimes: [60, 1440], // 1 hour and 24 hours before
  sessionPrepReminders: true,
  calendarSyncReminders: true,
  mentorSpecificPreferences: {},
};

// Mock data generator for initial state
const generateMockHistory = (): ReminderHistoryItem[] => {
  const now = new Date();
  return [
    {
      id: 'h1',
      sessionId: 's1',
      type: 'email',
      scheduledTime: new Date(now.getTime() - 86400000).toISOString(),
      status: 'sent',
      sentAt: new Date(now.getTime() - 86400000).toISOString(),
      snoozeCount: 0,
      message: 'Reminder: Your session on React Design Patterns starts in 24 hours.',
    },
    {
      id: 'h2',
      sessionId: 's1',
      type: 'in-app',
      scheduledTime: new Date(now.getTime() - 3600000).toISOString(),
      status: 'sent',
      sentAt: new Date(now.getTime() - 3600000).toISOString(),
      snoozeCount: 0,
      message: 'Your session is starting in 1 hour!',
    },
  ];
};

export const useReminders = (sessions: Session[] = []) => {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem('reminder_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<ReminderHistoryItem[]>(generateMockHistory());

  useEffect(() => {
    localStorage.setItem('reminder_settings', JSON.stringify(settings));
  }, [settings]);

  // Generate reminders based on sessions and settings
  useEffect(() => {
    const newReminders: Reminder[] = [];
    const now = new Date();

    sessions.forEach(session => {
      const sessionStart = new Date(session.startTime);
      
      // Only generate for upcoming sessions
      if (sessionStart > now) {
        settings.customTimes.forEach(minutes => {
          const reminderTime = new Date(sessionStart.getTime() - minutes * 60000);
          
          // Only if reminder time is in the future
          if (reminderTime > now) {
            const id = `rem-${session.id}-${minutes}`;
            
            // In a real app, we'd check if this reminder was already dismissed
            newReminders.push({
              id,
              sessionId: session.id,
              type: minutes >= 1440 ? 'email' : 'in-app',
              scheduledTime: reminderTime.toISOString(),
              status: 'pending',
              snoozeCount: 0,
              message: `Your session on ${session.topic} starts in ${minutes >= 60 ? Math.floor(minutes/60) + ' hours' : minutes + ' minutes'}.`,
            });
          }
        });

        if (settings.sessionPrepReminders) {
          const prepTime = new Date(sessionStart.getTime() - 15 * 60000); // 15 mins before
          if (prepTime > now) {
            newReminders.push({
              id: `prep-${session.id}`,
              sessionId: session.id,
              type: 'prep',
              scheduledTime: prepTime.toISOString(),
              status: 'pending',
              snoozeCount: 0,
              message: `Time to prepare for your session: ${session.topic}!`,
            });
          }
        }
      }
    });

    setUpcomingReminders(newReminders.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    ));
  }, [sessions, settings]);

  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateMentorPreference = useCallback((mentorId: string, pref: Partial<ReminderSettings>) => {
    setSettings(prev => ({
      ...prev,
      mentorSpecificPreferences: {
        ...prev.mentorSpecificPreferences,
        [mentorId]: pref,
      }
    }));
  }, []);

  const snoozeReminder = useCallback((reminderId: string, minutes: number = 15) => {
    setUpcomingReminders((prev: Reminder[]) => prev.map((rem: Reminder) => {
      if (rem.id === reminderId) {
        const newTime = new Date(new Date().getTime() + minutes * 60000);
        return {
          ...rem,
          status: 'snoozed' as const,
          scheduledTime: newTime.toISOString(),
          snoozeCount: rem.snoozeCount + 1,
          lastSnoozedAt: new Date().toISOString(),
        };
      }
      return rem;
    }).sort((a: Reminder, b: Reminder) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    ));
  }, []);

  const dismissReminder = useCallback((reminderId: string) => {
    setUpcomingReminders((prev: Reminder[]) => {
      const dismissed = prev.find((r: Reminder) => r.id === reminderId);
      if (dismissed) {
        setHistory((h: ReminderHistoryItem[]) => [{
          ...dismissed,
          status: 'cancelled',
          sentAt: new Date().toISOString(),
        } as ReminderHistoryItem, ...h]);
      }
      return prev.filter((rem: Reminder) => rem.id !== reminderId);
    });
  }, []);

  const addCustomTime = useCallback((minutes: number) => {
    if (!settings.customTimes.includes(minutes)) {
      setSettings((prev: ReminderSettings) => ({
        ...prev,
        customTimes: [...prev.customTimes, minutes].sort((a: number, b: number) => a - b),
      }));
    }
  }, [settings.customTimes]);

  const removeCustomTime = useCallback((minutes: number) => {
    setSettings((prev: ReminderSettings) => ({
      ...prev,
      customTimes: prev.customTimes.filter((m: number) => m !== minutes),
    }));
  }, []);

  return {
    settings,
    upcomingReminders,
    history,
    updateSettings,
    updateMentorPreference,
    snoozeReminder,
    dismissReminder,
    addCustomTime,
    removeCustomTime,
  };
};
