import { useCallback, useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type { EndpointConfig } from '../types/report'
import type { RuleFormValues, RuleRecord } from '../types/rule'
import { authFetch } from '../utils/authFetch'

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

function mapRule(item: unknown): RuleRecord {
  const record = item as Record<string, unknown>
  return {
    id: String(record.id),
    userId: String(record.userId),
    name: String(record.name ?? ''),
    enabled: Boolean(record.enabled),
    priority: Number(record.priority ?? 1),
    conditionField: String(record.conditionField ?? 'merchant') as RuleRecord['conditionField'],
    conditionOperator: String(record.conditionOperator ?? 'equals') as RuleRecord['conditionOperator'],
    conditionValue: String(record.conditionValue ?? ''),
    actionType: String(record.actionType ?? 'set_category') as RuleRecord['actionType'],
    actionValue: String(record.actionValue ?? ''),
    createdAt: String(record.createdAt ?? ''),
    updatedAt: String(record.updatedAt ?? ''),
  }
}

function useRulesData() {
  const [items, setItems] = useState<RuleRecord[]>([])
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

      const endpoint = configRef.current.rules?.getAll
      if (!endpoint?.path) {
        setItems([])
        return
      }

      const response = await authFetch(new URL(endpoint.path, configRef.current.baseUrl).toString())
      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load rules.')
      }

      const payload = await response.json()
      setItems(Array.isArray(payload) ? payload.map(mapRule) : [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load rules.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveRule = async (values: RuleFormValues, ruleId?: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = ruleId ? configRef.current.rules?.update : configRef.current.rules?.create
    if (!endpoint?.path) {
      throw new Error('Rules endpoint is not configured.')
    }

    const url = new URL(
      ruleId ? endpoint.path.replace('{ruleId}', ruleId) : endpoint.path,
      configRef.current.baseUrl,
    )

    const response = await authFetch(url.toString(), {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: values.name.trim(),
        enabled: values.enabled,
        priority: Number(values.priority),
        conditionField: values.conditionField,
        conditionOperator: values.conditionOperator,
        conditionValue: values.conditionValue.trim(),
        actionType: values.actionType,
        actionValue: values.actionValue.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to save rule.')
    }

    await reload()
  }

  const deleteRule = async (ruleId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.rules?.delete
    if (!endpoint?.path) {
      throw new Error('Rules delete endpoint is not configured.')
    }

    const response = await authFetch(
      new URL(endpoint.path.replace('{ruleId}', ruleId), configRef.current.baseUrl).toString(),
      { method: endpoint.method },
    )

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to delete rule.')
    }

    await reload()
  }

  return {
    items,
    isLoading,
    error,
    reload,
    saveRule,
    deleteRule,
  }
}

export default useRulesData
