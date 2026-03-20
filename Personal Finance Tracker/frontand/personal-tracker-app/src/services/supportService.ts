import { authFetch } from '../utils/authFetch'
import { API_BASE_URL } from '../config/env'

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

export async function reportIssue(payload: { subject: string; page: string; message: string }) {
  const response = await authFetch(new URL('/api/support/report-issue', API_BASE_URL).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error((await extractErrorMessage(response)) ?? 'Failed to send issue report.')
  }

  return response.json() as Promise<{ message: string }>
}
