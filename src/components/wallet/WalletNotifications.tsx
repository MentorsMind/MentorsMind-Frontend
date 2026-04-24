import { useState } from 'react';
import type { WalletNotification } from '../../types/wallet.types';

interface WalletNotificationsProps {
  notifications: WalletNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll?: () => void;
}

export const WalletNotifications = ({ 
  notifications, 
  onMarkAsRead,
  onClearAll 
}: WalletNotificationsProps) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: WalletNotification['type']) => {
    switch (type) {
      case 'transaction':
        return (
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        );
      case 'security':
        return (
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case 'balance':
        return (
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {notifications.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-sm text-primary hover:opacity-80 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface text-text hover:bg-border/30'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface text-text hover:bg-border/30'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-background rounded-lg shadow p-8 text-center border border-border">
            <svg className="w-16 h-16 mx-auto mb-4 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-muted-foreground font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && onMarkAsRead(notification.id)}
              className={`bg-background rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md border border-border ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {getNotificationIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold ${!notification.read ? 'text-text' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    {notification.actionUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = notification.actionUrl!;
                        }}
                        className="text-sm text-primary hover:opacity-80 font-medium"
                      >
                        View Details →
                      </button>
                    )}
                    
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="text-sm text-muted-foreground hover:text-text"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-8 bg-background rounded-lg shadow p-6 border border-border">
        <h3 className="font-semibold text-lg mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { id: 'transaction', label: 'Transaction notifications', description: 'Get notified about incoming and outgoing transactions' },
            { id: 'security', label: 'Security alerts', description: 'Important security updates and warnings' },
            { id: 'balance', label: 'Balance updates', description: 'Notifications about balance changes' },
            { id: 'system', label: 'System notifications', description: 'Updates about the wallet system' }
          ].map((pref) => (
            <label key={pref.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 w-4 h-4 text-primary rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
