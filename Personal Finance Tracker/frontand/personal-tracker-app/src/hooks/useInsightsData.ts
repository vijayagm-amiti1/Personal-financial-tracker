import { useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type {
  EndpointConfig,
  InsightsFilters,
  InsightsResponse,
  NetWorthReportResponse,
  TrendReportResponse,
} from '../types/report'
import { ALL_ACCOUNTS_VALUE } from '../utils/devStorage'
import { authFetch } from '../utils/authFetch'

const ALL_CATEGORIES_VALUE = '__all_categories__'

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

function appendCommonFilters(url: URL, filters: InsightsFilters) {
  if (filters.fromDate) {
    url.searchParams.set('from', filters.fromDate)
  }
  if (filters.toDate) {
    url.searchParams.set('to', filters.toDate)
  }
  if (filters.accountId && filters.accountId !== ALL_ACCOUNTS_VALUE) {
    url.searchParams.set('accountId', filters.accountId)
  }
  if (filters.categoryId && filters.categoryId !== ALL_CATEGORIES_VALUE) {
    url.searchParams.set('categoryId', filters.categoryId)
  }
}

function useInsightsData(filters: InsightsFilters) {
  const [trends, setTrends] = useState<TrendReportResponse | null>(null)
  const [netWorth, setNetWorth] = useState<NetWorthReportResponse | null>(null)
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const configRef = useRef<EndpointConfig | null>(null)

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
        const trendPath = config.reports.trends?.path
        const netWorthPath = config.reports.netWorth?.path
        const insightsPath = config.insights?.getAll?.path

        if (!trendPath || !netWorthPath || !insightsPath) {
          throw new Error('Insights endpoints are not configured.')
        }

        const trendUrl = new URL(trendPath, config.baseUrl)
        const netWorthUrl = new URL(netWorthPath, config.baseUrl)
        const insightsUrl = new URL(insightsPath, config.baseUrl)

        appendCommonFilters(trendUrl, filters)
        appendCommonFilters(netWorthUrl, filters)
        appendCommonFilters(insightsUrl, filters)

        const [trendsResponse, netWorthResponse, insightsResponse] = await Promise.all([
          authFetch(trendUrl.toString()),
          authFetch(netWorthUrl.toString()),
          authFetch(insightsUrl.toString()),
        ])

        if (!trendsResponse.ok || !netWorthResponse.ok || !insightsResponse.ok) {
          const firstError = !trendsResponse.ok
            ? trendsResponse
            : !netWorthResponse.ok
              ? netWorthResponse
              : insightsResponse
          throw new Error((await extractErrorMessage(firstError)) ?? 'Failed to load insights data.')
        }

        const [trendsPayload, netWorthPayload, insightsPayload] = await Promise.all([
          trendsResponse.json(),
          netWorthResponse.json(),
          insightsResponse.json(),
        ])

        if (!active) {
          return
        }

        setTrends(trendsPayload as TrendReportResponse)
        setNetWorth(netWorthPayload as NetWorthReportResponse)
        setInsights(insightsPayload as InsightsResponse)
      } catch (caughtError) {
        if (!active) {
          return
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load insights data.')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [filters.accountId, filters.categoryId, filters.fromDate, filters.toDate, reloadToken])

  return {
    trends,
    netWorth,
    insights,
    isLoading,
    error,
    reload: () => setReloadToken((current) => current + 1),
    allCategoriesValue: ALL_CATEGORIES_VALUE,
  }
}

export default useInsightsData
