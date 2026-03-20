import { useCallback, useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type { EndpointConfig, NotificationRecord } from '../types/report'
import { authFetch } from '../utils/authFetch'

type UseNotificationsArgs = {
  userId: string
}

async function extractErrorMessage(response: Response) {
  try {
    const payload = await response.json()
    if (payload && typeof payload.message === 'string' && payload.message.trim() !== '') {
      return payload.message
    }
  } catch {
    return null
  }

  return null
}

function mapNotification(item: unknown): NotificationRecord {
  const record = item as Record<string, unknown>

  return {
    id: String(record.id),
    userId: String(record.userId),
    title: String(record.title ?? ''),
    message: String(record.message ?? ''),
    type: String(record.type ?? 'SYSTEM_UPDATE') as NotificationRecord['type'],
    isRead: Boolean(record.isRead),
    createdAt: String(record.createdAt ?? ''),
  }
}

function useNotifications({ userId }: UseNotificationsArgs) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const configRef = useRef<EndpointConfig | null>(null)

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (configRef.current === null) {
        configRef.current = await loadEndpointConfig()
      }

      const endpoint = configRef.current.notifications?.getAll
      if (!endpoint?.path) {
        setNotifications([])
        return
      }

      const url = new URL(endpoint.path, configRef.current.baseUrl)

      const response = await authFetch(url.toString(), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load notifications.')
      }

      const payload = (await response.json()) as unknown[]
      setNotifications(Array.isArray(payload) ? payload.map(mapNotification) : [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load notifications.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadNotifications()
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.notifications?.markAsRead
    if (!endpoint?.path) {
      return
    }

    const url = new URL(endpoint.path.replace('{notificationId}', notificationId), configRef.current.baseUrl)

    const response = await authFetch(url.toString(), { method: endpoint.method })
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to mark notification as read.')
    }

    const updated = mapNotification(await response.json())
    setNotifications((current) => current.map((item) => (item.id === notificationId ? updated : item)))
    return updated
  }

  const getNotificationById = async (notificationId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.notifications?.getById
    if (!endpoint?.path) {
      throw new Error('Notification detail endpoint is not configured.')
    }

    const url = new URL(endpoint.path.replace('{notificationId}', notificationId), configRef.current.baseUrl)

    const response = await authFetch(url.toString(), { cache: 'no-store' })
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to load notification detail.')
    }

    const detailedNotification = mapNotification(await response.json())
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? detailedNotification : item)),
    )
    return detailedNotification
  }

  const markAllAsRead = async () => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.notifications?.markAllAsRead
    if (!endpoint?.path) {
      return
    }

    const url = new URL(endpoint.path, configRef.current.baseUrl)

    const response = await authFetch(url.toString(), { method: endpoint.method })
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to mark all notifications as read.')
    }

    await loadNotifications()
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
  }
}

export default useNotifications
