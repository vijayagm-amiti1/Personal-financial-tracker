import type { CategoryTrendSeries } from '../../types/report'

type CategoryTrendChartProps = {
  items: CategoryTrendSeries[]
  isLoading: boolean
}

const CHART_WIDTH = 760
const CHART_HEIGHT = 280
const PADDING = { top: 18, right: 24, bottom: 42, left: 48 }
const SERIES_COLORS = ['#2f7df6', '#21b86f', '#f0a21a', '#8b5cf6', '#ef6c5b']

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function CategoryTrendChart({ items, isLoading }: CategoryTrendChartProps) {
  if (isLoading) {
    return <div className="empty-state">Loading category trends...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No category trend data available for this range.</div>
  }

  const periods = items[0]?.points ?? []
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const maxValue = Math.max(...items.flatMap((series) => series.points.map((point) => point.expense)), 1)

  if (periods.length <= 1) {
    const singlePeriodLabel = periods[0]?.periodLabel ?? 'Selected period'
    const maxBarValue = Math.max(...items.map((series) => series.points[0]?.expense ?? 0), 1)

    return (
      <div className="line-chart-wrap">
        <div className="chart-legend">
          {items.map((series, index) => (
            <span key={series.categoryId} className="legend-item">
              <span className="legend-swatch" style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
              {series.categoryName}
            </span>
          ))}
        </div>

        <div className="category-trend-single-period">
          <div className="category-trend-single-period-header">
            <strong>{singlePeriodLabel}</strong>
            <span>Category spend from recorded transactions in this period</span>
          </div>

          <div className="category-trend-bar-list">
            {items.map((series, index) => {
              const value = series.points[0]?.expense ?? 0
              const width = `${Math.max((value / maxBarValue) * 100, value > 0 ? 8 : 0)}%`

              return (
                <article key={series.categoryId} className="category-trend-bar-row">
                  <div className="category-trend-bar-meta">
                    <span className="category-trend-bar-label">
                      <span
                        className="category-trend-bar-dot"
                        style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }}
                      />
                      {series.categoryName}
                    </span>
                    <strong>{formatCurrency(value)}</strong>
                  </div>

                  <div className="category-trend-bar-track" aria-hidden="true">
                    <span
                      className="category-trend-bar-fill"
                      style={{
                        width,
                        background: SERIES_COLORS[index % SERIES_COLORS.length],
                      }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="line-chart-wrap">
      <div className="chart-legend">
        {items.map((series, index) => (
          <span key={series.categoryId} className="legend-item">
            <span className="legend-swatch" style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
            {series.categoryName}
          </span>
        ))}
      </div>
      <svg className="line-chart" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Category spending trends chart">
        {Array.from({ length: 5 }, (_, index) => {
          const y = PADDING.top + (innerHeight / 4) * index
          const tickValue = maxValue - (maxValue / 4) * index

          return (
            <g key={index}>
              <line x1={PADDING.left} y1={y} x2={CHART_WIDTH - PADDING.right} y2={y} className="chart-grid-line" />
              <text x={8} y={y + 4} className="chart-axis-text">
                {formatCurrencyCompact(Math.max(tickValue, 0))}
              </text>
            </g>
          )
        })}

        {items.map((series, seriesIndex) => {
          const points = series.points.map((point, index) => {
            const x = PADDING.left + (index / (periods.length - 1)) * innerWidth
            const y = PADDING.top + innerHeight - (point.expense / Math.max(maxValue, 1)) * innerHeight
            return { ...point, x, y }
          })

          const path = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ')

          return (
            <g key={series.categoryId}>
              <path
                d={path}
                className="chart-line"
                style={{ stroke: SERIES_COLORS[seriesIndex % SERIES_COLORS.length] }}
              />
              {points.map((point) => (
                <circle
                  key={`${series.categoryId}-${point.periodKey}`}
                  cx={point.x}
                  cy={point.y}
                  r={4.6}
                  className="chart-point"
                  style={{ fill: SERIES_COLORS[seriesIndex % SERIES_COLORS.length] }}
                >
                  <title>{`${series.categoryName} · ${point.periodLabel}: ${formatCurrency(point.expense)}`}</title>
                </circle>
              ))}
            </g>
          )
        })}

        {periods.map((point, index) => {
          const x = PADDING.left + (index / (periods.length - 1)) * innerWidth
          return (
            <text key={point.periodKey} x={x} y={CHART_HEIGHT - 12} textAnchor="middle" className="chart-axis-text">
              {point.periodLabel}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export default CategoryTrendChart
