import { useMemo, useState } from 'react'
import RecurringFormPanel from '../components/recurring/RecurringFormPanel'
import RecurringPlansList from '../components/recurring/RecurringPlansList'
import ReportPanel from '../components/reports/ReportPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useRecurringData from '../hooks/useRecurringData'
import type { RecurringFormValues, RecurringRecord } from '../types/recurring'

function RecurringPage() {
  const { user, activeAccounts, categories } = useDevelopmentBootstrap()
  const { items, isLoading, error, saveRecurringItem, deleteRecurringItem } = useRecurringData({
    userId: user.id,
    accounts: activeAccounts,
    categories,
  })
  const [editingItem, setEditingItem] = useState<RecurringRecord | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    return items.reduce(
      (accumulator, item) => {
        accumulator.total += 1
        if (item.nextRunDate <= today) {
          accumulator.dueNow += 1
        }
        if (item.autoCreateTransaction) {
          accumulator.autoCreate += 1
        }
        return accumulator
      },
      { total: 0, dueNow: 0, autoCreate: 0 },
    )
  }, [items])

  const handleSave = async (values: RecurringFormValues, recurringId?: string) => {
    try {
      setActionError(null)
      await saveRecurringItem(values, recurringId)
      setEditingItem(null)
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Recurring save failed.')
      throw caughtError
    }
  }

  const handleDelete = async (recurringId: string) => {
    try {
      setActionError(null)
      await deleteRecurringItem(recurringId)
      if (editingItem?.id === recurringId) {
        setEditingItem(null)
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Recurring delete failed.')
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Recurring</p>
          <h2>Recurring bills and scheduled income</h2>
        </div>
        <p className="page-description">
          Save recurring rules once. Your external daily scheduler can call the internal recurring job, which creates normal transactions and advances the schedule.
        </p>
      </header>

      <div className="summary-grid">
        <article className="summary-card summary-card-neutral">
          <p>Recurring rules</p>
          <strong>{summary.total}</strong>
          <span>All active recurring items saved for this user.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Due now</p>
          <strong>{summary.dueNow}</strong>
          <span>Schedules whose next run date is today or earlier.</span>
        </article>
        <article className="summary-card summary-card-positive">
          <p>Auto-create enabled</p>
          <strong>{summary.autoCreate}</strong>
          <span>Items that will create normal transactions when processed.</span>
        </article>
      </div>

      {error ? (
        <div className="report-error" role="alert">
          <strong>Unable to load recurring items.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {actionError ? (
        <div className="report-error" role="alert">
          <strong>Recurring action failed.</strong>
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="budget-layout">
        <RecurringFormPanel
          accounts={activeAccounts}
          categories={categories}
          editingItem={editingItem}
          onCancel={() => setEditingItem(null)}
          onSubmit={handleSave}
        />

        <ReportPanel
          title="Recurring schedule"
          subtitle="Each rule stores the next run date. The secured internal recurring job creates normal transactions and advances the schedule."
        >
          {isLoading ? (
            <div className="empty-state">Loading recurring items...</div>
          ) : (
            <RecurringPlansList items={items} onEdit={setEditingItem} onDelete={handleDelete} />
          )}
        </ReportPanel>
      </div>
    </section>
  )
}

export default RecurringPage
