import React from 'react'
import useNotifications from '../../hooks/useNotifications'

export const NotificationBadge: React.FC<{ className?: string }> = ({ className }) => {
  const { unreadCount } = useNotifications()
  if (unreadCount === 0) return null
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-2 py-0.5 ${className || ''}`}>
      {unreadCount}
    </span>
  )
}

export default NotificationBadge
