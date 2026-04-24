import React from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import type { Notification } from '../../types'

export const NotificationItem: React.FC<{ n: Notification }> = ({ n }) => {
  const { markRead, remove } = useNotifications()
  return (
    <div className={`p-3 border-b last:border-b-0 ${n.isRead ? 'bg-surface' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-text">{n.title || 'Update'}</div>
          <div className="text-sm text-muted-foreground">{n.message}</div>
          <div className="text-xs text-muted-foreground/70">{new Date(n.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex flex-col gap-2 ml-3">
          {!n.isRead && (
            <button className="text-xs text-primary" onClick={() => markRead(n.id)}>
              Mark read
            </button>
          )}
          <button className="text-xs text-destructive" onClick={() => remove(n.id)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem
