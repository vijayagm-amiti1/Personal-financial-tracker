import { useEffect, useState } from 'react'
import type { DevAccount, DevCategory } from '../../types/report'
import type { RecurringFormValues, RecurringRecord } from '../../types/recurring'

type RecurringFormPanelProps = {
  accounts: DevAccount[]
  categories: DevCategory[]
  editingItem: RecurringRecord | null
  onCancel: () => void
  onSubmit: (values: RecurringFormValues, recurringId?: string) => Promise<void>
}

function RecurringFormPanel({
  accounts,
  categories,
  editingItem,
  onCancel,
  onSubmit,
}: RecurringFormPanelProps) {
  const expenseCategories = categories.filter((category) => category.type === 'expense')
  const incomeCategories = categories.filter((category) => category.type === 'income')

  const initialType = editingItem?.type ?? 'expense'
  const [selectedType, setSelectedType] = useState<RecurringFormValues['type']>(initialType)
  const availableCategories = selectedType === 'income' ? incomeCategories : expenseCategories

  const initialValues: RecurringFormValues = {
    title: editingItem?.title ?? '',
    type: initialType,
    amount: editingItem ? String(editingItem.amount) : '',
    categoryId: editingItem?.categoryId ?? '',
    accountId: editingItem?.accountId ?? accounts[0]?.id ?? '',
    frequency: editingItem?.frequency ?? 'monthly',
    startDate: editingItem?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: editingItem?.endDate ?? '',
    autoCreateTransaction: editingItem?.autoCreateTransaction ?? true,
  }

  useEffect(() => {
    setSelectedType(editingItem?.type ?? 'expense')
  }, [editingItem])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const values: RecurringFormValues = {
      title: String(formData.get('title') ?? ''),
      type: String(formData.get('type') ?? 'expense') as RecurringFormValues['type'],
      amount: String(formData.get('amount') ?? ''),
      categoryId: String(formData.get('categoryId') ?? ''),
      accountId: String(formData.get('accountId') ?? ''),
      frequency: String(formData.get('frequency') ?? 'monthly') as RecurringFormValues['frequency'],
      startDate: String(formData.get('startDate') ?? ''),
      endDate: String(formData.get('endDate') ?? ''),
      autoCreateTransaction: formData.get('autoCreateTransaction') === 'on',
    }

    await onSubmit(values, editingItem?.id)
  }

  return (
    <form className="transaction-form recurring-form-panel" onSubmit={(event) => void handleSubmit(event)}>
      <div className="transaction-form-header">
        <div>
          <h3>{editingItem ? 'Edit recurring item' : 'New recurring item'}</h3>
          <p>Save the rule once, then run due items into normal transactions.</p>
        </div>
      </div>

      <div className="transaction-form-grid recurring-form-grid">
        <label className="field">
          <span>Title</span>
          <input name="title" defaultValue={initialValues.title} required />
        </label>

        <label className="field">
          <span>Type</span>
          <select
            name="type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as RecurringFormValues['type'])}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="field">
          <span>Amount</span>
          <input name="amount" type="number" min="0.01" step="0.01" defaultValue={initialValues.amount} required />
        </label>

        <label className="field">
          <span>Frequency</span>
          <select name="frequency" defaultValue={initialValues.frequency}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>

        <label className="field">
          <span>Account</span>
          <select name="accountId" defaultValue={initialValues.accountId} required>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <select name="categoryId" defaultValue={initialValues.categoryId} required>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Start date</span>
          <input name="startDate" type="date" defaultValue={initialValues.startDate} required />
        </label>

        <label className="field">
          <span>End date</span>
          <input name="endDate" type="date" defaultValue={initialValues.endDate} />
        </label>
      </div>

      <label className="checkbox-field">
        <input
          name="autoCreateTransaction"
          type="checkbox"
          defaultChecked={initialValues.autoCreateTransaction}
        />
        <span>Create the normal transaction automatically when this item becomes due.</span>
      </label>

      <div className="transaction-form-actions">
        {editingItem ? (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
        <button type="submit" className="primary-button">
          {editingItem ? 'Update recurring item' : 'Save recurring item'}
        </button>
      </div>
    </form>
  )
}

export default RecurringFormPanel
