import type { RecurringRecord } from '../../types/recurring'

type RecurringPlansListProps = {
  items: RecurringRecord[]
  onEdit: (item: RecurringRecord) => void
  onDelete: (recurringId: string) => Promise<void>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function RecurringPlansList({ items, onEdit, onDelete }: RecurringPlansListProps) {
  if (items.length === 0) {
    return <div className="empty-state">No recurring rules yet.</div>
  }

  return (
    <div className="budget-plans-grid recurring-plans-grid">
      {items.map((item) => (
        <article key={item.id} className="budget-plan-card recurring-plan-card">
          <div className="budget-plan-header">
            <div>
              <h3>{item.title}</h3>
              <p>{item.categoryName ?? 'Category'} · {item.accountName ?? 'Account'}</p>
            </div>
            <span className={item.type === 'income' ? 'budget-state budget-state-safe' : 'budget-state budget-state-warning'}>
              {item.type}
            </span>
          </div>

          <div className="recurring-metadata-grid">
            <div>
              <span>Amount</span>
              <strong>{formatCurrency(item.amount)}</strong>
            </div>
            <div>
              <span>Frequency</span>
              <strong>{item.frequency}</strong>
            </div>
            <div>
              <span>Next run</span>
              <strong>{item.nextRunDate}</strong>
            </div>
            <div>
              <span>Window</span>
              <strong>{item.endDate ? `${item.startDate} to ${item.endDate}` : `Starts ${item.startDate}`}</strong>
            </div>
          </div>

          <div className="budget-card-actions">
            <button type="button" className="secondary-button" onClick={() => onEdit(item)}>
              Edit
            </button>
            <button type="button" className="danger-button" onClick={() => void onDelete(item.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default RecurringPlansList
