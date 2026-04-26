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
  loading: boolean
  hasMore: boolean
  markRead: (id: string) => void
  dismiss: (id: string) => void
  snooze: (id: string, minutes?: number) => void
  clearAll: () => void
  loadMore: () => void
}

const defaultPrefs: Preferences = { sounds: true, toasts: true, push: false }

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [toasts, setToasts] = useState<NotificationPayload[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
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

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const result = await notificationService.fetchAll(pageNum)
      if (pageNum === 1) {
        setNotifications(result.data)
      } else {
        setNotifications((prev) => [...prev, ...result.data])
      }
      setHasMore(result.data.length > 0 && notifications.length + result.data.length < result.meta.total)
    } catch (e) {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [notifications.length])

  useEffect(() => {
    void fetchPage(1)
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

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      void fetchPage(nextPage)
    }
  }, [fetchPage, hasMore, loading, page])

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
      value={{ notifications, unreadCount, toasts, preferences, loading, hasMore, markRead, dismiss, snooze, clearAll, loadMore }}>
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
