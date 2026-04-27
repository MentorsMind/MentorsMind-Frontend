import React, { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationBadge from './NotificationBadge'
import NotificationItem from './NotificationItem'
import type { Notification } from '../../types'

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: { title: string; items: Notification[] }[] = [
    { title: 'Today', items: [] },
    { title: 'Yesterday', items: [] },
    { title: 'Older', items: [] },
  ]

  for (const n of notifications) {
    const d = new Date(n.createdAt)
    if (isSameDay(d, today)) groups[0].items.push(n)
    else if (isSameDay(d, yesterday)) groups[1].items.push(n)
    else groups[2].items.push(n)
  }

  const handleMarkAll = () => {
    notifications.forEach((n: Notification) => { if (!n.isRead) markRead(n.id) })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none relative"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute top-1 right-1">{unreadCount > 0 ? <NotificationBadge /> : null}</span>
      </button>

      {open && (
        <div className="w-96 max-h-[60vh] overflow-auto absolute right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              <button onClick={handleMarkAll} className="text-xs text-gray-600">Mark all read</button>
              <button onClick={() => clearAll()} className="text-xs text-red-600">Clear</button>
            </div>
          </div>
          <div>
            {groups.every(g => g.items.length === 0) && (
              <div className="p-6 text-center text-sm text-gray-500">You're all caught up</div>
            )}

            {groups.map((g) => g.items.length > 0 && (
              <div key={g.title}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">{g.title}</div>
                <div className="divide-y">
                  {g.items.map((n: Notification) => (
                    <NotificationItem key={n.id} n={n} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t text-right">
            <a href="/settings" className="text-sm text-gray-600">Notification settings</a>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
