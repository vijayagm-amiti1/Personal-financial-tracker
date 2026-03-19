import type { DailyReport } from '../../types/report'

type IncomeExpenseLineChartProps = {
  items: DailyReport[]
  isLoading: boolean
  type: 'all' | 'income' | 'expense'
}

type BalancePoint = DailyReport & {
  balance: number
}

const CHART_WIDTH = 720
const CHART_HEIGHT = 280
const PADDING = { top: 20, right: 18, bottom: 34, left: 44 }

function buildLinePath<T extends DailyReport | BalancePoint>(
  items: T[],
  valueSelector: (item: T) => number,
  maxValue: number,
) {
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  return items
    .map((item, index) => {
      const x =
        PADDING.left +
        (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)
      const y =
        PADDING.top +
        innerHeight -
        (valueSelector(item) / Math.max(maxValue, 1)) * innerHeight

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function formatCurrencyTick(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value)
}

function buildBalanceSeries(items: DailyReport[]): BalancePoint[] {
  let runningBalance = 0

  return items.map((item) => {
    runningBalance += item.income - item.expense

    return {
      ...item,
      balance: runningBalance,
    }
  })
}

function IncomeExpenseLineChart({
  items,
  isLoading,
  type,
}: IncomeExpenseLineChartProps) {
  if (isLoading) {
    return <div className="empty-state">Loading income and outgoing trend...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No chart data available for the selected month.</div>
  }

  const balanceSeries = buildBalanceSeries(items)
  const maxValue = Math.max(
    ...balanceSeries.flatMap((item) => [item.income, item.expense, item.balance]),
    1,
  )
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const yAxisTicks = Array.from({ length: 5 }, (_, index) =>
    Math.round((maxValue / 4) * (4 - index)),
  )

  const incomePath = buildLinePath(items, (item) => item.income, maxValue)
  const expensePath = buildLinePath(items, (item) => item.expense, maxValue)
  const balancePath = buildLinePath(
    balanceSeries,
    (item) => item.balance,
    maxValue,
  )

  return (
    <div className="line-chart-wrap">
      <div className="chart-legend">
        {(type === 'all' || type === 'income') ? (
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-income" />
            Income
          </span>
        ) : null}
        {(type === 'all' || type === 'expense') ? (
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-expense" />
            Outgoing
          </span>
        ) : null}
        {type === 'all' ? (
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-balance" />
            Current balance
          </span>
        ) : null}
      </div>

      <svg
        className="line-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Income and outgoing line chart"
      >
        {yAxisTicks.map((tick, index) => {
          const y = PADDING.top + (index / (yAxisTicks.length - 1)) * innerHeight

          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                className="chart-grid-line"
              />
              <text x={10} y={y + 4} className="chart-axis-text">
                {formatCurrencyTick(tick)}
              </text>
            </g>
          )
        })}

        {items.map((item, index) => {
          const x =
            PADDING.left +
            (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)

          return (
            <g key={`${item.accountId}-${item.day}`}>
              <line
                x1={x}
                y1={PADDING.top}
                x2={x}
                y2={CHART_HEIGHT - PADDING.bottom}
                className="chart-vertical-guide"
              />
              <text
                x={x}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="chart-axis-text"
              >
                {item.day}
              </text>
            </g>
          )
        })}

        {(type === 'all' || type === 'income') ? (
          <path d={incomePath} className="chart-line chart-line-income" />
        ) : null}
        {(type === 'all' || type === 'expense') ? (
          <path d={expensePath} className="chart-line chart-line-expense" />
        ) : null}
        {type === 'all' ? (
          <path d={balancePath} className="chart-line chart-line-balance" />
        ) : null}

        {items.map((item, index) => {
          const x =
            PADDING.left +
            (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)
          const incomeY =
            PADDING.top + innerHeight - (item.income / Math.max(maxValue, 1)) * innerHeight
          const expenseY =
            PADDING.top + innerHeight - (item.expense / Math.max(maxValue, 1)) * innerHeight
          const balanceY =
            PADDING.top +
            innerHeight -
            (balanceSeries[index].balance / Math.max(maxValue, 1)) * innerHeight

          return (
            <g key={`point-${item.accountId}-${item.day}`}>
              {(type === 'all' || type === 'income') ? (
                <circle cx={x} cy={incomeY} r={4} className="chart-point chart-point-income" />
              ) : null}
              {(type === 'all' || type === 'expense') ? (
                <circle cx={x} cy={expenseY} r={4} className="chart-point chart-point-expense" />
              ) : null}
              {type === 'all' ? (
                <circle cx={x} cy={balanceY} r={4} className="chart-point chart-point-balance" />
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default IncomeExpenseLineChart
