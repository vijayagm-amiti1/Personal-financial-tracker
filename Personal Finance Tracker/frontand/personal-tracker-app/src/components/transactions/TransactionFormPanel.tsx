import { useEffect, useState } from 'react'
import type { DevAccount, DevCategory } from '../../types/report'
import type { TransactionFormValues, TransactionRecord } from '../../types/transaction'
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIconLabel,
  renderCategoryIcon,
} from '../../utils/categoryIcons'

const ICONS_PER_PAGE = 20

type TransactionFormPanelProps = {
  accounts: DevAccount[]
  categories: DevCategory[]
  editingTransaction: TransactionRecord | null
  onCancel: () => void
  onSubmit: (values: TransactionFormValues, transactionId?: string) => Promise<void>
  onCreateCategory?: (payload: {
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string
  }) => Promise<DevCategory>
}

const defaultValues: TransactionFormValues = {
  type: 'expense',
  amount: '',
  date: '',
  accountId: '',
  toAccountId: '',
  categoryId: '',
  merchant: '',
  note: '',
  paymentMethod: '',
  tags: '',
}

function toFormValues(transaction: TransactionRecord | null): TransactionFormValues {
  if (!transaction) {
    return defaultValues
  }

  return {
    type: transaction.type === 'goal_contribution' ? 'expense' : transaction.type,
    amount: String(transaction.amount),
    date: transaction.date,
    accountId: transaction.accountId,
    toAccountId: transaction.toAccountId ?? '',
    categoryId: transaction.categoryId ?? '',
    merchant: transaction.merchant ?? '',
    note: transaction.note ?? '',
    paymentMethod: transaction.paymentMethod ?? '',
    tags: '',
  }
}

function TransactionFormPanel({
  accounts,
  categories,
  editingTransaction,
  onCancel,
  onSubmit,
  onCreateCategory,
}: TransactionFormPanelProps) {
  const [values, setValues] = useState<TransactionFormValues>(defaultValues)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState('')
  const [customCategoryColor, setCustomCategoryColor] = useState('#1153c2')
  const [customCategoryIcon, setCustomCategoryIcon] = useState('shopping-basket')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [iconPage, setIconPage] = useState(1)

  useEffect(() => {
    setValues(toFormValues(editingTransaction))
    setError(null)
  }, [editingTransaction])

  useEffect(() => {
    if (values.accountId === '' && accounts.length > 0) {
      setValues((currentValues) => ({
        ...currentValues,
        accountId: accounts[0].id,
      }))
    }
  }, [accounts, values.accountId])

  const updateField =
    (field: keyof TransactionFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (field === 'categoryId' && event.target.value === '__custom__') {
        setShowCustomCategory(true)
        setIconPage(1)
        return
      }

      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }))
    }

  const filteredCategories = categories.filter((category) =>
    values.type === 'income' ? category.type === 'income' : category.type === 'expense',
  )
  const totalIconPages = Math.max(1, Math.ceil(CATEGORY_ICON_OPTIONS.length / ICONS_PER_PAGE))
  const visibleIconOptions = CATEGORY_ICON_OPTIONS.slice(
    (iconPage - 1) * ICONS_PER_PAGE,
    iconPage * ICONS_PER_PAGE,
  )

  const handleCreateCustomCategory = async () => {
    if (!onCreateCategory) {
      return
    }

    if (customCategoryName.trim() === '') {
      setError('Custom category name is required.')
      return
    }

    try {
      setError(null)
      setIsCreatingCategory(true)
      const createdCategory = await onCreateCategory({
        name: customCategoryName.trim(),
        type: values.type === 'income' ? 'income' : 'expense',
        color: customCategoryColor,
        icon: customCategoryIcon,
      })

      setValues((currentValues) => ({
        ...currentValues,
        categoryId: createdCategory.id,
      }))
      setShowCustomCategory(false)
      setCustomCategoryName('')
      setCustomCategoryIcon('shopping-basket')
      setCustomCategoryColor('#1153c2')
      setIconPage(1)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unexpected error while creating category.',
      )
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (values.amount.trim() === '' || values.date === '' || values.accountId === '') {
      setError('Amount, date, and account are required.')
      return
    }

    if (values.type === 'transfer' && values.toAccountId === '') {
      setError('Destination account is required for transfer.')
      return
    }

    try {
      setError(null)
      setIsSaving(true)
      await onSubmit(values, editingTransaction?.id)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unexpected error while saving transaction.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="report-panel">
      <header className="report-panel-header">
        <div>
          <h3>{editingTransaction ? 'Edit transaction' : 'Create transaction'}</h3>
          <p>Use accounts and categories already loaded from development storage.</p>
        </div>
      </header>

      <div className="report-panel-body">
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="transaction-form-grid">
            <label className="field field-small">
              <span>Type</span>
              <select value={values.type} onChange={updateField('type')}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </label>

            <label className="field field-small">
              <span>Amount</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={values.amount}
                onChange={updateField('amount')}
              />
            </label>

            <label className="field field-small">
              <span>Date</span>
              <input type="date" value={values.date} onChange={updateField('date')} />
            </label>

            <label className="field">
              <span>Account</span>
              <select value={values.accountId} onChange={updateField('accountId')}>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            {values.type === 'transfer' ? (
              <label className="field">
                <span>To account</span>
                <select value={values.toAccountId} onChange={updateField('toAccountId')}>
                  <option value="">Select destination</option>
                  {accounts
                    .filter((account) => account.id !== values.accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <label className="field">
                <span>Category</span>
                <select value={values.categoryId} onChange={updateField('categoryId')}>
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom category</option>
                </select>
              </label>
            )}

            <label className="field">
              <span>Merchant</span>
              <input value={values.merchant} onChange={updateField('merchant')} />
            </label>

            <label className="field">
              <span>Payment method</span>
              <input value={values.paymentMethod} onChange={updateField('paymentMethod')} />
            </label>

            <label className="field">
              <span>Tags</span>
              <input
                value={values.tags}
                onChange={updateField('tags')}
                placeholder="family, weekly"
              />
            </label>

            <label className="field field-full">
              <span>Note</span>
              <textarea value={values.note} onChange={updateField('note')} rows={4} />
            </label>
          </div>

          {error ? <div className="report-error">{error}</div> : null}

          <div className="transaction-form-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingTransaction ? 'Update transaction' : 'Create transaction'}
            </button>
          </div>
        </form>

        {showCustomCategory ? (
          <div
            className="modal-overlay"
            role="presentation"
            onClick={() => {
              setShowCustomCategory(false)
              setIconPage(1)
            }}
          >
            <div
              className="modal-card"
              role="dialog"
              aria-modal="true"
              aria-label="Create custom category"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-card-header">
                <div>
                  <h3>Create new category</h3>
                  <p>This category will be saved for the current user and can be reused in transactions.</p>
                </div>
                <button
                  type="button"
                  className="table-action-button"
                  onClick={() => {
                    setShowCustomCategory(false)
                    setIconPage(1)
                  }}
                >
                  Close
                </button>
              </div>

              <div className="modal-card-body">
                <div className="inline-category-toast-grid">
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={customCategoryName}
                      onChange={(event) => setCustomCategoryName(event.target.value)}
                      placeholder="Enter category name"
                    />
                  </label>

                  <label className="field field-small">
                    <span>Color</span>
                    <input
                      type="color"
                      value={customCategoryColor}
                      onChange={(event) => setCustomCategoryColor(event.target.value)}
                    />
                  </label>

                  <div className="field field-full">
                    <span>Icon</span>
                    <div className="icon-picker-grid" role="listbox" aria-label="Category icons">
                      {visibleIconOptions.map((iconOption) => (
                        <button
                          key={iconOption.key}
                          type="button"
                          className={
                            customCategoryIcon === iconOption.key
                              ? 'icon-picker-button icon-picker-button-active'
                              : 'icon-picker-button'
                          }
                          onClick={() => setCustomCategoryIcon(iconOption.key)}
                          title={iconOption.label}
                        >
                          <span
                            className="icon-picker-visual"
                            style={{ color: customCategoryColor }}
                          >
                            {renderCategoryIcon(iconOption.key, { size: 18, strokeWidth: 2 })}
                          </span>
                          <span className="icon-picker-label">{iconOption.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="icon-picker-pagination">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setIconPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={iconPage === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {iconPage} of {totalIconPages}
                      </span>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          setIconPage((currentPage) => Math.min(totalIconPages, currentPage + 1))
                        }
                        disabled={iconPage === totalIconPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-card-footer">
                <div className="category-icon-preview">
                  <span
                    className="category-icon-chip"
                    style={{ color: customCategoryColor }}
                  >
                    {renderCategoryIcon(customCategoryIcon, { size: 16, strokeWidth: 2.25 })}
                  </span>
                  <span>{getCategoryIconLabel(customCategoryIcon)}</span>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleCreateCustomCategory()}
                  disabled={isCreatingCategory}
                >
                  {isCreatingCategory ? 'Saving...' : 'Save custom category'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default TransactionFormPanel
