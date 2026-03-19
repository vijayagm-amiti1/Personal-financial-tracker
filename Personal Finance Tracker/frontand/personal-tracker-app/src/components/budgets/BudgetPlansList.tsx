import type { BudgetRecord } from '../../types/budget'
import { renderCategoryIcon } from '../../utils/categoryIcons'

type BudgetPlansListProps = {
  budgets: BudgetRecord[]
  onEdit: (budget: BudgetRecord) => void
  onDelete: (budgetId: string) => Promise<void>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function getBudgetTone(spentPercent: number) {
  if (spentPercent >= 120) {
    return 'budget-tone-critical'
  }
  if (spentPercent >= 100) {
    return 'budget-tone-danger'
  }
  if (spentPercent >= 80) {
    return 'budget-tone-warning'
  }
  return 'budget-tone-safe'
}

function BudgetPlansList({ budgets, onEdit, onDelete }: BudgetPlansListProps) {
  if (budgets.length === 0) {
    return <div className="empty-state">No budget plans yet. Create the first one for this month.</div>
  }

  return (
    <div className="budget-grid">
      {budgets.map((budget) => {
        const fillWidth = Math.min(budget.spentPercent, 140)
        const safeCategoryName = budget.categoryName ?? 'Unlabeled category'

        return (
          <article key={budget.id} className={`budget-card ${getBudgetTone(budget.spentPercent)}`}>
            <div className="budget-card-header">
              <div className="category-display">
                <span
                  className="category-icon-chip"
                  style={{ color: budget.categoryColor ?? '#183050' }}
                >
                  {renderCategoryIcon(budget.categoryIcon, { size: 16, strokeWidth: 2.2 })}
                </span>
                <div className="budget-category-meta">
                  <h3>{safeCategoryName}</h3>
                  <p>Budget for {budget.month}/{budget.year}</p>
                </div>
              </div>
              <div className="budget-percent-block">
                <span>Achieved</span>
                <strong>{budget.spentPercent.toFixed(1)}%</strong>
              </div>
            </div>

            <div className="budget-card-metrics">
              <div className="budget-amount-row">
                <div className="budget-amount-chip">
                  <span>Spent now</span>
                  <strong>{formatCurrency(budget.currentSpent)}</strong>
                </div>
                <div className="budget-amount-chip">
                  <span>Estimated budget</span>
                  <strong>{formatCurrency(budget.amount)}</strong>
                </div>
                <div className="budget-amount-chip">
                  <span>{budget.remainingAmount < 0 ? 'Over by' : 'Left'}</span>
                  <strong>{formatCurrency(Math.abs(budget.remainingAmount))}</strong>
                </div>
              </div>
              <span>
                Actual spend is calculated from that month&apos;s expense transactions. Alert at{' '}
                {budget.alertThresholdPercent}%
              </span>
            </div>

            <div className="goal-progress-track" aria-hidden="true">
              <div className="budget-progress-fill" style={{ width: `${fillWidth}%` }} />
            </div>

            <div className="budget-scale-row" aria-hidden="true">
              <span>0</span>
              <span>{formatCurrency(budget.amount)}</span>
            </div>

            <div className="goal-card-footer budget-card-footer">
              <span>
                {budget.remainingAmount < 0
                  ? `${formatCurrency(Math.abs(budget.remainingAmount))} over budget`
                  : `${formatCurrency(budget.remainingAmount)} left`}
              </span>
              <div className="table-actions">
                <button type="button" className="table-action-button" onClick={() => onEdit(budget)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="table-action-button table-action-danger"
                  onClick={() => void onDelete(budget.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default BudgetPlansList
