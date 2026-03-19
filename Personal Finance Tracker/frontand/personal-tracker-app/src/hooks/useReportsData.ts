import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  DevAccount,
  CategorySpendingReport,
  DailyReport,
  EndpointConfig,
  ReportFilters,
} from '../types/report'
import { ALL_ACCOUNTS_VALUE } from '../utils/devStorage'
import { authFetch } from '../utils/authFetch'

type ReportState = {
  dailyReport: DailyReport[]
  categorySpendingReport: CategorySpendingReport[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

function buildUrl(
  baseUrl: string,
  path: string,
  filters: ReportFilters,
  accountId: string,
) {
  const url = new URL(path, baseUrl)
  url.searchParams.set('accountId', accountId)
  url.searchParams.set('month', String(filters.month))
  url.searchParams.set('year', String(filters.year))
  return url.toString()
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

function mergeDailyReports(items: DailyReport[]) {
  const grouped = new Map<number, DailyReport>()

  items.forEach((item) => {
    const existing = grouped.get(item.day)
    if (existing) {
      existing.income += item.income
      existing.expense += item.expense
      return
    }

    grouped.set(item.day, {
      day: item.day,
      accountId: ALL_ACCOUNTS_VALUE,
      income: item.income,
      expense: item.expense,
    })
  })

  return [...grouped.values()].sort((left, right) => left.day - right.day)
}

function trimFutureDays(items: DailyReport[], filters: ReportFilters) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (filters.month !== currentMonth || filters.year !== currentYear) {
    return items
  }

  const today = now.getDate()
  return items.filter((item) => item.day <= today)
}

function mergeCategoryReports(items: CategorySpendingReport[]) {
  const grouped = new Map<string, CategorySpendingReport>()

  items.forEach((item) => {
    const existing = grouped.get(item.categoryId)
    if (existing) {
      existing.expense += item.expense
      return
    }

    grouped.set(item.categoryId, { ...item })
  })

  return [...grouped.values()].sort((left, right) => right.expense - left.expense)
}

function useReportsData(
  filters: ReportFilters,
  availableAccounts: DevAccount[],
): ReportState {
  const [dailyReport, setDailyReport] = useState<DailyReport[]>([])
  const [categorySpendingReport, setCategorySpendingReport] = useState<
    CategorySpendingReport[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const configRef = useRef<EndpointConfig | null>(null)
  const availableAccountIdsKey = useMemo(
    () => availableAccounts.map((account) => account.id).sort().join('|'),
    [availableAccounts],
  )

  useEffect(() => {
    let active = true

    async function run() {
      try {
        setIsLoading(true)
        setError(null)

        if (configRef.current === null) {
          configRef.current = await loadEndpointConfig()
        }

        const config = configRef.current
        const targetAccountIds =
          filters.accountId === ALL_ACCOUNTS_VALUE
            ? availableAccounts.map((account) => account.id)
            : [filters.accountId]

        const reportResponses = await Promise.all(
          targetAccountIds.map(async (accountId) => {
            const dailyUrl = buildUrl(
              config.baseUrl,
              config.reports.monthlyDaily.path,
              filters,
              accountId,
            )
            const categoryUrl = buildUrl(
              config.baseUrl,
              config.reports.monthlyCategorySpending.path,
              filters,
              accountId,
            )

            const [dailyResponse, categoryResponse] = await Promise.all([
              authFetch(dailyUrl),
              authFetch(categoryUrl),
            ])

            if (!dailyResponse.ok || !categoryResponse.ok) {
              const firstErrorResponse = !dailyResponse.ok ? dailyResponse : categoryResponse
              const backendMessage = await extractErrorMessage(firstErrorResponse)
              throw new Error(backendMessage ?? 'Report API returned an error response.')
            }

            const [dailyPayload, categoryPayload] = await Promise.all([
              dailyResponse.json(),
              categoryResponse.json(),
            ])

            return {
              dailyPayload: dailyPayload as DailyReport[],
              categoryPayload: categoryPayload as CategorySpendingReport[],
            }
          }),
        )

        if (!active) {
          return
        }

        const mergedDailyReport = mergeDailyReports(
          reportResponses.flatMap((item) => item.dailyPayload),
        )
        const mergedCategoryReport = mergeCategoryReports(
          reportResponses.flatMap((item) => item.categoryPayload),
        )

        setDailyReport(trimFutureDays(mergedDailyReport, filters))
        setCategorySpendingReport(mergedCategoryReport)
      } catch (caughtError) {
        if (!active) {
          return
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unexpected error while loading reports.'

        setError(message)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [
    filters.accountId,
    filters.month,
    filters.year,
    filters.type,
    availableAccountIdsKey,
    reloadToken,
  ])

  return {
    dailyReport,
    categorySpendingReport,
    isLoading,
    error,
    reload: () => setReloadToken((value) => value + 1),
  }
}

export default useReportsData
