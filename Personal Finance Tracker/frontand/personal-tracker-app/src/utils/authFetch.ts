import { API_BASE_URL } from '../config/env'

let refreshPromise: Promise<boolean> | null = null

const AUTH_BYPASS_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/api/auth/complete-signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/me',
  '/api/auth/refresh',
]

async function tryRefresh() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = fetch(new URL('/api/auth/refresh', API_BASE_URL).toString(), {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

function redirectToLogin() {
  localStorage.removeItem('financeTracker.dev.user')
  localStorage.removeItem('financeTracker.dev.accounts')
  localStorage.removeItem('financeTracker.dev.categories')
  localStorage.removeItem('financeTracker.dev.goals')
  window.location.href = '/login'
}

export async function authFetch(input: string, init: RequestInit = {}, retry = true) {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
  })

  const shouldBypassRefresh = AUTH_BYPASS_PATHS.some((path) => input.includes(path))

  if (response.status === 401 && retry && !shouldBypassRefresh) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return authFetch(input, init, false)
    }
    redirectToLogin()
  }

  return response
}
