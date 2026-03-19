import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TransactionFormPanel from '../components/transactions/TransactionFormPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useTransactionsData from '../hooks/useTransactionsData'
import type { TransactionFormValues } from '../types/transaction'

function TransactionCreatePage() {
  const navigate = useNavigate()
  const { user, activeAccounts, categories, createCategory } = useDevelopmentBootstrap()
  const { saveTransaction } = useTransactionsData({
    userId: user.id,
    accounts: activeAccounts,
    categories,
  })
  const [pageError, setPageError] = useState<string | null>(null)

  const handleSave = async (values: TransactionFormValues) => {
    setPageError(null)
    await saveTransaction({ values })
    navigate('/transactions')
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Transactions</p>
          <h2>Add a new transaction</h2>
        </div>
        <p className="page-description">
          Create income, expense, or transfer entries, and add a custom category if the existing list is not enough.
        </p>
      </header>

      {pageError ? (
        <div className="report-error" role="alert">
          <strong>Unable to save transaction.</strong>
          <span>{pageError}</span>
        </div>
      ) : null}

      <TransactionFormPanel
        accounts={activeAccounts}
        categories={categories}
        editingTransaction={null}
        onCancel={() => navigate('/transactions')}
        onCreateCategory={createCategory}
        onSubmit={async (values) => {
          try {
            await handleSave(values)
          } catch (caughtError) {
            setPageError(
              caughtError instanceof Error
                ? caughtError.message
                : 'Unexpected error while saving transaction.',
            )
            throw caughtError
          }
        }}
      />
    </section>
  )
}

export default TransactionCreatePage
