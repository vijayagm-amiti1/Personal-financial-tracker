import { useCallback, useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type { DevAccount, DevCategory, EndpointConfig } from '../types/report'
import type { RecurringFormValues, RecurringRecord } from '../types/recurring'
import { authFetch } from '../utils/authFetch'

type UseRecurringDataArgs = {
  userId: string
  accounts: DevAccount[]
  categories: DevCategory[]
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

function mapRecurringRecord(item: unknown): RecurringRecord {
  const record = item as Record<string, unknown>

  return {
    id: String(record.id),
    userId: String(record.userId),
    title: String(record.title ?? ''),
    type: String(record.type ?? 'expense') as RecurringRecord['type'],
    amount: Number(record.amount ?? 0),
    categoryId: String(record.categoryId ?? ''),
    categoryName: record.categoryName ? String(record.categoryName) : null,
    accountId: String(record.accountId ?? ''),
    accountName: record.accountName ? String(record.accountName) : null,
    frequency: String(record.frequency ?? 'monthly') as RecurringRecord['frequency'],
    startDate: String(record.startDate ?? ''),
    endDate: record.endDate ? String(record.endDate) : null,
    nextRunDate: String(record.nextRunDate ?? ''),
    autoCreateTransaction: Boolean(record.autoCreateTransaction),
  }
}

function useRecurringData({ userId }: UseRecurringDataArgs) {
  const [items, setItems] = useState<RecurringRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const configRef = useRef<EndpointConfig | null>(null)

  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (configRef.current === null) {
        configRef.current = await loadEndpointConfig()
      }

      const endpoint = configRef.current.recurring?.getAll
      if (!endpoint?.path) {
        setItems([])
        return
      }

      const url = new URL(endpoint.path, configRef.current.baseUrl)

      const response = await authFetch(url.toString(), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load recurring items.')
      }

      const payload = await response.json()
      setItems(Array.isArray(payload) ? payload.map(mapRecurringRecord) : [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load recurring items.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveRecurringItem = async (values: RecurringFormValues, recurringId?: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = recurringId
      ? configRef.current.recurring?.update
      : configRef.current.recurring?.create

    if (!endpoint?.path) {
      throw new Error('Recurring endpoint is not configured.')
    }

    const url = new URL(
      recurringId ? endpoint.path.replace('{recurringId}', recurringId) : endpoint.path,
      configRef.current.baseUrl,
    )

    const response = await authFetch(url.toString(), {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: values.title.trim(),
        type: values.type,
        amount: Number(values.amount),
        categoryId: values.categoryId,
        accountId: values.accountId,
        frequency: values.frequency,
        startDate: values.startDate,
        endDate: values.endDate.trim() === '' ? null : values.endDate,
        autoCreateTransaction: values.autoCreateTransaction,
      }),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to save recurring item.')
    }

    await reload()
  }

  const deleteRecurringItem = async (recurringId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.recurring?.delete
    if (!endpoint?.path) {
      throw new Error('Recurring delete endpoint is not configured.')
    }

    const url = new URL(endpoint.path.replace('{recurringId}', recurringId), configRef.current.baseUrl)

    const response = await authFetch(url.toString(), { method: endpoint.method })
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to delete recurring item.')
    }

    await reload()
  }

  return {
    items,
    isLoading,
    error,
    reload,
    saveRecurringItem,
    deleteRecurringItem,
  }
}

export default useRecurringData
