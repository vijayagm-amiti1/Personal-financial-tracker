import type { ChangeEvent } from 'react'
import type { DevAccount, ReportFilters } from '../../types/report'
import { ALL_ACCOUNTS_VALUE } from '../../utils/devStorage'

type FilterBarProps = {
  filters: ReportFilters
  accounts: DevAccount[]
  onChange: (filters: ReportFilters) => void
  onReload: () => void
}

function FilterBar({ filters, accounts, onChange, onReload }: FilterBarProps) {
  const updateField =
    (field: keyof ReportFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        field === 'month' || field === 'year'
          ? Number(event.target.value)
          : event.target.value

      onChange({
        ...filters,
        [field]: value,
      })
    }

  return (
    <div className="filter-bar">
      <label className="field">
        <span>Account</span>
        <select value={filters.accountId} onChange={updateField('accountId')}>
          <option value={ALL_ACCOUNTS_VALUE}>All Accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-small">
        <span>Type</span>
        <select value={filters.type} onChange={updateField('type')}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>

      <label className="field field-small">
        <span>Month</span>
        <select value={filters.month} onChange={updateField('month')}>
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
          value={filters.year}
          onChange={updateField('year')}
          min={2000}
          max={2100}
        />
      </label>

      <button type="button" className="primary-button" onClick={onReload}>
        Reload reports
      </button>
    </div>
  )
}

export default FilterBar
