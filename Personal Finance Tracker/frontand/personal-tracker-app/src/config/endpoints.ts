import type { EndpointConfig } from '../types/report'
import { API_BASE_URL } from './env'

export async function loadEndpointConfig(): Promise<EndpointConfig> {
  const response = await fetch('/endpoints.json')

  if (!response.ok) {
    throw new Error('Failed to load endpoint configuration.')
  }

  const config = (await response.json()) as EndpointConfig
  return {
    ...config,
    baseUrl: API_BASE_URL,
  }
}
