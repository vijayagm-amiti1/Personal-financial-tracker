import { useEffect, useRef, useState } from 'react'
import type { EndpointConfig } from '../types/report'
import type { BudgetFormValues, BudgetRecord } from '../types/budget'

type UseBudgetsDataArgs = {
  userId: string
}

async function loadEndpointConfig(): Promise<EndpointConfig> {
  const response = await fetch('/endpoints.json')

  if (!response.ok) {
    throw new Error('Failed to load endpoint configuration.')
  }

  return response.json()
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

function mapBudgetRecord(item: unknown): BudgetRecord {
  const record = item as Record<string, unknown>

  return {
    id: String(record.id),
    userId: String(record.userId),
    categoryId: String(record.categoryId),
    categoryName: record.categoryName ? String(record.categoryName) : null,
    categoryColor: record.categoryColor ? String(record.categoryColor) : null,
    categoryIcon: record.categoryIcon ? String(record.categoryIcon) : null,
    month: Number(record.month),
    year: Number(record.year),
    amount: Number(record.amount),
    currentSpent: Number(record.currentSpent ?? record.spentAmount ?? 0),
    spentAmount: Number(record.spentAmount ?? 0),
    remainingAmount: Number(record.remainingAmount ?? 0),
    spentPercent: Number(record.spentPercent ?? 0),
    alertThresholdPercent: Number(record.alertThresholdPercent ?? 80),
  }
}

function useBudgetsData({ userId }: UseBudgetsDataArgs) {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const configRef = useRef<EndpointConfig | null>(null)

  const reload = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (configRef.current === null) {
        configRef.current = await loadEndpointConfig()
      }

      const budgetPath = configRef.current.budgets?.getAll?.path

      if (!budgetPath) {
        throw new Error('Budget get-all endpoint is not configured.')
      }

      const url = new URL(budgetPath, configRef.current.baseUrl)
      url.searchParams.set('userId', userId)

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load budgets.')
      }

      const payload = (await response.json()) as unknown[]
      setBudgets(Array.isArray(payload) ? payload.map(mapBudgetRecord) : [])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load budgets.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [userId])

  const saveBudget = async (values: BudgetFormValues, budgetId?: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = budgetId
      ? configRef.current.budgets?.update
      : configRef.current.budgets?.create

    if (!endpoint?.path) {
      throw new Error('Budget save endpoint is not configured.')
    }

    const path = budgetId ? endpoint.path.replace('{budgetId}', budgetId) : endpoint.path
    const url = new URL(path, configRef.current.baseUrl)
    url.searchParams.set('userId', userId)

    const response = await fetch(url.toString(), {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId: values.categoryId,
        month: Number(values.month),
        year: Number(values.year),
        amount: Number(values.amount),
        alertThresholdPercent: Number(values.alertThresholdPercent),
      }),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to save budget.')
    }

    await reload()
  }

  const deleteBudget = async (budgetId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.budgets?.delete

    if (!endpoint?.path) {
      throw new Error('Budget delete endpoint is not configured.')
    }

    const url = new URL(endpoint.path.replace('{budgetId}', budgetId), configRef.current.baseUrl)
    url.searchParams.set('userId', userId)

    const response = await fetch(url.toString(), {
      method: endpoint.method,
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to delete budget.')
    }

    await reload()
  }

  const copyPreviousMonthBudgets = async (month: number, year: number) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const endpoint = configRef.current.budgets?.copyPrevious

    if (!endpoint?.path) {
      throw new Error('Budget copy endpoint is not configured.')
    }

    const url = new URL(endpoint.path, configRef.current.baseUrl)
    url.searchParams.set('userId', userId)
    url.searchParams.set('month', String(month))
    url.searchParams.set('year', String(year))

    const response = await fetch(url.toString(), {
      method: endpoint.method,
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to copy previous month budgets.')
    }

    await reload()
  }

  return {
    budgets,
    isLoading,
    error,
    saveBudget,
    deleteBudget,
    copyPreviousMonthBudgets,
    reload,
  }
}

export default useBudgetsData
