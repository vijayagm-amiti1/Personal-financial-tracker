import { useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type { EndpointConfig, ForecastDailyPoint, ForecastMonthSummary } from '../types/report'
import { authFetch } from '../utils/authFetch'

type ForecastState = {
  monthSummary: ForecastMonthSummary | null
  dailyPoints: ForecastDailyPoint[]
  isLoading: boolean
  error: string | null
  reload: () => void
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

function useForecastData(): ForecastState {
  const [monthSummary, setMonthSummary] = useState<ForecastMonthSummary | null>(null)
  const [dailyPoints, setDailyPoints] = useState<ForecastDailyPoint[]>([])
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
        const monthPath = config.forecast?.month?.path
        const dailyPath = config.forecast?.daily?.path

        if (!monthPath || !dailyPath) {
          throw new Error('Forecast endpoints are not configured.')
        }

        const [monthResponse, dailyResponse] = await Promise.all([
          authFetch(new URL(monthPath, config.baseUrl).toString()),
          authFetch(new URL(dailyPath, config.baseUrl).toString()),
        ])

        if (!monthResponse.ok || !dailyResponse.ok) {
          const failingResponse = !monthResponse.ok ? monthResponse : dailyResponse
          throw new Error((await extractErrorMessage(failingResponse)) ?? 'Forecast API returned an error response.')
        }

        const [monthPayload, dailyPayload] = await Promise.all([
          monthResponse.json(),
          dailyResponse.json(),
        ])

        if (!active) {
          return
        }

        setMonthSummary(monthPayload as ForecastMonthSummary)
        setDailyPoints(dailyPayload as ForecastDailyPoint[])
      } catch (caughtError) {
        if (!active) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unexpected error while loading forecast.',
        )
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
  }, [reloadToken])

  return {
    monthSummary,
    dailyPoints,
    isLoading,
    error,
    reload: () => setReloadToken((value) => value + 1),
  }
}

export default useForecastData
