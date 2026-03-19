import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import CategorySpendingPieChart from '../components/reports/CategorySpendingPieChart'
import IncomeExpenseLineChart from '../components/reports/IncomeExpenseLineChart'
import ReportPanel from '../components/reports/ReportPanel'
import SummaryCard from '../components/reports/SummaryCard'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useRecurringData from '../hooks/useRecurringData'
import useReportsData from '../hooks/useReportsData'
import useTransactionsData from '../hooks/useTransactionsData'
import { ALL_ACCOUNTS_VALUE } from '../utils/devStorage'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function getCurrentMonthTotals(
  items: Array<{ income: number; expense: number }>,
) {
  return items.reduce(
    (totals, item) => ({
      income: totals.income + item.income,
      expense: totals.expense + item.expense,
    }),
    { income: 0, expense: 0 },
  )
}

function DashboardPage() {
  const { user, activeAccounts, categories, goals } = useDevelopmentBootstrap()
  const { transactions, isLoading: transactionsLoading } = useTransactionsData({
    userId: user.id,
    accounts: activeAccounts,
    categories,
  })
  const { items: recurringItems, isLoading: recurringLoading } = useRecurringData({
    userId: user.id,
    accounts: activeAccounts,
    categories,
  })

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const reportFilters = useMemo(
    () => ({
      accountId: ALL_ACCOUNTS_VALUE,
      month: currentMonth,
      year: currentYear,
      type: 'all' as const,
    }),
    [currentMonth, currentYear],
  )

  const {
    dailyReport,
    categorySpendingReport,
    isLoading: reportsLoading,
  } = useReportsData(reportFilters, activeAccounts)

  const totals = useMemo(() => getCurrentMonthTotals(dailyReport), [dailyReport])
  const currentBalance = useMemo(
    () => activeAccounts.reduce((sum, account) => sum + Number(account.currentBalance ?? 0), 0),
    [activeAccounts],
  )
  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status.toLowerCase() !== 'completed'),
    [goals],
  )
  const goalSummary = useMemo(() => {
    const target = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
    const current = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const percent = target > 0 ? Math.round((current / target) * 100) : 0
    return { current, target, percent }
  }, [activeGoals])

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 5)
        .map((transaction) => {
          const accountName =
            activeAccounts.find((account) => account.id === transaction.accountId)?.name ?? 'Unknown account'
          const categoryName =
            categories.find((category) => category.id === transaction.categoryId)?.name ??
            (transaction.type === 'transfer' ? 'Transfer' : 'Uncategorized')

          return {
            ...transaction,
            accountName,
            categoryName,
          }
        }),
    [activeAccounts, categories, transactions],
  )

  const upcomingBills = useMemo(() => {
    const today = currentDate.toISOString().slice(0, 10)
    return [...recurringItems]
      .filter((item) => item.type === 'expense' && item.nextRunDate >= today)
      .sort((left, right) => left.nextRunDate.localeCompare(right.nextRunDate))
      .slice(0, 5)
  }, [currentDate, recurringItems])

  return (
    <section className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
        <p className="page-description">
          One-screen view of this month&apos;s flow, top categories, recent activity, and upcoming bills.
        </p>
      </header>

      <div className="summary-grid">
        <SummaryCard
          title="Current balance"
          value={currentBalance}
          tone="neutral"
          label={`${activeAccounts.length} active accounts`}
        />
        <SummaryCard
          title="Month income"
          value={totals.income}
          tone="positive"
          label={`For ${currentMonth}/${currentYear}`}
          isLoading={reportsLoading}
        />
        <SummaryCard
          title="Month expense"
          value={totals.expense}
          tone="negative"
          label={`For ${currentMonth}/${currentYear}`}
          isLoading={reportsLoading}
        />
        <SummaryCard
          title="Savings goals"
          value={goalSummary.current}
          tone="warning"
          label={
            goalSummary.target > 0
              ? `${goalSummary.percent}% of ${formatCurrency(goalSummary.target)} target`
              : 'No active goal target yet'
          }
        />
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <ReportPanel
          title="Spending by category"
          subtitle="Current month expense mix across all active accounts."
        >
          <CategorySpendingPieChart items={categorySpendingReport} isLoading={reportsLoading} />
        </ReportPanel>

        <ReportPanel
          title="Income vs expense trend"
          subtitle="Day-wise trend for the current month, including running balance."
        >
          <IncomeExpenseLineChart items={dailyReport} isLoading={reportsLoading} type="all" />
        </ReportPanel>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <ReportPanel
          title="Recent transactions"
          subtitle="Latest activity across active accounts."
        >
          <div className="dashboard-list">
            {transactionsLoading ? <div className="empty-state">Loading recent transactions...</div> : null}
            {!transactionsLoading && recentTransactions.length === 0 ? (
              <div className="empty-state">No transactions found yet.</div>
            ) : null}
            {recentTransactions.map((transaction) => (
              <article key={transaction.id} className="dashboard-list-item">
                <div>
                  <strong>{transaction.merchant || transaction.categoryName}</strong>
                  <span>{transaction.accountName}</span>
                </div>
                <div className="dashboard-list-item-meta">
                  <strong
                    className={
                      transaction.type === 'income'
                        ? 'dashboard-amount dashboard-amount-positive'
                        : 'dashboard-amount dashboard-amount-negative'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </strong>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </article>
            ))}
            <Link to="/transactions" className="dashboard-link">
              View all transactions
            </Link>
          </div>
        </ReportPanel>

        <ReportPanel
          title="Upcoming bills"
          subtitle="Next recurring expense runs from your configured recurring items."
        >
          <div className="dashboard-list">
            {recurringLoading ? <div className="empty-state">Loading upcoming bills...</div> : null}
            {!recurringLoading && upcomingBills.length === 0 ? (
              <div className="empty-state">No upcoming recurring bills found.</div>
            ) : null}
            {upcomingBills.map((item) => (
              <article key={item.id} className="dashboard-list-item">
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.frequency}</span>
                </div>
                <div className="dashboard-list-item-meta">
                  <strong className="dashboard-amount dashboard-amount-negative">
                    {formatCurrency(item.amount)}
                  </strong>
                  <span>{formatDate(item.nextRunDate)}</span>
                </div>
              </article>
            ))}
            <Link to="/recurring" className="dashboard-link">
              Manage recurring items
            </Link>
          </div>
        </ReportPanel>
      </div>
    </section>
  )
}

export default DashboardPage
