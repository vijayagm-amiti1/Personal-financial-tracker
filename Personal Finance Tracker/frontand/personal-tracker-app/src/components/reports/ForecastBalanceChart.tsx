import { useMemo, useState } from 'react'
import type { ForecastDailyPoint } from '../../types/report'

type ForecastBalanceChartProps = {
  items: ForecastDailyPoint[]
  isLoading: boolean
}

const CHART_WIDTH = 720
const CHART_HEIGHT = 280
const PADDING = { top: 22, right: 18, bottom: 34, left: 58 }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatTick(value: number) {
  const absolute = Math.abs(value)

  if (absolute >= 100000) {
    return `${(absolute / 100000).toFixed(0)}L`
  }

  if (absolute >= 1000) {
    return `${(absolute / 1000).toFixed(0)}k`
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absolute)
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getYCoordinate(value: number, minValue: number, valueRange: number) {
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  return PADDING.top + innerHeight - ((value - minValue) / valueRange) * innerHeight
}

function buildLinePath(
  items: ForecastDailyPoint[],
  minValue: number,
  maxValue: number,
) {
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const valueRange = Math.max(maxValue - minValue, 1)

  return items
    .map((item, index) => {
      const x =
        PADDING.left +
        (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)
      const y = getYCoordinate(item.projectedBalance, minValue, valueRange)

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function buildAreaPath(
  items: ForecastDailyPoint[],
  minValue: number,
  maxValue: number,
) {
  if (items.length === 0) {
    return ''
  }

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const valueRange = Math.max(maxValue - minValue, 1)
  const baselineY = getYCoordinate(minValue, minValue, valueRange)

  const points = items.map((item, index) => {
    const x =
      PADDING.left +
      (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth)
    const y = getYCoordinate(item.projectedBalance, minValue, valueRange)
    return { x, y }
  })

  const linePart = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]

  return `${linePart} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
}

function ForecastBalanceChart({ items, isLoading }: ForecastBalanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const minValue = Math.min(0, ...items.map((item) => item.projectedBalance))
  const maxValue = Math.max(...items.map((item) => item.projectedBalance), 1)
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const valueRange = Math.max(maxValue - minValue, 1)
  const labelStep = Math.max(Math.ceil(items.length / 8), 1)
  const chartPoints = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        x:
          PADDING.left +
          (items.length === 1 ? innerWidth / 2 : (index / (items.length - 1)) * innerWidth),
        y: getYCoordinate(item.projectedBalance, minValue, valueRange),
      })),
    [items, innerWidth, minValue, valueRange],
  )
  const yAxisTicks = Array.from({ length: 6 }, (_, index) => {
    const ratio = 1 - index / 5
    return minValue + valueRange * ratio
  })
  const linePath = buildLinePath(items, minValue, maxValue)
  const areaPath = buildAreaPath(items, minValue, maxValue)
  const latestPoint = chartPoints[chartPoints.length - 1]
  const activePoint = activeIndex !== null ? chartPoints[activeIndex] : null
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayPoint = chartPoints.find(({ item }) => item.date === todayKey) ?? null
  const tooltipWidth = 126
  const tooltipHeight = 48
  const tooltipX = activePoint
    ? clamp(
        activePoint.x - tooltipWidth / 2,
        PADDING.left,
        CHART_WIDTH - PADDING.right - tooltipWidth,
      )
    : 0
  const tooltipY = activePoint
    ? Math.max(PADDING.top + 4, activePoint.y - tooltipHeight - 14)
    : 0

  if (isLoading) {
    return <div className="empty-state">Loading projected balance...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No forecast data available for this month.</div>
  }

  return (
    <div className="line-chart-wrap">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-swatch legend-swatch-forecast" />
          Projected balance
        </span>
      </div>

      <svg
        className="line-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Projected balance line chart"
      >
        <defs>
          <linearGradient id="forecastAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8ec5ff" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#8ec5ff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#8ec5ff" stopOpacity="0.01" />
          </linearGradient>
        </defs>

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
                ₹{tick < 0 ? `-${formatTick(tick)}` : formatTick(tick)}
              </text>
            </g>
          )
        })}

        {chartPoints.map(({ item, x }, index) => {
          const shouldRenderLabel = index === 0 || index === items.length - 1 || index % labelStep === 0

          return (
            <g key={item.date}>
              <line
                x1={x}
                y1={PADDING.top}
                x2={x}
                y2={CHART_HEIGHT - PADDING.bottom}
                className={shouldRenderLabel ? 'chart-vertical-guide chart-vertical-guide-soft' : 'chart-vertical-guide chart-vertical-guide-hidden'}
              />
              {shouldRenderLabel ? (
                <text x={x} y={CHART_HEIGHT - 8} textAnchor="middle" className="chart-axis-text">
                  {formatDateLabel(item.date)}
                </text>
              ) : null}
            </g>
          )
        })}

        {todayPoint ? (
          <g>
            <line
              x1={todayPoint.x}
              y1={PADDING.top}
              x2={todayPoint.x}
              y2={CHART_HEIGHT - PADDING.bottom}
              className="chart-vertical-guide chart-vertical-guide-today"
            />
            <text
              x={todayPoint.x}
              y={PADDING.top - 4}
              textAnchor="middle"
              className="chart-today-label"
            >
              Today
            </text>
          </g>
        ) : null}

        <path d={areaPath} className="chart-area chart-area-forecast" />
        <path d={linePath} className="chart-line chart-line-forecast" />

        {latestPoint ? (
          <g>
            <line
              x1={latestPoint.x}
              y1={PADDING.top}
              x2={latestPoint.x}
              y2={CHART_HEIGHT - PADDING.bottom}
              className="chart-vertical-guide chart-vertical-guide-focus"
            />
            <circle
              cx={latestPoint.x}
              cy={latestPoint.y}
              r={5}
              className="chart-point chart-point-forecast"
            >
              <title>
                {`${latestPoint.item.date}: ${formatCurrency(latestPoint.item.projectedBalance)}`}
              </title>
            </circle>
          </g>
        ) : null}

        {activePoint ? (
          <g>
            <line
              x1={activePoint.x}
              y1={PADDING.top}
              x2={activePoint.x}
              y2={CHART_HEIGHT - PADDING.bottom}
              className="chart-vertical-guide chart-vertical-guide-active"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r={6}
              className="chart-point chart-point-forecast chart-point-forecast-active"
            />
            <g transform={`translate(${tooltipX}, ${tooltipY})`} className="chart-tooltip">
              <rect width={tooltipWidth} height={tooltipHeight} rx={14} className="chart-tooltip-card" />
              <text x={12} y={19} className="chart-tooltip-title">
                {formatDateLabel(activePoint.item.date)}
              </text>
              <text x={12} y={35} className="chart-tooltip-value">
                {formatCurrency(activePoint.item.projectedBalance)}
              </text>
            </g>
          </g>
        ) : null}

        {chartPoints.map(({ item, x, y }, index) => (
          <circle
            key={`hit-${item.date}`}
            cx={x}
            cy={y}
            r={14}
            className="chart-hit-area"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
          />
        ))}
      </svg>

    </div>
  )
}

export default ForecastBalanceChart
