import type { TrendMetricPoint } from '../../types/report'

type IncomeExpenseTrendChartProps = {
  items: TrendMetricPoint[]
  isLoading: boolean
}

const CHART_WIDTH = 760
const CHART_HEIGHT = 300
const PADDING = { top: 16, right: 16, bottom: 44, left: 48 }

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function getBarY(value: number, maxValue: number) {
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  return PADDING.top + innerHeight - (value / Math.max(maxValue, 1)) * innerHeight
}

function getLineY(value: number, minValue: number, maxValue: number) {
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const range = Math.max(maxValue - minValue, 1)
  return PADDING.top + innerHeight - ((value - minValue) / range) * innerHeight
}

function IncomeExpenseTrendChart({ items, isLoading }: IncomeExpenseTrendChartProps) {
  if (isLoading) {
    return <div className="empty-state">Loading income and expense trends...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No trend data available for the selected range.</div>
  }

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const maxAmount = Math.max(...items.flatMap((item) => [item.income, item.expense]), 1)
  const minSavingsRate = Math.min(...items.map((item) => item.savingsRate), 0)
  const maxSavingsRate = Math.max(...items.map((item) => item.savingsRate), 1)
  const groupWidth = innerWidth / items.length
  const barWidth = Math.min(24, groupWidth / 3)
  const savingsRatePath = items
    .map((item, index) => {
      const x = PADDING.left + groupWidth * index + groupWidth / 2
      const y = getLineY(item.savingsRate, minSavingsRate, maxSavingsRate)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="line-chart-wrap">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-income" />
          Income
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-expense" />
          Expense
        </span>
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-forecast" />
          Savings rate
        </span>
      </div>

      <svg className="line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Income vs expense over months">
        {Array.from({ length: 5 }, (_, index) => {
          const y = PADDING.top + ((CHART_HEIGHT - PADDING.top - PADDING.bottom) / 4) * index
          const tickValue = maxAmount - (maxAmount / 4) * index

          return (
            <g key={index}>
              <line x1={PADDING.left} y1={y} x2={CHART_WIDTH - PADDING.right} y2={y} className="chart-grid-line" />
              <text x={8} y={y + 4} className="chart-axis-text">
                {formatCurrencyCompact(Math.max(tickValue, 0))}
              </text>
            </g>
          )
        })}

        {items.map((item, index) => {
          const groupX = PADDING.left + groupWidth * index
          const incomeY = getBarY(item.income, maxAmount)
          const expenseY = getBarY(item.expense, maxAmount)
          const xCenter = groupX + groupWidth / 2
          const savingsY = getLineY(item.savingsRate, minSavingsRate, maxSavingsRate)

          return (
            <g key={item.periodKey}>
              <rect
                x={xCenter - barWidth - 4}
                y={incomeY}
                width={barWidth}
                height={CHART_HEIGHT - PADDING.bottom - incomeY}
                rx={8}
                className="chart-bar chart-bar-income"
              >
                <title>{`${item.periodLabel}: Income ${item.income.toFixed(2)}`}</title>
              </rect>
              <rect
                x={xCenter + 4}
                y={expenseY}
                width={barWidth}
                height={CHART_HEIGHT - PADDING.bottom - expenseY}
                rx={8}
                className="chart-bar chart-bar-expense"
              >
                <title>{`${item.periodLabel}: Expense ${item.expense.toFixed(2)}`}</title>
              </rect>
              <circle cx={xCenter} cy={savingsY} r={4} className="chart-point chart-point-balance">
                <title>{`${item.periodLabel}: Savings rate ${formatPercent(item.savingsRate)}`}</title>
              </circle>
              <text x={xCenter} y={CHART_HEIGHT - 12} textAnchor="middle" className="chart-axis-text">
                {item.periodLabel}
              </text>
            </g>
          )
        })}

        <path d={savingsRatePath} className="chart-line chart-line-balance" />
      </svg>
    </div>
  )
}

export default IncomeExpenseTrendChart
