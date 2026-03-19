import { useEffect, useMemo, useState } from 'react'
import BudgetFormPanel from '../components/budgets/BudgetFormPanel'
import BudgetPlansList from '../components/budgets/BudgetPlansList'
import ReportPanel from '../components/reports/ReportPanel'
import useBudgetsData from '../hooks/useBudgetsData'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import type { BudgetFormValues, BudgetRecord } from '../types/budget'
import type { EndpointConfig } from '../types/report'
import type { TransactionRecord } from '../types/transaction'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

async function loadEndpointConfig(): Promise<EndpointConfig> {
  const response = await fetch('/endpoints.json')

  if (!response.ok) {
    throw new Error('Failed to load endpoint configuration.')
  }

  return response.json()
}

function BudgetsPage() {
  const { user, categories } = useDevelopmentBootstrap()
  const { budgets, isLoading, error, saveBudget, deleteBudget, copyPreviousMonthBudgets } = useBudgetsData({ userId: user.id })
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])

  useEffect(() => {
    let isActive = true

    const loadTransactions = async () => {
      try {
        const config = await loadEndpointConfig()
        const path = config.transactions.getByUser.path.replace('{userId}', user.id)
        const response = await fetch(new URL(path, config.baseUrl).toString(), { cache: 'no-store' })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as TransactionRecord[]
        if (isActive) {
          setTransactions(Array.isArray(payload) ? payload : [])
        }
      } catch {
        if (isActive) {
          setTransactions([])
        }
      }
    }

    const refreshOnFocus = () => {
      void loadTransactions()
    }

    void loadTransactions()
    const intervalId = window.setInterval(() => {
      void loadTransactions()
    }, 5000)
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [user.id])

  const visibleBudgets = useMemo(
    () =>
      budgets
        .filter((budget) => budget.month === selectedMonth && budget.year === selectedYear)
        .map((budget) => {
          const matchedCategory = categories.find((category) => category.id === budget.categoryId)
          const transactionSpent = transactions.reduce((total, transaction) => {
            if (transaction.type !== 'expense' || transaction.categoryId !== budget.categoryId) {
              return total
            }

            const transactionDate = new Date(transaction.date)
            const transactionMonth = transactionDate.getMonth() + 1
            const transactionYear = transactionDate.getFullYear()

            if (transactionMonth !== budget.month || transactionYear !== budget.year) {
              return total
            }

            return total + transaction.amount
          }, 0)
          const effectiveSpent = Math.max(budget.currentSpent, budget.spentAmount, transactionSpent)
          const remainingAmount = Number((budget.amount - effectiveSpent).toFixed(2))
          const spentPercent = budget.amount > 0
            ? Number(((effectiveSpent * 100) / budget.amount).toFixed(2))
            : 0

          return {
            ...budget,
            categoryName: budget.categoryName ?? matchedCategory?.name ?? 'Budget category',
            categoryColor: budget.categoryColor ?? matchedCategory?.color ?? '#183050',
            categoryIcon: budget.categoryIcon ?? matchedCategory?.icon ?? 'wallet',
            currentSpent: effectiveSpent,
            spentAmount: effectiveSpent,
            remainingAmount,
            spentPercent,
          }
        }),
    [budgets, categories, transactions, selectedMonth, selectedYear],
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

  const handleCopyPrevious = async () => {
    try {
      setActionError(null)
      await copyPreviousMonthBudgets(selectedMonth, selectedYear)
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Budget copy failed.')
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
        <strong>How achieved money is calculated</strong>
        <span>
          Budget progress is derived from expense transactions in the selected month and year. If
          every card still shows zero, rerun the latest budget seed data and restart the backend.
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

        <button type="button" className="secondary-button" onClick={() => void handleCopyPrevious()}>
          Copy previous month budgets
        </button>
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
