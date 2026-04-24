export type ReminderType = 'email' | 'in-app' | 'sms' | 'prep';

export interface Reminder {
  id: string;
  sessionId: string;
  type: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'cancelled' | 'snoozed';
  snoozeCount: number;
  message: string;
  lastSnoozedAt?: string;
}

export interface ReminderSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  customTimes: number[];
  sessionPrepReminders: boolean;
  calendarSyncReminders: boolean;
  mentorSpecificPreferences: Record<string, any>;
}

export interface ReminderHistoryItem extends Reminder {
  sentAt: string;
}
