import { useState } from 'react'
import type { CategorySpendingReport } from '../../types/report'

type CategorySpendingPieChartProps = {
  items: CategorySpendingReport[]
  isLoading: boolean
}

const PIE_COLORS = [
  '#d14a3d',
  '#1fa971',
  '#163f8c',
  '#d88a18',
  '#7c3aed',
  '#0f766e',
  '#db2777',
  '#475569',
]

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function getSliceCenter(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const middleAngle = startAngle + (endAngle - startAngle) / 2
  return polarToCartesian(centerX, centerY, radius, middleAngle)
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function CategorySpendingPieChart({
  items,
  isLoading,
}: CategorySpendingPieChartProps) {
  const [activeSlice, setActiveSlice] = useState<{
    categoryName: string
    percentage: string
    x: number
    y: number
  } | null>(null)

  if (isLoading) {
    return <div className="empty-state">Loading category spending...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No category expenses found for this month.</div>
  }

  const totalExpense = items.reduce((sum, item) => sum + item.expense, 0)
  let currentAngle = 0

  return (
    <div className="pie-chart-layout">
      <div className="pie-chart-frame">
        {activeSlice ? (
          <div
            className="pie-chart-tooltip"
            role="status"
            style={{
              left: `${(activeSlice.x / 280) * 100}%`,
              top: `${(activeSlice.y / 280) * 100}%`,
            }}
          >
            {activeSlice.categoryName}: {activeSlice.percentage}%
          </div>
        ) : null}

        <svg
          className="pie-chart"
          viewBox="0 0 280 280"
          role="img"
          aria-label="Category spending pie chart"
        >
          {items.map((item, index) => {
            const sliceAngle = totalExpense === 0 ? 0 : (item.expense / totalExpense) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + sliceAngle
            currentAngle = endAngle
            const percentage = totalExpense === 0 ? 0 : (item.expense / totalExpense) * 100
            const sliceCenter = getSliceCenter(140, 140, 78, startAngle, endAngle)

            return (
              <path
                key={item.categoryId}
                d={describeArc(140, 140, 100, startAngle, endAngle)}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
                onMouseEnter={() =>
                  setActiveSlice({
                    categoryName: item.categoryName,
                    percentage: percentage.toFixed(2),
                    x: sliceCenter.x,
                    y: sliceCenter.y,
                  })
                }
                onMouseLeave={() => setActiveSlice(null)}
              />
            )
          })}
          <circle cx="140" cy="140" r="54" fill="#ffffff" />
          <text x="140" y="128" textAnchor="middle" className="pie-chart-total-label">
            Total
          </text>
          <text x="140" y="152" textAnchor="middle" className="pie-chart-total-value">
            {formatCurrency(totalExpense)}
          </text>
        </svg>
      </div>

      <div className="pie-chart-legend">
        {items.map((item, index) => (
          <div key={item.categoryId} className="pie-legend-row">
            <div className="pie-legend-label">
              <span
                className="pie-legend-swatch"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <strong>{item.categoryName}</strong>
            </div>
            <span>{formatCurrency(item.expense)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategorySpendingPieChart
