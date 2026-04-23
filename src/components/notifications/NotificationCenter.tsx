import { useState, useEffect } from 'react';
import { SkeletonCard } from '../animations/SkeletonLoader';
import type { Notification } from '../../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
}

export default function NotificationCenter({ notifications, onMarkRead, onMarkAllRead, unreadCount }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate loading when opening
  useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && !loading && (
              <button onClick={onMarkAllRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-1">
                {[1, 2, 3].map(i => <SkeletonCard key={i} variant="notification" />)}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => onMarkRead(n.id)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
