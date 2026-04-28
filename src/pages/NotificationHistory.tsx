import React from 'react'
import { useNotifications } from '../hooks/useNotifications'
import EmptyState from '../components/ui/EmptyState'

const groupByDate = (items: any[]) => {
  const map: Record<string, any[]> = {}
  items.forEach((it) => {
    const key = new Date(it.createdAt).toLocaleDateString()
    map[key] = map[key] || []
    map[key].push(it)
  })
  return map
}

const NotificationHistory: React.FC = () => {
  const { notifications, markRead, remove } = useNotifications()
  const grouped = groupByDate(notifications)

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Notification History</h2>
      {Object.keys(grouped).length === 0 && (
        <EmptyState title="You're all caught up" description="No notifications to show right now." />
      )}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{date}</div>
          <div className="border rounded">
            {items.map((n: any) => (
              <div key={n.id} className="p-3 flex justify-between items-start border-b">
                <div>
                  <div className="font-medium">{n.title || 'Update'}</div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {!n.read && <button className="text-xs text-blue-600" onClick={() => markRead(n.id)}>Mark read</button>}
                  <button className="text-xs text-red-600" onClick={() => remove(n.id)}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationHistory
