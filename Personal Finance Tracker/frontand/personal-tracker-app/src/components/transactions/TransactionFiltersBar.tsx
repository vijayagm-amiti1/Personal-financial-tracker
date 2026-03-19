import type { ChangeEvent } from 'react'
import type { DevAccount, DevCategory } from '../../types/report'
import type { TransactionFilters } from '../../types/transaction'

type TransactionFiltersBarProps = {
  filters: TransactionFilters
  accounts: DevAccount[]
  categories: DevCategory[]
  onChange: (filters: TransactionFilters) => void
  onReset: () => void
  onCreate: () => void
}

function TransactionFiltersBar({
  filters,
  accounts,
  categories,
  onChange,
  onReset,
  onCreate,
}: TransactionFiltersBarProps) {
  const updateField =
    (field: keyof TransactionFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({
        ...filters,
        [field]: event.target.value,
      })
    }

  return (
    <section className="transaction-toolbar">
      <div className="transaction-toolbar-grid">
        <label className="field">
          <span>Search</span>
          <input
            value={filters.search}
            onChange={updateField('search')}
            placeholder="Merchant or note"
          />
        </label>

        <label className="field field-small">
          <span>Type</span>
          <select value={filters.type} onChange={updateField('type')}>
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="goal_contribution">Goal contribution</option>
          </select>
        </label>

        <label className="field">
          <span>Account</span>
          <select value={filters.accountId} onChange={updateField('accountId')}>
            <option value="all">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <select value={filters.categoryId} onChange={updateField('categoryId')}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-small">
          <span>Date from</span>
          <input type="date" value={filters.dateFrom} onChange={updateField('dateFrom')} />
        </label>

        <label className="field field-small">
          <span>Date to</span>
          <input type="date" value={filters.dateTo} onChange={updateField('dateTo')} />
        </label>

        <label className="field field-small">
          <span>Min amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.minAmount}
            onChange={updateField('minAmount')}
          />
        </label>

        <label className="field field-small">
          <span>Max amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.maxAmount}
            onChange={updateField('maxAmount')}
          />
        </label>
      </div>

      <div className="transaction-toolbar-actions">
        <button type="button" className="secondary-button" onClick={onReset}>
          Reset filters
        </button>
        <button type="button" className="primary-button" onClick={onCreate}>
          New transaction
        </button>
      </div>
    </section>
  )
}

export default TransactionFiltersBar
