export interface Notification {
  id: string;
  type: 'session_booking' | 'payment_confirmed' | 'session_cancelled' | 'session_rescheduled' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface WebSocketNotificationPayload {
  sessionId?: string;
  sessionTitle?: string;
  paymentId?: string;
  amount?: string;
  currency?: string;
  senderName?: string;
  conversationId?: string;
  content?: string;
  message?: string;
  [key: string]: any;
}

export interface ToastNotification {
  id: string;
  notification: Notification;
  onClose: (id: string) => void;
  onAction?: (id: string) => void;
}

export interface NotificationSettings {
  enableToasts: boolean;
  enableSounds: boolean;
  enableDesktopNotifications: boolean;
  sessionBookings: boolean;
  paymentConfirmations: boolean;
  sessionCancellations: boolean;
  sessionReschedules: boolean;
  messages: boolean;
  systemNotifications: boolean;
}
