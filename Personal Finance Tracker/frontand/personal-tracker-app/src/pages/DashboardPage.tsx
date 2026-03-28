import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import CategorySpendingPieChart from '../components/reports/CategorySpendingPieChart'
import FinancialHealthScoreCard from '../components/reports/FinancialHealthScoreCard'
import ForecastBalanceChart from '../components/reports/ForecastBalanceChart'
import IncomeExpenseLineChart from '../components/reports/IncomeExpenseLineChart'
import ReportPanel from '../components/reports/ReportPanel'
import SummaryCard from '../components/reports/SummaryCard'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useFinancialHealthData from '../hooks/useFinancialHealthData'
import useForecastData from '../hooks/useForecastData'
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
  const {
    monthSummary: forecastSummary,
    dailyPoints: forecastDailyPoints,
    isLoading: forecastLoading,
    error: forecastError,
  } = useForecastData()
  const {
    score: financialHealthScore,
    isLoading: financialHealthLoading,
    error: financialHealthError,
  } = useFinancialHealthData()

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
  const forecastDelta = useMemo(() => {
    if (!forecastSummary) {
      return { absolute: 0, percent: 0 }
    }

    const absolute = forecastSummary.projectedEndBalance - forecastSummary.currentBalance
    const percent =
      forecastSummary.currentBalance !== 0
        ? (absolute / Math.abs(forecastSummary.currentBalance)) * 100
        : 0

    return { absolute, percent }
  }, [forecastSummary])

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

  const recurringMonthSummary = useMemo(() => {
    const monthPrefix = currentDate.toISOString().slice(0, 7)
    const thisMonthItems = recurringItems.filter((item) => item.nextRunDate.startsWith(monthPrefix))
    const expenseTotal = thisMonthItems
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    const incomeTotal = thisMonthItems
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)

    return {
      total: thisMonthItems.length,
      expenseTotal,
      incomeTotal,
    }
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

      <div className="summary-grid" data-tour="dashboard-summary-cards">
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
        <SummaryCard
          title="Projected month end"
          value={forecastSummary?.projectedEndBalance ?? 0}
          tone={forecastSummary?.negativeBalanceLikely ? 'negative' : 'neutral'}
          label={forecastSummary?.riskMessage ?? 'Forecast based on current balance and known activity'}
          isLoading={forecastLoading}
        />
        <SummaryCard
          title="Safe to spend"
          value={forecastSummary?.safeToSpend ?? 0}
          tone={
            forecastSummary?.insufficientForRecurringPayments
              ? 'negative'
              : (forecastSummary?.safeToSpend ?? 0) > 0
                ? 'positive'
                : 'warning'
          }
          label={
            forecastSummary
              ? forecastSummary.insufficientForRecurringPayments
                ? forecastSummary.recurringPaymentAlert
                : `${formatCurrency(forecastSummary.safeToSpendPerDay)} per day for the rest of the month`
              : 'Estimated remaining spending cushion'
          }
          isLoading={forecastLoading}
        />
      </div>

      <div data-tour="dashboard-health-score">
        <ReportPanel
          title="Financial health"
          subtitle="Weighted score across savings rate, budget adherence, cash buffer, and expense stability."
        >
          <FinancialHealthScoreCard
            score={financialHealthScore}
            isLoading={financialHealthLoading}
            error={financialHealthError}
          />
        </ReportPanel>
      </div>

      <div data-tour="dashboard-forecast-panel">
        <ReportPanel
          title="Cash flow forecast"
          subtitle="Balance trend from the last 3 months or account start date through this month end, using current balance, recurring payments, and average non-recurring expense."
        >
          <div className="forecast-panel">
          {forecastSummary ? (
            <div className="forecast-hero">
              <div className="forecast-hero-copy">
                <span className="forecast-hero-kicker">Projected month-end balance</span>
                <strong>{formatCurrency(forecastSummary.projectedEndBalance)}</strong>
                <div className="forecast-hero-meta">
                  <span>
                    Current balance {formatCurrency(forecastSummary.currentBalance)}
                  </span>
                  <span
                    className={
                      forecastDelta.absolute >= 0
                        ? 'forecast-delta forecast-delta-positive'
                        : 'forecast-delta forecast-delta-negative'
                    }
                  >
                    {forecastDelta.absolute >= 0 ? '▲' : '▼'} {Math.abs(forecastDelta.percent).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="forecast-hero-side">
                <span>Safe to spend</span>
                <strong>{formatCurrency(forecastSummary.safeToSpend)}</strong>
                <small>
                  {forecastSummary.insufficientForRecurringPayments
                    ? forecastSummary.recurringPaymentAlert
                    : `${formatCurrency(forecastSummary.safeToSpendPerDay)} per day`}
                </small>
              </div>
            </div>
          ) : null}

          <div className="forecast-summary-bar">
            <div className="forecast-summary-chip">
              <span>Average daily expense</span>
              <strong>{formatCurrency(forecastSummary?.averageDailyExpense ?? 0)}</strong>
            </div>
            <div className="forecast-summary-chip">
              <span>Upcoming recurring outflow</span>
              <strong>{formatCurrency(forecastSummary?.upcomingRecurringExpense ?? 0)}</strong>
            </div>
            <div className="forecast-summary-chip">
              <span>Upcoming recurring inflow</span>
              <strong>{formatCurrency(forecastSummary?.upcomingRecurringIncome ?? 0)}</strong>
            </div>
          </div>

          {forecastError ? (
            <div className="report-error" role="alert">
              <strong>Unable to load forecast.</strong>
              <span>{forecastError}</span>
            </div>
          ) : null}

          <ForecastBalanceChart items={forecastDailyPoints} isLoading={forecastLoading} />

          {!forecastLoading && forecastSummary ? (
            <div className="forecast-insights">
              <div className="forecast-alert-stack">
                <div
                  className={
                    forecastSummary.insufficientForRecurringPayments
                      ? 'forecast-alert forecast-alert-danger'
                      : 'forecast-alert'
                  }
                >
                  <strong>Recurring coverage</strong>
                  <span>{forecastSummary.recurringPaymentAlert}</span>
                </div>
                <div className={forecastSummary.negativeBalanceLikely ? 'forecast-alert forecast-alert-danger' : 'forecast-alert'}>
                  <strong>{forecastSummary.negativeBalanceLikely ? 'Risk warning' : 'Forecast status'}</strong>
                  <span>{forecastSummary.riskMessage}</span>
                </div>
              </div>

              <div className="forecast-actions">
                <Link to="/recurring#this-month-recurring" className="dashboard-link">
                  View this month recurring
                </Link>
              </div>
            </div>
          ) : null}
          </div>
        </ReportPanel>
      </div>

      <div className="dashboard-grid dashboard-grid-primary">
        <div data-tour="dashboard-category-spending">
          <ReportPanel
            title="Spending by category"
            subtitle="Current month expense mix across all active accounts."
          >
            <CategorySpendingPieChart items={categorySpendingReport} isLoading={reportsLoading} />
          </ReportPanel>
        </div>

        <div data-tour="dashboard-income-expense">
          <ReportPanel
            title="Income vs expense trend"
            subtitle="Day-wise trend for the current month, including running balance."
          >
            <IncomeExpenseLineChart items={dailyReport} isLoading={reportsLoading} type="all" />
          </ReportPanel>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <div data-tour="dashboard-recent-transactions">
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
        </div>

        <div data-tour="dashboard-recurring-summary">
          <ReportPanel
            title="This month recurring"
            subtitle="Open the monthly recurring view for clear dates, amounts, done vs balance count, and the graph."
          >
            <div className="dashboard-list">
            {recurringLoading ? <div className="empty-state">Loading this month recurring...</div> : null}
            {!recurringLoading ? (
              <article className="dashboard-list-item dashboard-list-item-compact">
                <div>
                  <strong>{recurringMonthSummary.total} recurring entries in this month</strong>
                  <span>
                    Outflow {formatCurrency(recurringMonthSummary.expenseTotal)} · Inflow {formatCurrency(recurringMonthSummary.incomeTotal)}
                  </span>
                </div>
              </article>
            ) : null}
            <Link to="/recurring#this-month-recurring" className="dashboard-link">
              View this month recurring
            </Link>
            </div>
          </ReportPanel>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
