function resolveEnvUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (trimmed) {
    return trimmed
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

export const API_BASE_URL = resolveEnvUrl(import.meta.env.VITE_API_BASE_URL)

export const APP_BASE_URL = resolveEnvUrl(import.meta.env.VITE_APP_BASE_URL)
