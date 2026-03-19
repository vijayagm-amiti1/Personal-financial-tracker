import { useEffect, useState } from 'react'
import type { DevCategory } from '../../types/report'
import type { BudgetFormValues, BudgetRecord } from '../../types/budget'

type BudgetFormPanelProps = {
  categories: DevCategory[]
  editingBudget: BudgetRecord | null
  selectedMonth: number
  selectedYear: number
  onCancel: () => void
  onSubmit: (values: BudgetFormValues, budgetId?: string) => Promise<void>
}

function getDefaultValues(selectedMonth: number, selectedYear: number): BudgetFormValues {
  return {
    categoryId: '',
    month: String(selectedMonth),
    year: String(selectedYear),
    amount: '',
    alertThresholdPercent: '80',
  }
}

function toFormValues(
  budget: BudgetRecord | null,
  selectedMonth: number,
  selectedYear: number,
): BudgetFormValues {
  if (!budget) {
    return getDefaultValues(selectedMonth, selectedYear)
  }

  return {
    categoryId: budget.categoryId,
    month: String(budget.month),
    year: String(budget.year),
    amount: String(budget.amount),
    alertThresholdPercent: String(budget.alertThresholdPercent),
  }
}

function BudgetFormPanel({
  categories,
  editingBudget,
  selectedMonth,
  selectedYear,
  onCancel,
  onSubmit,
}: BudgetFormPanelProps) {
  const [values, setValues] = useState<BudgetFormValues>(getDefaultValues(selectedMonth, selectedYear))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setValues(toFormValues(editingBudget, selectedMonth, selectedYear))
    setError(null)
  }, [editingBudget, selectedMonth, selectedYear])

  const expenseCategories = categories.filter((category) => category.type === 'expense')

  const updateField =
    (field: keyof BudgetFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      values.categoryId === '' ||
      values.month === '' ||
      values.year === '' ||
      values.amount.trim() === ''
    ) {
      setError('Category, month, year, and budget amount are required.')
      return
    }

    const parsedAmount = Number(values.amount)
    const parsedMonth = Number(values.month)
    const parsedYear = Number(values.year)
    const parsedAlertThreshold = Number(values.alertThresholdPercent)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Budget amount must be greater than 0.')
      return
    }

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setError('Month must be between 1 and 12.')
      return
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
      setError('Year must be valid.')
      return
    }

    if (!Number.isFinite(parsedAlertThreshold) || parsedAlertThreshold <= 0) {
      setError('Alert threshold must be greater than 0.')
      return
    }

    try {
      setError(null)
      setIsSaving(true)
      await onSubmit(values, editingBudget?.id)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save budget.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="report-panel">
      <header className="report-panel-header">
        <div>
          <h3>{editingBudget ? 'Edit budget plan' : 'Create budget plan'}</h3>
          <p>Set a monthly spending limit for one category and track actual spend against it.</p>
        </div>
      </header>

      <div className="report-panel-body">
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form-grid">
            <label className="field">
              <span>Category</span>
              <select value={values.categoryId} onChange={updateField('categoryId')}>
                <option value="">Select category</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-small">
              <span>Month</span>
              <select value={values.month} onChange={updateField('month')}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-small">
              <span>Year</span>
              <input type="number" min="2000" value={values.year} onChange={updateField('year')} />
            </label>

            <label className="field field-small">
              <span>Budget amount</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={values.amount}
                onChange={updateField('amount')}
              />
            </label>

            <label className="field field-small">
              <span>Alert threshold %</span>
              <input
                type="number"
                min="1"
                max="200"
                step="1"
                value={values.alertThresholdPercent}
                onChange={updateField('alertThresholdPercent')}
              />
            </label>
          </div>

          {error ? <div className="report-error">{error}</div> : null}

          <div className="transaction-form-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingBudget ? 'Update budget' : 'Create budget'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default BudgetFormPanel
