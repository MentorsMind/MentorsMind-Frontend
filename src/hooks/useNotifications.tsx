import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { notificationService, NotificationPayload } from '../services/notification.service'

interface Preferences {
  sounds: boolean
  toasts: boolean
  push: boolean
}

interface NotificationsContextValue {
  notifications: NotificationPayload[]
  unreadCount: number
  toasts: NotificationPayload[]
  preferences: Preferences
  markRead: (id: string) => void
  dismiss: (id: string) => void
  snooze: (id: string, minutes?: number) => void
  clearAll: () => void
}

const defaultPrefs: Preferences = { sounds: true, toasts: true, push: false }

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [toasts, setToasts] = useState<NotificationPayload[]>([])
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem('mm:notification:prefs')
      return raw ? JSON.parse(raw) : defaultPrefs
    } catch (e) {
      return defaultPrefs
    }
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    localStorage.setItem('mm:notification:prefs', JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    notificationService.fetchAll().then((list) => setNotifications(list || []))
    const unsub = notificationService.subscribe((n) => {
      setNotifications((s) => [n, ...s])
      if (preferences.toasts) setToasts((s) => [n, ...s].slice(0, 5))
      if (preferences.sounds) {
        if (!audioRef.current) audioRef.current = new Audio('/assets/notification.mp3')
        try {
          audioRef.current!.currentTime = 0
          audioRef.current!.play().catch(() => {})
        } catch (e) {}
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markRead = async (id: string) => {
    setNotifications((s) => s.map((x) => (x.id === id ? { ...x, read: true } : x)))
    notificationService.markRead(id)
  }

  const dismiss = async (id: string) => {
    setNotifications((s) => s.filter((x) => x.id !== id))
    setToasts((s) => s.filter((x) => x.id !== id))
    notificationService.dismiss(id)
  }

  const snooze = async (id: string, minutes = 10) => {
    setNotifications((s) => s.map((x) => (x.id === id ? { ...x, snoozedUntil: Date.now() + minutes * 60000 } as any : x)))
    notificationService.snooze(id, minutes)
  }

  const clearAll = () => setNotifications([])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, toasts, preferences, markRead, dismiss, snooze, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider')
  return ctx
}

export default useNotifications
