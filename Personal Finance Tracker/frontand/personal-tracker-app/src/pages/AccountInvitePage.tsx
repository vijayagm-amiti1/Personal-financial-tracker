import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import ReportPanel from '../components/reports/ReportPanel'
import { loadEndpointConfig } from '../config/endpoints'
import type { AccountInviteRecord } from '../types/report'
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

function mapInvite(item: unknown): AccountInviteRecord {
  const record = item as Record<string, unknown>
  return {
    id: String(record.id),
    accountId: String(record.accountId),
    accountName: String(record.accountName ?? ''),
    accountType: String(record.accountType ?? ''),
    institutionName: String(record.institutionName ?? ''),
    recipientEmail: String(record.recipientEmail ?? ''),
    role: String(record.role ?? 'VIEWER') as AccountInviteRecord['role'],
    status: String(record.status ?? 'PENDING') as AccountInviteRecord['status'],
    invitedByDisplayName: String(record.invitedByDisplayName ?? ''),
    invitedByEmail: String(record.invitedByEmail ?? ''),
    inviteLink: String(record.inviteLink ?? ''),
    expiresAt: String(record.expiresAt ?? ''),
    respondedAt: record.respondedAt ? String(record.respondedAt) : null,
    createdAt: String(record.createdAt ?? ''),
  }
}

function AccountInvitePage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invite, setInvite] = useState<AccountInviteRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadInvite = async () => {
    const config = await loadEndpointConfig()
    const invitePath = config.accountInvites?.getByToken?.path

    if (!invitePath) {
      throw new Error('Account invite endpoint is not configured.')
    }

    const response = await authFetch(new URL(invitePath.replace('{token}', token), config.baseUrl).toString())
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to load invite.')
    }

    setInvite(mapInvite(await response.json()))
  }

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        setIsLoading(true)
        await loadInvite()
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : 'Failed to load invite.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [token])

  const handleRespond = async (accepted: boolean) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const config = await loadEndpointConfig()
      const respondPath = config.accountInvites?.respond?.path

      if (!respondPath) {
        throw new Error('Account invite response endpoint is not configured.')
      }

      const response = await authFetch(new URL(respondPath.replace('{token}', token), config.baseUrl).toString(), {
        method: config.accountInvites?.respond?.method ?? 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accepted }),
      })

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to update invite.')
      }

      const updatedInvite = mapInvite(await response.json())
      setInvite(updatedInvite)

      if (accepted) {
        navigate('/accounts', { replace: true })
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to update invite.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Account Invite</p>
          <h2>Review shared account invite</h2>
        </div>
        <p className="page-description">
          Check the account details, the role offered, and respond to the invitation.
        </p>
      </header>

      {isLoading ? <div className="report-panel">Loading invite...</div> : null}
      {error ? <div className="report-error">{error}</div> : null}

      {invite ? (
        <ReportPanel
          title={invite.accountName}
          subtitle={`${invite.institutionName || 'Institution not set'} · ${invite.accountType}`}
        >
          <div className="sharing-invite-summary">
            <p><strong>Invited by:</strong> {invite.invitedByDisplayName} ({invite.invitedByEmail})</p>
            <p><strong>Invited to:</strong> {invite.recipientEmail}</p>
            <p><strong>Signed in as:</strong> {user?.email ?? 'Not signed in'}</p>
            <p><strong>Your role:</strong> {invite.role}</p>
            <p><strong>Status:</strong> {invite.status}</p>
            <p><strong>Expires:</strong> {new Date(invite.expiresAt).toLocaleString('en-IN')}</p>
          </div>

          {user?.email && user.email.toLowerCase() !== invite.recipientEmail.toLowerCase() ? (
            <div className="report-error">
              This invite was sent to {invite.recipientEmail}, but you are signed in as {user.email}.
            </div>
          ) : null}

          <div className="transaction-form-actions">
            <button
              type="button"
              className="primary-button"
              disabled={invite.status !== 'PENDING' || isSubmitting}
              onClick={() => void handleRespond(true)}
            >
              {isSubmitting ? 'Submitting...' : 'Accept invite'}
            </button>
            <button
              type="button"
              className="danger-button"
              disabled={invite.status !== 'PENDING' || isSubmitting}
              onClick={() => void handleRespond(false)}
            >
              Reject invite
            </button>
            <Link className="secondary-button" to="/accounts">
              Go to accounts
            </Link>
          </div>
        </ReportPanel>
      ) : null}
    </section>
  )
}

export default AccountInvitePage
