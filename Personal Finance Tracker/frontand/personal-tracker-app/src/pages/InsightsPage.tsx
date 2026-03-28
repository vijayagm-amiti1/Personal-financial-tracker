import { useMemo, useState } from 'react'
import CategoryTrendChart from '../components/reports/CategoryTrendChart'
import IncomeExpenseTrendChart from '../components/reports/IncomeExpenseTrendChart'
import NetWorthTrendChart from '../components/reports/NetWorthTrendChart'
import ReportPanel from '../components/reports/ReportPanel'
import SummaryCard from '../components/reports/SummaryCard'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useInsightsData from '../hooks/useInsightsData'
import type { InsightItem, InsightsFilters } from '../types/report'
import { ALL_ACCOUNTS_VALUE } from '../utils/devStorage'

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function getDefaultFilters(): InsightsFilters {
  const today = new Date()
  const from = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  return {
    accountId: ALL_ACCOUNTS_VALUE,
    categoryId: '__all_categories__',
    fromDate: formatDate(from),
    toDate: formatDate(today),
  }
}

function getInsightTone(insight?: InsightItem | null): 'positive' | 'negative' | 'neutral' | 'warning' {
  if (!insight) {
    return 'neutral'
  }
  if (insight.severity === 'positive') {
    return 'positive'
  }
  if (insight.severity === 'warning') {
    return 'warning'
  }
  return 'neutral'
}

function InsightsPage() {
  const { activeAccounts, categories } = useDevelopmentBootstrap()
  const [filters, setFilters] = useState<InsightsFilters>(() => getDefaultFilters())
  const { trends, netWorth, insights, isLoading, error, reload, allCategoriesValue } = useInsightsData(filters)

  const headlineInsight = insights?.insights[0] ?? null
  const totalIncome = useMemo(
    () => trends?.monthlySummary.reduce((sum, item) => sum + item.income, 0) ?? 0,
    [trends],
  )
  const totalExpense = useMemo(
    () => trends?.monthlySummary.reduce((sum, item) => sum + item.expense, 0) ?? 0,
    [trends],
  )

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h2>Advanced reporting and insights</h2>
        </div>
        <p className="page-description">
          Compare income, expense, savings rate, category movement, and net worth across time with readable findings.
        </p>
      </header>

      <div className="filter-bar" data-tour="insights-filter-bar">
        <label className="field">
          <span>From</span>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>To</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
          />
        </label>
        <label className="field">
          <span>Account</span>
          <select
            value={filters.accountId}
            onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value }))}
          >
            <option value={ALL_ACCOUNTS_VALUE}>All accounts</option>
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select
            value={filters.categoryId}
            onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
          >
            <option value={allCategoriesValue}>All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary-button" onClick={reload}>
          Reload
        </button>
      </div>

      {error ? (
        <div className="report-error" role="alert">
          <strong>Unable to load insights data.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="summary-grid" data-tour="insights-summary-cards">
        <SummaryCard title="Total income" value={totalIncome} tone="positive" isLoading={isLoading} />
        <SummaryCard title="Total expense" value={totalExpense} tone="negative" isLoading={isLoading} />
        <SummaryCard title="Current net worth" value={netWorth?.currentNetWorth ?? 0} tone="neutral" isLoading={isLoading} />
        <SummaryCard
          title="Current savings rate"
          value={insights?.currentSavingsRate ?? 0}
          tone={getInsightTone(headlineInsight)}
          label="Percent in latest month"
          format="percentage"
          isLoading={isLoading}
        />
      </div>

      <div className="panel-grid">
        <div data-tour="insights-income-expense-trend">
          <ReportPanel
            title="Income vs expense over months"
            subtitle="Monthly comparison with savings rate overlay."
          >
            <IncomeExpenseTrendChart items={trends?.monthlySummary ?? []} isLoading={isLoading} />
          </ReportPanel>
        </div>

        <div data-tour="insights-key-findings">
          <ReportPanel
            title="Key findings"
            subtitle="Short human-readable insights generated from your selected range."
          >
            <div className="dashboard-list">
            {isLoading ? <div className="empty-state">Loading insights...</div> : null}
            {!isLoading && (insights?.insights.length ?? 0) === 0 ? (
              <div className="empty-state">No insights available for this selection.</div>
            ) : null}
            {insights?.insights.map((insight) => (
              <article key={`${insight.type}-${insight.title}`} className={`insight-card insight-card-${insight.severity}`}>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
              </article>
            ))}
            </div>
          </ReportPanel>
        </div>
      </div>

      <div className="panel-grid">
        <div data-tour="insights-category-trends">
          <ReportPanel
            title="Category trends over time"
            subtitle="Top spending categories across the selected period."
          >
            <CategoryTrendChart items={trends?.categoryTrends ?? []} isLoading={isLoading} />
          </ReportPanel>
        </div>

        <div data-tour="insights-net-worth">
          <ReportPanel
            title="Net worth tracking"
            subtitle="End-of-period net worth based on account opening balance and transaction history."
          >
            <NetWorthTrendChart items={netWorth?.points ?? []} isLoading={isLoading} />
          </ReportPanel>
        </div>
      </div>
    </section>
  )
}

export default InsightsPage
