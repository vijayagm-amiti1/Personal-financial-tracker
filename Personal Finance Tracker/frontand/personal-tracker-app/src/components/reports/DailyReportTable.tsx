import { ALL_ACCOUNTS_VALUE } from '../../utils/devStorage'
import type { DailyReport } from '../../types/report'

type DailyReportTableProps = {
  items: DailyReport[]
  isLoading: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function DailyReportTable({ items, isLoading }: DailyReportTableProps) {
  if (isLoading) {
    return <div className="empty-state">Loading daily report rows...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No daily data returned for these filters.</div>
  }

  return (
    <div className="table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Account ID</th>
            <th>Income</th>
            <th>Expense</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.accountId}-${item.day}`}>
              <td>{item.day}</td>
              <td className="truncate-cell">
                {item.accountId === ALL_ACCOUNTS_VALUE ? 'All Accounts' : item.accountId}
              </td>
              <td>{formatCurrency(item.income)}</td>
              <td>{formatCurrency(item.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DailyReportTable
