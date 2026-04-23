import { useState, useCallback } from 'react';
import type { Notification } from '../types';

let _id = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((n: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>) => {
    const notification: Notification = {
      ...n,
      id: String(++_id),
      userId: '',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notification, ...prev]);
    return notification.id;
  }, []);

  const markRead = useCallback(async (id: string) => {
    const prevNotifications = [...notifications];
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) reject(new Error('Failed to update notification'));
          else resolve(true);
        }, 500);
      });
    } catch (err) {
      // Rollback
      setNotifications(prevNotifications);
      console.error('Failed to mark notification as read:', err);
    }
  }, [notifications]);

  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))), []);

  const remove = useCallback((id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id)), []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { notifications, add, markRead, markAllRead, remove, clearAll, unreadCount };
}
