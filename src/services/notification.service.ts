export type NotificationPriority = 'info' | 'success' | 'warning' | 'error'

export interface NotificationPayload {
  id: string
  title?: string
  message: string
  createdAt: string
  read?: boolean
  category?: string
  priority?: NotificationPriority
  meta?: Record<string, any>
}

const API_BASE = '/api/notifications'

export const notificationService = {
  async fetchAll(page = 1, limit = 20): Promise<{ data: NotificationPayload[]; meta: { total: number; page: number; limit: number } }> {
    try {
      const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`)
      if (!res.ok) return { data: [], meta: { total: 0, page, limit } }
      const body = await res.json()
      // Backend returns { data: [...], meta: { ... } }
      if (body && typeof body === 'object' && 'data' in body) {
        return body
      }
      // Fallback for old/direct array response
      return { data: Array.isArray(body) ? body : [], meta: { total: Array.isArray(body) ? body.length : 0, page, limit } }
    } catch (e) {
      return { data: [], meta: { total: 0, page, limit } }
    }
  },
  async markRead(id: string) {
    await fetch(`${API_BASE}/${id}/read`, { method: 'POST' }).catch(() => {})
  },
  async dismiss(id: string) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' }).catch(() => {})
  },
  async snooze(id: string, minutes = 10) {
    await fetch(`${API_BASE}/${id}/snooze`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ minutes }),
    }).catch(() => {})
  },
  subscribe(onMessage: (n: NotificationPayload) => void) {
    let ws: WebSocket | null = null
    try {
      const loc = window.location
      const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${loc.host}/ws/notifications`
      ws = new WebSocket(wsUrl)
      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data)
          onMessage(data)
        } catch (e) {
          // ignore
        }
      })
    } catch (e) {
      // fallback: no realtime
    }
    return () => {
      try {
        ws && ws.close()
      } catch (e) {}
    }
  },
}

export default notificationService
