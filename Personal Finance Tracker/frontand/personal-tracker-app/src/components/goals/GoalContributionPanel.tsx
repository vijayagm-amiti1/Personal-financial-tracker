import { useState } from 'react'
import type { DevAccount, DevGoal } from '../../types/report'
import type { GoalContributionValues } from '../../types/goal'

type GoalContributionPanelProps = {
  goal: DevGoal
  accounts: DevAccount[]
  onCancel: () => void
  onSubmit: (values: GoalContributionValues) => Promise<void>
}

function GoalContributionPanel({
  goal,
  accounts,
  onCancel,
  onSubmit,
}: GoalContributionPanelProps) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const selectedAccount = accounts.find((account) => account.id === accountId)
  const linkedAccount = accounts.find((account) => account.id === goal.linkedAccountId)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (accountId === '' || amount.trim() === '') {
      setError('Account and amount are required.')
      return
    }

    try {
      setError(null)
      setIsSaving(true)
      await onSubmit({
        goalId: goal.id,
        accountId,
        amount,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to contribute.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="report-panel">
      <header className="report-panel-header">
        <div>
          <h3>Contribute to {goal.name}</h3>
          <p>
            Select the source account and amount. This goal is held in{' '}
            {linkedAccount?.name ?? 'the linked account'}.
          </p>
        </div>
      </header>

      <div className="report-panel-body">
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form-grid">
            <label className="field">
              <span>Account</span>
              <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {selectedAccount?.currentBalance !== undefined ? (
                <small className="field-help">
                  Available balance:{' '}
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  }).format(selectedAccount.currentBalance)}
                </small>
              ) : null}
            </label>

            <label className="field field-small">
              <span>Amount</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
          </div>

          {error ? <div className="report-error">{error}</div> : null}

          <div className="transaction-form-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Add contribution'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default GoalContributionPanel
