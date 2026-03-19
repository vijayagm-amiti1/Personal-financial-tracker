import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportPanel from '../components/reports/ReportPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'

function GoalCreatePage() {
  const navigate = useNavigate()
  const { createGoal, activeAccounts } = useDevelopmentBootstrap()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [linkedAccountId, setLinkedAccountId] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (name.trim() === '' || targetAmount.trim() === '' || linkedAccountId === '') {
      setError('Goal name, target amount, and reference account are required.')
      return
    }

    try {
      setError(null)
      setIsSaving(true)
      await createGoal({
        name: name.trim(),
        targetAmount: Number(targetAmount),
        targetDate,
        linkedAccountId,
        status,
      })
      navigate('/goals')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create goal.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Goals</p>
          <h2>Create a new savings goal</h2>
        </div>
        <p className="page-description">
          Define a target amount, deadline, and the reference account where this goal is held.
        </p>
      </header>

      <ReportPanel
        title="New goal"
        subtitle="Goals are created with the existing backend goal API and stored locally for listing."
      >
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form-grid">
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <label className="field field-small">
              <span>Target amount</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
              />
            </label>

            <label className="field field-small">
              <span>Target date</span>
              <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
            </label>

            <label className="field">
              <span>Reference account</span>
              <select value={linkedAccountId} onChange={(event) => setLinkedAccountId(event.target.value)}>
                <option value="">Select account</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-small">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          {error ? <div className="report-error">{error}</div> : null}

          <div className="transaction-form-actions">
            <button type="button" className="secondary-button" onClick={() => navigate('/goals')}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Create goal'}
            </button>
          </div>
        </form>
      </ReportPanel>
    </section>
  )
}

export default GoalCreatePage
