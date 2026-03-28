import type { NetWorthPoint } from '../../types/report'

type NetWorthTrendChartProps = {
  items: NetWorthPoint[]
  isLoading: boolean
}

const CHART_WIDTH = 760
const CHART_HEIGHT = 280
const PADDING = { top: 18, right: 18, bottom: 42, left: 50 }

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function NetWorthTrendChart({ items, isLoading }: NetWorthTrendChartProps) {
  if (isLoading) {
    return <div className="empty-state">Loading net worth trend...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No net worth data available.</div>
  }

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const minValue = Math.min(...items.map((item) => item.netWorth), 0)
  const maxValue = Math.max(...items.map((item) => item.netWorth), 1)
  const valueRange = Math.max(maxValue - minValue, 1)

  const points = items.map((item, index) => {
    const x = PADDING.left + (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)
    const y = PADDING.top + innerHeight - ((item.netWorth - minValue) / valueRange) * innerHeight
    return { ...item, x, y }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING.bottom} L ${points[0].x} ${CHART_HEIGHT - PADDING.bottom} Z`

  return (
    <div className="line-chart-wrap">
      <svg className="line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Net worth tracking chart">
        <defs>
          <linearGradient id="net-worth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(37, 176, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(37, 176, 255, 0.04)" />
          </linearGradient>
        </defs>

        {Array.from({ length: 5 }, (_, index) => {
          const y = PADDING.top + (innerHeight / 4) * index
          const tickValue = maxValue - (valueRange / 4) * index
          return (
            <g key={index}>
              <line x1={PADDING.left} y1={y} x2={CHART_WIDTH - PADDING.right} y2={y} className="chart-grid-line" />
              <text x={8} y={y + 4} className="chart-axis-text">
                {formatCurrencyCompact(tickValue)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#net-worth-fill)" />
        <path d={linePath} className="chart-line chart-line-forecast" />

        {points.map((point) => (
          <g key={point.periodKey}>
            <circle cx={point.x} cy={point.y} r={5} className="chart-point chart-point-forecast">
              <title>{`${point.periodLabel}: ${point.netWorth.toFixed(2)}`}</title>
            </circle>
            <text x={point.x} y={CHART_HEIGHT - 12} textAnchor="middle" className="chart-axis-text">
              {point.periodLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default NetWorthTrendChart
