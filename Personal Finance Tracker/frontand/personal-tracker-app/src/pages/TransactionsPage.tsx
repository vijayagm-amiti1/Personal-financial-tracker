import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportPanel from '../components/reports/ReportPanel'
import TransactionFormPanel from '../components/transactions/TransactionFormPanel'
import TransactionFiltersBar from '../components/transactions/TransactionFiltersBar'
import TransactionTable from '../components/transactions/TransactionTable'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useTransactionsData from '../hooks/useTransactionsData'
import type { TransactionFilters, TransactionFormValues, TransactionRecord } from '../types/transaction'

const defaultFilters: TransactionFilters = {
  search: '',
  type: 'all',
  accountId: 'all',
  categoryId: 'all',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function TransactionsPage() {
  const navigate = useNavigate()
  const { user, accounts, activeAccounts, categories, createCategory } = useDevelopmentBootstrap()
  const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    transactions,
    filteredTransactions,
    paginatedTransactions,
    isLoading,
    error,
    filters,
    setFilters,
    page,
    totalPages,
    setPage,
    saveTransaction,
    deleteTransaction,
    reload,
  } = useTransactionsData({
    userId: user.id,
    accounts: activeAccounts,
    categories,
  })

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += transaction.amount
        } else if (transaction.type === 'expense') {
          accumulator.expense += transaction.amount
        } else {
          accumulator.transfer += transaction.amount
        }
        return accumulator
      },
      { income: 0, expense: 0, transfer: 0 },
    )
  }, [filteredTransactions])

  const openCreateForm = () => {
    navigate('/transactions/new')
  }

  const handleSave = async (values: TransactionFormValues, transactionId?: string) => {
    setActionError(null)
    await saveTransaction({ values, transactionId })
    setEditingTransaction(null)
  }

  const handleDelete = async (transactionId: string) => {
    try {
      setActionError(null)
      await deleteTransaction(transactionId)
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unexpected error while deleting transaction.',
      )
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2>Track income, expense, and transfer activity</h2>
        </div>
        <p className="page-description">
          Search by merchant or note, filter by date, category, amount, type, and account, then fix incorrect records quickly.
        </p>
      </header>

      <div className="summary-grid">
        <article className="summary-card summary-card-positive">
          <p>Filtered income</p>
          <strong>{formatCurrency(totals.income)}</strong>
          <span>Only income rows inside the current filter result.</span>
        </article>
        <article className="summary-card summary-card-negative">
          <p>Filtered expense</p>
          <strong>{formatCurrency(totals.expense)}</strong>
          <span>Only expense rows inside the current filter result.</span>
        </article>
        <article className="summary-card summary-card-neutral">
          <p>Transfers</p>
          <strong>{formatCurrency(totals.transfer)}</strong>
          <span>Transfers remain visible for reconciliation and edits.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Visible rows</p>
          <strong>{filteredTransactions.length}</strong>
          <span>{transactions.length} transactions loaded from the backend.</span>
        </article>
      </div>

      <TransactionFiltersBar
        filters={filters}
        accounts={activeAccounts}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
        onCreate={openCreateForm}
      />

      {error ? (
        <div className="report-error" role="alert">
          <strong>Unable to load transactions.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {actionError ? (
        <div className="report-error" role="alert">
          <strong>Transaction action failed.</strong>
          <span>{actionError}</span>
        </div>
      ) : null}

      {editingTransaction ? (
        <TransactionFormPanel
          accounts={activeAccounts}
          categories={categories}
          editingTransaction={editingTransaction}
          onCreateCategory={createCategory}
          onCancel={() => {
            setEditingTransaction(null)
            setActionError(null)
          }}
          onSubmit={handleSave}
        />
      ) : null}

      <ReportPanel
        title="Transactions list"
        subtitle="Client-side filtered list backed by the Spring transaction APIs."
      >
        <TransactionTable
          items={paginatedTransactions}
          accounts={accounts}
          categories={categories}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={(transaction) => {
            setEditingTransaction(transaction)
            setActionError(null)
          }}
          onDelete={handleDelete}
        />
      </ReportPanel>

      <div className="page-actions">
        <button type="button" className="secondary-button" onClick={() => void reload()}>
          Refresh from backend
        </button>
      </div>
    </section>
  )
}

export default TransactionsPage
