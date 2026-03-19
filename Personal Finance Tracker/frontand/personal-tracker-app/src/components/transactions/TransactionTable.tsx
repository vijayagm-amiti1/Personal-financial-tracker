import type { DevAccount, DevCategory } from '../../types/report'
import type { TransactionRecord } from '../../types/transaction'
import { renderCategoryIcon } from '../../utils/categoryIcons'

type TransactionTableProps = {
  items: TransactionRecord[]
  accounts: DevAccount[]
  categories: DevCategory[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (transaction: TransactionRecord) => void
  onDelete: (transactionId: string) => Promise<void>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatTransactionType(type: TransactionRecord['type']) {
  return type === 'goal_contribution' ? 'Goal contribution' : type
}

function TransactionTable({
  items,
  accounts,
  categories,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const accountMap = new Map(accounts.map((account) => [account.id, account.name]))
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))
  const canModifyTransaction = (type: TransactionRecord['type']) => type !== 'goal_contribution'

  if (isLoading) {
    return <div className="empty-state">Loading transactions...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No transactions matched the current filters.</div>
  }

  return (
    <div className="transaction-table-wrap">
      <div className="table-wrap">
        <table className="report-table transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Merchant</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>
                  <span className={`transaction-badge transaction-badge-${transaction.type}`}>
                    {formatTransactionType(transaction.type)}
                  </span>
                </td>
                <td>{transaction.merchant ?? '-'}</td>
                <td>
                  {transaction.categoryId ? (
                    <span className="category-display">
                      <span
                        className="category-icon-chip"
                        style={{
                          color:
                            categories.find((category) => category.id === transaction.categoryId)?.color ??
                            '#183050',
                        }}
                      >
                        {renderCategoryIcon(
                          categories.find((category) => category.id === transaction.categoryId)?.icon,
                          { size: 16, strokeWidth: 2.2 },
                        )}
                      </span>
                      <span>{categoryMap.get(transaction.categoryId) ?? '-'}</span>
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {accountMap.get(transaction.accountId) ?? transaction.accountId}
                  {transaction.toAccountId
                    ? ` -> ${accountMap.get(transaction.toAccountId) ?? transaction.toAccountId}`
                    : ''}
                </td>
                <td>{formatCurrency(transaction.amount)}</td>
                <td>{transaction.note ?? '-'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-action-button"
                      onClick={() => onEdit(transaction)}
                      disabled={!canModifyTransaction(transaction.type)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="table-action-button table-action-danger"
                      onClick={() => void onDelete(transaction.id)}
                      disabled={!canModifyTransaction(transaction.type)}
                    >
                      Delete
                    </button>
                  </div>
                  {!canModifyTransaction(transaction.type) ? (
                    <div className="transaction-table-note">Manage from goals only</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default TransactionTable
