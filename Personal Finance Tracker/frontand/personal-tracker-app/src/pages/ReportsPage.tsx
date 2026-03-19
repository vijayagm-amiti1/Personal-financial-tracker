import { useMemo, useState } from 'react'
import type {
  CategorySpendingReport,
  DailyReport,
  ReportFilters,
} from '../types/report'
import FilterBar from '../components/reports/FilterBar'
import ReportPanel from '../components/reports/ReportPanel'
import SummaryCard from '../components/reports/SummaryCard'
import DailyReportTable from '../components/reports/DailyReportTable'
import CategorySpendingPieChart from '../components/reports/CategorySpendingPieChart'
import IncomeExpenseLineChart from '../components/reports/IncomeExpenseLineChart'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import useReportsData from '../hooks/useReportsData'
import { ALL_ACCOUNTS_VALUE } from '../utils/devStorage'

function getTotals(dailyReport: DailyReport[]) {
  return dailyReport.reduce(
    (accumulator, item) => {
      accumulator.income += item.income
      accumulator.expense += item.expense
      return accumulator
    },
    { income: 0, expense: 0 },
  )
}

function getTopCategory(
  categorySpendingReport: CategorySpendingReport[],
): CategorySpendingReport | null {
  if (categorySpendingReport.length === 0) {
    return null
  }

  return [...categorySpendingReport].sort((left, right) => right.expense - left.expense)[0]
}

function ReportsPage() {
  const { activeAccounts } = useDevelopmentBootstrap()
  const [filters, setFilters] = useState<ReportFilters>({
    accountId: ALL_ACCOUNTS_VALUE,
    month: 3,
    year: 2026,
    type: 'all',
  })
  const { dailyReport, categorySpendingReport, isLoading, error, reload } =
    useReportsData(filters, activeAccounts)

  const totals = useMemo(() => getTotals(dailyReport), [dailyReport])
  const topCategory = useMemo(
    () => getTopCategory(categorySpendingReport),
    [categorySpendingReport],
  )

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h2>Monthly account reports</h2>
        </div>
        <p className="page-description">
          Review daily income and expense movement, then scan the highest-spend
          categories for the same account and month.
        </p>
      </header>

      <FilterBar
        filters={filters}
        accounts={activeAccounts}
        onChange={setFilters}
        onReload={reload}
      />

      {error ? (
        <div className="report-error" role="alert">
          <strong>Unable to load report data.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="summary-grid">
        <SummaryCard
          title="Monthly income"
          value={totals.income}
          tone="positive"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Monthly expense"
          value={totals.expense}
          tone="negative"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Net movement"
          value={totals.income - totals.expense}
          tone="neutral"
          isLoading={isLoading}
        />
        <SummaryCard
          title="Top spend category"
          value={topCategory?.expense ?? 0}
          tone="warning"
          label={topCategory?.categoryName ?? 'No category activity'}
          isLoading={isLoading}
        />
      </div>

      <ReportPanel
        title="Daily income vs expense"
        subtitle="Each day in the selected month for the chosen account."
      >
        <IncomeExpenseLineChart
          items={dailyReport}
          isLoading={isLoading}
          type={filters.type}
        />
      </ReportPanel>

      <ReportPanel
        title="Category spending"
        subtitle="Expense-only breakdown for the same filters."
      >
        <CategorySpendingPieChart items={categorySpendingReport} isLoading={isLoading} />
      </ReportPanel>

      <ReportPanel
        title="Daily report table"
        subtitle="Structured view for quick manual verification while testing."
      >
        <DailyReportTable items={dailyReport} isLoading={isLoading} />
      </ReportPanel>
    </section>
  )
}

export default ReportsPage
