import { useEffect, useRef, useState } from 'react'
import { loadEndpointConfig } from '../config/endpoints'
import type { EndpointConfig, FinancialHealthScore } from '../types/report'
import { authFetch } from '../utils/authFetch'

type FinancialHealthState = {
  score: FinancialHealthScore | null
  isLoading: boolean
  error: string | null
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

function useFinancialHealthData(): FinancialHealthState {
  const [score, setScore] = useState<FinancialHealthScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        const scorePath = config.financialHealth?.score?.path

        if (!scorePath) {
          throw new Error('Financial health endpoint is not configured.')
        }

        const response = await authFetch(new URL(scorePath, config.baseUrl).toString())
        if (!response.ok) {
          throw new Error((await extractErrorMessage(response)) ?? 'Financial health API returned an error response.')
        }

        const payload = (await response.json()) as FinancialHealthScore
        if (!active) {
          return
        }

        setScore(payload)
      } catch (caughtError) {
        if (!active) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unexpected error while loading financial health score.',
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
  }, [])

  return { score, isLoading, error }
}

export default useFinancialHealthData
