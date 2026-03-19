import { useMemo, useState } from 'react'
import BudgetFormPanel from '../components/budgets/BudgetFormPanel'
import BudgetPlansList from '../components/budgets/BudgetPlansList'
import ReportPanel from '../components/reports/ReportPanel'
import useBudgetsData from '../hooks/useBudgetsData'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import type { BudgetFormValues, BudgetRecord } from '../types/budget'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function BudgetsPage() {
  const { user, categories } = useDevelopmentBootstrap()
  const { budgets, isLoading, error, saveBudget, deleteBudget } = useBudgetsData({ userId: user.id })
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const visibleBudgets = useMemo(
    () =>
      budgets
        .filter((budget) => budget.month === selectedMonth && budget.year === selectedYear)
        .map((budget) => {
          const matchedCategory = categories.find((category) => category.id === budget.categoryId)

          return {
            ...budget,
            categoryName: budget.categoryName ?? matchedCategory?.name ?? 'Budget category',
            categoryColor: budget.categoryColor ?? matchedCategory?.color ?? '#183050',
            categoryIcon: budget.categoryIcon ?? matchedCategory?.icon ?? 'wallet',
          }
        }),
    [budgets, categories, selectedMonth, selectedYear],
  )

  const summary = useMemo(() => {
    return visibleBudgets.reduce(
      (accumulator, budget) => {
        accumulator.totalPlans += 1
        accumulator.totalBudget += budget.amount
        accumulator.totalSpent += budget.spentAmount
        if (budget.spentPercent >= 100) {
          accumulator.overBudget += 1
        } else if (budget.spentPercent >= budget.alertThresholdPercent) {
          accumulator.nearLimit += 1
        }
        return accumulator
      },
      {
        totalPlans: 0,
        totalBudget: 0,
        totalSpent: 0,
        nearLimit: 0,
        overBudget: 0,
      },
    )
  }, [visibleBudgets])

  const handleSave = async (values: BudgetFormValues, budgetId?: string) => {
    try {
      setActionError(null)
      await saveBudget(values, budgetId)
      setEditingBudget(null)
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Budget save failed.')
      throw caughtError
    }
  }

  const handleDelete = async (budgetId: string) => {
    try {
      setActionError(null)
      await deleteBudget(budgetId)
      if (editingBudget?.id === budgetId) {
        setEditingBudget(null)
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Budget delete failed.')
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Budgets</p>
          <h2>Monthly budget plans</h2>
        </div>
        <p className="page-description">
          Create monthly limits for categories, then compare actual expense against each plan.
        </p>
      </header>

      <div className="budget-info-banner">
        <strong>Money spent is maintained directly on the budget</strong>
        <span>
          Only the selected month and year belong to this plan. It does not continue automatically
          into the next month.
        </span>
      </div>

      <section className="goals-filter-bar">
        <label className="field field-small">
          <span>Month</span>
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-small">
          <span>Year</span>
          <input
            type="number"
            min="2000"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          />
        </label>

      </section>

      <div className="summary-grid">
        <article className="summary-card summary-card-neutral">
          <p>Total budget plans</p>
          <strong>{summary.totalPlans}</strong>
          <span>All category budgets created for this user.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Planned amount</p>
          <strong>{formatCurrency(summary.totalBudget)}</strong>
          <span>Total target amount across the listed budgets.</span>
        </article>
        <article className="summary-card summary-card-neutral">
          <p>Achieved spend</p>
          <strong>{formatCurrency(summary.totalSpent)}</strong>
          <span>Actual spent amount from matching monthly transactions.</span>
        </article>
        <article className="summary-card summary-card-positive">
          <p>Near limit</p>
          <strong>{summary.nearLimit}</strong>
          <span>Budgets that have reached their alert threshold.</span>
        </article>
        <article className="summary-card summary-card-negative">
          <p>Over budget</p>
          <strong>{summary.overBudget}</strong>
          <span>Budgets where actual expense has crossed the limit.</span>
        </article>
      </div>

      {error ? (
        <div className="report-error" role="alert">
          <strong>Unable to load budgets.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {actionError ? (
        <div className="report-error" role="alert">
          <strong>Budget action failed.</strong>
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="budget-layout">
        <BudgetFormPanel
          categories={categories}
          editingBudget={editingBudget}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onCancel={() => setEditingBudget(null)}
          onSubmit={handleSave}
        />

        <ReportPanel
          title="Budget plans"
          subtitle="Each plan shows the category budget, actual expense, and how close it is to the limit."
        >
          {isLoading ? (
            <div className="empty-state">Loading budgets...</div>
          ) : (
            <BudgetPlansList budgets={visibleBudgets} onEdit={setEditingBudget} onDelete={handleDelete} />
          )}
        </ReportPanel>
      </div>
    </section>
  )
}

export default BudgetsPage
