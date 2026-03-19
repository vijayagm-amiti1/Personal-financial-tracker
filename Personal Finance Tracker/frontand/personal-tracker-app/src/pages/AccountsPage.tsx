import { useMemo, useRef, useState } from 'react'
import ReportPanel from '../components/reports/ReportPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import type { DevAccount } from '../types/report'

function formatCurrency(value?: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function AccountsPage() {
  const { activeAccounts, createAccount, updateAccount, deactivateAccount } = useDevelopmentBootstrap()
  const [editingAccount, setEditingAccount] = useState<DevAccount | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('savings')
  const [institutionName, setInstitutionName] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const formPanelRef = useRef<HTMLDivElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  const summary = useMemo(() => {
    return {
      total: activeAccounts.length,
      balance: activeAccounts.reduce((sum, account) => sum + (account.currentBalance ?? 0), 0),
    }
  }, [activeAccounts])

  const resetForm = () => {
    setEditingAccount(null)
    setIsCreateFormOpen(false)
    setName('')
    setType('savings')
    setInstitutionName('')
    setOpeningBalance('')
    setError(null)
  }

  const loadEditForm = (account: DevAccount) => {
    setEditingAccount(account)
    setIsCreateFormOpen(false)
    setName(account.name)
    setType(account.type)
    setInstitutionName(account.institutionName)
    setOpeningBalance(String(account.openingBalance ?? 0))
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (name.trim() === '' || openingBalance.trim() === '') {
      setError('Account name and opening balance are required.')
      return
    }

    const payload = {
      name: name.trim(),
      type,
      institutionName: institutionName.trim(),
      openingBalance: Number(openingBalance),
    }

    try {
      setError(null)
      setIsSaving(true)
      if (editingAccount) {
        await updateAccount(editingAccount.id, payload)
      } else {
        await createAccount(payload)
      }
      resetForm()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save account.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (accountId: string) => {
    try {
      setError(null)
      await deactivateAccount(accountId)
      if (editingAccount?.id === accountId) {
        resetForm()
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to delete account.')
    }
  }

  const focusCreateForm = () => {
    resetForm()
    setIsCreateFormOpen(true)
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => nameInputRef.current?.focus(), 150)
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Accounts</p>
          <h2>Accounts and opening balances</h2>
        </div>
        <p className="page-description">
          Opening balance is fixed when the account is created. Only current balance moves with later transactions.
        </p>
      </header>

      <div className="summary-grid">
        <article className="summary-card summary-card-neutral">
          <p>Accounts</p>
          <strong>{summary.total}</strong>
          <span>Only active accounts are shown here.</span>
        </article>
        <article className="summary-card summary-card-positive">
          <p>Available for new flows</p>
          <strong>{summary.total}</strong>
          <span>These accounts can be used in transactions, goals, reports, and recurring items.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Current active balance</p>
          <strong>{formatCurrency(summary.balance)}</strong>
          <span>Sum of current balances across active accounts.</span>
        </article>
      </div>

      <div className="budget-layout">
        <ReportPanel
          title="Account actions"
          subtitle="Create a new account only when needed, or manage the accounts that already exist."
        >
          {!editingAccount && !isCreateFormOpen ? (
            <div className="page-actions">
              <button type="button" className="primary-button" onClick={focusCreateForm}>
                Create new account
              </button>
            </div>
          ) : null}

          {(editingAccount || isCreateFormOpen) ? (
            <div ref={formPanelRef}>
              <form className="transaction-form" onSubmit={handleSubmit}>
                <div className="transaction-form-grid">
                  <label className="field">
                    <span>Name</span>
                    <input
                      ref={nameInputRef}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>

                  <label className="field">
                    <span>Type</span>
                    <select value={type} onChange={(event) => setType(event.target.value)}>
                      <option value="savings">Savings</option>
                      <option value="checking">Checking</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Institution</span>
                    <input value={institutionName} onChange={(event) => setInstitutionName(event.target.value)} />
                  </label>

                  <label className="field">
                    <span>Opening balance</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={openingBalance}
                      onChange={(event) => setOpeningBalance(event.target.value)}
                      disabled={editingAccount !== null}
                    />
                  </label>
                </div>

                {error ? <div className="report-error">{error}</div> : null}

                <div className="transaction-form-actions">
                  <button type="button" className="secondary-button" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-button" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingAccount ? 'Update account' : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </ReportPanel>

        <ReportPanel
          title="Account list"
          subtitle="Delete hides the account from active screens. Historical transactions can still keep the old account reference."
        >
          {activeAccounts.length === 0 ? (
            <div className="accounts-empty-state">
              <div className="accounts-empty-icon">+</div>
              <strong>Create your first account</strong>
              <span>No accounts exist for this user yet. Start with one bank, cash, or savings account.</span>
              <button type="button" className="primary-button" onClick={focusCreateForm}>
                Create first account
              </button>
            </div>
          ) : (
            <div className="budget-plans-grid recurring-plans-grid">
              {activeAccounts.map((account) => (
                <article key={account.id} className="budget-plan-card recurring-plan-card">
                  <div className="budget-plan-header">
                    <div>
                      <h3>{account.name}</h3>
                      <p>{account.institutionName || 'Institution not set'} · {account.type}</p>
                    </div>
                    <span className="budget-state budget-state-safe">active</span>
                  </div>

                  <div className="recurring-metadata-grid">
                    <div>
                      <span>Opening balance</span>
                      <strong>{formatCurrency(account.openingBalance)}</strong>
                    </div>
                    <div>
                      <span>Current balance</span>
                      <strong>{formatCurrency(account.currentBalance)}</strong>
                    </div>
                  </div>

                  <div className="budget-card-actions">
                    <button type="button" className="secondary-button" onClick={() => loadEditForm(account)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => void handleDelete(account.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </ReportPanel>
      </div>
    </section>
  )
}

export default AccountsPage
