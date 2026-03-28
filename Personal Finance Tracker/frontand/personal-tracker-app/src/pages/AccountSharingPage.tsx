import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReportPanel from '../components/reports/ReportPanel'
import { loadEndpointConfig } from '../config/endpoints'
import { authFetch } from '../utils/authFetch'
import type { DevAccount, SharedAccountMember } from '../types/report'

const roleOptions = ['OWNER', 'EDITOR', 'VIEWER'] as const

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

function mapAccount(item: unknown): DevAccount {
  const record = item as Record<string, unknown>
  return {
    id: String(record.id),
    userId: String(record.userId),
    name: String(record.name ?? ''),
    type: String(record.type ?? ''),
    institutionName: String(record.institutionName ?? ''),
    openingBalance: Number(record.openingBalance ?? 0),
    currentBalance: Number(record.currentBalance ?? 0),
    isActive: record.isActive !== false,
    accessRole: String(record.accessRole ?? 'VIEWER') as DevAccount['accessRole'],
    sharedMemberCount: Number(record.sharedMemberCount ?? 0),
    ownerDisplayName: String(record.ownerDisplayName ?? ''),
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
  }
}

function mapMember(item: unknown): SharedAccountMember {
  const record = item as Record<string, unknown>
  return {
    id: record.id ? String(record.id) : null,
    userId: String(record.userId),
    email: String(record.email ?? ''),
    displayName: String(record.displayName ?? ''),
    role: String(record.role ?? 'VIEWER') as SharedAccountMember['role'],
    owner: record.owner === true,
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
  }
}

function AccountSharingPage() {
  const { accountId = '' } = useParams()
  const [account, setAccount] = useState<DevAccount | null>(null)
  const [members, setMembers] = useState<SharedAccountMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<SharedAccountMember['role']>('VIEWER')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOwner = account?.accessRole === 'OWNER'

  const loadPageData = async () => {
    const config = await loadEndpointConfig()
    const accountPath = config.accounts?.getById?.path
    const membersPath = config.accounts?.getMembers?.path

    if (!accountPath || !membersPath) {
      throw new Error('Account sharing endpoints are not configured.')
    }

    const [accountResponse, membersResponse] = await Promise.all([
      authFetch(new URL(accountPath.replace('{accountId}', accountId), config.baseUrl).toString()),
      authFetch(new URL(membersPath.replace('{accountId}', accountId), config.baseUrl).toString()),
    ])

    if (!accountResponse.ok) {
      throw new Error((await extractErrorMessage(accountResponse)) ?? 'Failed to load account.')
    }

    if (!membersResponse.ok) {
      throw new Error((await extractErrorMessage(membersResponse)) ?? 'Failed to load account members.')
    }

    setAccount(mapAccount(await accountResponse.json()))
    setMembers(((await membersResponse.json()) as unknown[]).map(mapMember))
  }

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        setIsLoading(true)
        await loadPageData()
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : 'Failed to load sharing page.')
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
  }, [accountId])

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)
      const config = await loadEndpointConfig()
      const invitePath = config.accounts?.invite?.path

      if (!invitePath) {
        throw new Error('Account invite endpoint is not configured.')
      }

      const response = await authFetch(new URL(invitePath.replace('{accountId}', accountId), config.baseUrl).toString(), {
        method: config.accounts?.invite?.method ?? 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to send invite.')
      }

      setInviteEmail('')
      setInviteRole('VIEWER')
      setSuccessMessage('Invite sent successfully.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to send invite.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = async (memberUserId: string, role: SharedAccountMember['role']) => {
    try {
      setError(null)
      setSuccessMessage(null)
      const config = await loadEndpointConfig()
      const updateMemberPath = config.accounts?.updateMember?.path

      if (!updateMemberPath) {
        throw new Error('Account member update endpoint is not configured.')
      }

      const response = await authFetch(
        new URL(
          updateMemberPath
            .replace('{accountId}', accountId)
            .replace('{userId}', memberUserId),
          config.baseUrl,
        ).toString(),
        {
          method: config.accounts?.updateMember?.method ?? 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role }),
        },
      )

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to update role.')
      }

      await loadPageData()
      setSuccessMessage('Member role updated.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to update role.')
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      setError(null)
      setSuccessMessage(null)
      const config = await loadEndpointConfig()
      const removeMemberPath = config.accounts?.removeMember?.path

      if (!removeMemberPath) {
        throw new Error('Account member remove endpoint is not configured.')
      }

      const response = await authFetch(
        new URL(
          removeMemberPath
            .replace('{accountId}', accountId)
            .replace('{userId}', memberUserId),
          config.baseUrl,
        ).toString(),
        {
          method: config.accounts?.removeMember?.method ?? 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to remove member.')
      }

      await loadPageData()
      setSuccessMessage('Member removed from account.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to remove member.')
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Account Sharing</p>
          <h2>Manage account access</h2>
        </div>
        <p className="page-description">
          Invite family members, review roles, and control who can collaborate on this account.
        </p>
      </header>

      <div className="page-actions">
        <Link className="secondary-button" to="/accounts">
          Back to accounts
        </Link>
      </div>

      {isLoading ? <div className="report-panel">Loading account sharing...</div> : null}
      {error ? <div className="report-error">{error}</div> : null}
      {successMessage ? <div className="report-success">{successMessage}</div> : null}

      {account ? (
        <div className="budget-layout">
          <ReportPanel
            title={account.name}
            subtitle={`${account.institutionName || 'Institution not set'} · ${account.type}`}
          >
            <div className="summary-grid">
              <article className="summary-card summary-card-neutral">
                <p>Your role</p>
                <strong>{account.accessRole}</strong>
                <span>Only owners can change sharing settings.</span>
              </article>
              <article className="summary-card summary-card-positive">
                <p>Members</p>
                <strong>{members.length}</strong>
                <span>Includes the account creator.</span>
              </article>
              <article className="summary-card summary-card-warning">
                <p>Owner</p>
                <strong>{account.ownerDisplayName || 'Account owner'}</strong>
                <span>Creator ownership cannot be removed.</span>
              </article>
            </div>
          </ReportPanel>

          <ReportPanel
            title="Members"
            subtitle="See who has access and what they are allowed to do."
          >
            <div className="sharing-members-list">
              {members.map((member) => (
                <article key={`${member.userId}-${member.role}`} className="sharing-member-card">
                  <div>
                    <h3>{member.displayName || member.email}</h3>
                    <p>{member.email}</p>
                  </div>
                  <div className="sharing-member-actions">
                    <select
                      value={member.role}
                      disabled={!isOwner || member.owner}
                      onChange={(event) => void handleRoleChange(member.userId, event.target.value as SharedAccountMember['role'])}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={!isOwner || member.owner}
                      onClick={() => void handleRemoveMember(member.userId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel
            title="Invite someone"
            subtitle="Send an email invite with a role. The recipient can accept or reject it from the link."
          >
            <form className="transaction-form" onSubmit={handleInvite}>
              <div className="transaction-form-grid">
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={inviteEmail}
                    disabled={!isOwner || isSubmitting}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span>Role</span>
                  <select
                    value={inviteRole}
                    disabled={!isOwner || isSubmitting}
                    onChange={(event) => setInviteRole(event.target.value as SharedAccountMember['role'])}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!isOwner ? <div className="field-help">You can view members, but only the owner can send invites.</div> : null}
              <div className="transaction-form-actions">
                <button type="submit" className="primary-button" disabled={!isOwner || isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send invite'}
                </button>
              </div>
            </form>
          </ReportPanel>
        </div>
      ) : null}
    </section>
  )
}

export default AccountSharingPage
