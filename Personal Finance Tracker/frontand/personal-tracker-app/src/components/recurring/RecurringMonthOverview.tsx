import { useMemo } from 'react'
import type { RecurringRecord } from '../../types/recurring'
import type { TransactionRecord } from '../../types/transaction'

type RecurringMonthOverviewProps = {
  items: RecurringRecord[]
  transactions: TransactionRecord[]
  isLoading: boolean
}

type ScheduledOccurrence = {
  key: string
  title: string
  type: 'income' | 'expense'
  amount: number
  date: string
  frequency: RecurringRecord['frequency']
  status: 'done' | 'upcoming'
}

const CHART_WIDTH = 760
const CHART_HEIGHT = 260
const PADDING = { top: 24, right: 18, bottom: 36, left: 44 }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function advanceByFrequency(date: Date, frequency: RecurringRecord['frequency']) {
  const next = new Date(date)

  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1)
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
  } else {
    next.setFullYear(next.getFullYear() + 1)
  }

  return next
}

function buildOccurrences(items: RecurringRecord[], todayIso: string) {
  const today = parseIsoDate(todayIso)
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const occurrences: ScheduledOccurrence[] = []

  items.forEach((item) => {
    let cursor = parseIsoDate(item.startDate)
    const endDate = item.endDate ? parseIsoDate(item.endDate) : null

    while (cursor < monthStart) {
      const nextCursor = advanceByFrequency(cursor, item.frequency)
      if (nextCursor.getTime() === cursor.getTime()) {
        break
      }
      cursor = nextCursor
    }

    while (cursor <= monthEnd && (!endDate || cursor <= endDate)) {
      if (cursor >= monthStart) {
        const date = toIsoDate(cursor)
        occurrences.push({
          key: `${item.id}-${date}`,
          title: item.title,
          type: item.type,
          amount: item.amount,
          date,
          frequency: item.frequency,
          status: date <= todayIso ? 'done' : 'upcoming',
        })
      }

      const nextCursor = advanceByFrequency(cursor, item.frequency)
      if (nextCursor.getTime() === cursor.getTime()) {
        break
      }
      cursor = nextCursor
    }
  })

  return occurrences.sort((left, right) => left.date.localeCompare(right.date))
}

function getY(value: number, maxValue: number) {
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  return PADDING.top + innerHeight - (value / Math.max(maxValue, 1)) * innerHeight
}

function RecurringMonthOverview({
  items,
  transactions,
  isLoading,
}: RecurringMonthOverviewProps) {
  const todayIso = new Date().toISOString().slice(0, 10)

  const {
    occurrences,
    doneCount,
    upcomingCount,
    scheduledTotal,
    doneTotal,
    upcomingTotal,
    processedTransactionsCount,
    processedTransactionsTotal,
    chartPoints,
    todayIndex,
  } = useMemo(() => {
    const recurringTransactionsThisMonth = transactions.filter((transaction) => {
      return transaction.isRecurred && transaction.date.slice(0, 7) === todayIso.slice(0, 7)
    })

    const recurringSchedule = buildOccurrences(items, todayIso)
    const done = recurringSchedule.filter((item) => item.status === 'done')
    const upcoming = recurringSchedule.filter((item) => item.status === 'upcoming')

    const monthEnd = endOfMonth(new Date())
    const dayMap = new Map<number, { day: number; done: number; upcoming: number }>()
    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      dayMap.set(day, { day, done: 0, upcoming: 0 })
    }

    recurringSchedule.forEach((item) => {
      const day = parseIsoDate(item.date).getDate()
      const entry = dayMap.get(day)
      if (!entry) {
        return
      }
      if (item.status === 'done') {
        entry.done += item.amount
      } else {
        entry.upcoming += item.amount
      }
    })

    return {
      occurrences: recurringSchedule,
      doneCount: done.length,
      upcomingCount: upcoming.length,
      scheduledTotal: recurringSchedule.reduce((sum, item) => sum + item.amount, 0),
      doneTotal: done.reduce((sum, item) => sum + item.amount, 0),
      upcomingTotal: upcoming.reduce((sum, item) => sum + item.amount, 0),
      processedTransactionsCount: recurringTransactionsThisMonth.length,
      processedTransactionsTotal: recurringTransactionsThisMonth.reduce((sum, item) => sum + item.amount, 0),
      chartPoints: Array.from(dayMap.values()),
      todayIndex: Math.max(0, new Date().getDate() - 1),
    }
  }, [items, todayIso, transactions])

  if (isLoading) {
    return <div className="empty-state">Loading this month recurring view...</div>
  }

  const maxValue = Math.max(1, ...chartPoints.map((point) => point.done + point.upcoming))
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right

  return (
    <div className="recurring-month-overview" id="this-month-recurring">
      <div className="recurring-month-summary-grid">
        <article className="summary-card summary-card-neutral">
          <p>Scheduled this month</p>
          <strong>{occurrences.length}</strong>
          <span>{formatCurrency(scheduledTotal)} planned in total.</span>
        </article>
        <article className="summary-card summary-card-positive">
          <p>Done in this month</p>
          <strong>{doneCount}</strong>
          <span>{formatCurrency(doneTotal)} already crossed due date.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Balance this month</p>
          <strong>{upcomingCount}</strong>
          <span>{formatCurrency(upcomingTotal)} still upcoming.</span>
        </article>
        <article className="summary-card summary-card-neutral">
          <p>Processed transactions</p>
          <strong>{processedTransactionsCount}</strong>
          <span>{formatCurrency(processedTransactionsTotal)} created by recurring jobs.</span>
        </article>
      </div>

      <div className="recurring-month-layout">
        <section className="recurring-month-chart-card">
          <div className="recurring-month-heading">
            <div>
              <h3>This month recurring</h3>
              <p>Done vs upcoming recurring amount across the current month.</p>
            </div>
            <div className="recurring-month-legend">
              <span><i className="recurring-legend-dot recurring-legend-dot-done" />Done</span>
              <span><i className="recurring-legend-dot recurring-legend-dot-upcoming" />Upcoming</span>
            </div>
          </div>

          <div className="recurring-month-chart-wrap">
            <svg
              className="recurring-month-chart"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              role="img"
              aria-label="Recurring amount chart for this month"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const tickValue = (maxValue / 4) * (4 - index)
                const y = PADDING.top + ((CHART_HEIGHT - PADDING.top - PADDING.bottom) / 4) * index
                return (
                  <g key={index}>
                    <line
                      x1={PADDING.left}
                      y1={y}
                      x2={CHART_WIDTH - PADDING.right}
                      y2={y}
                      className="chart-grid-line"
                    />
                    <text x={10} y={y + 4} className="chart-axis-text">
                      {formatCurrency(tickValue)}
                    </text>
                  </g>
                )
              })}

              {chartPoints.map((point, index) => {
                const x = PADDING.left + (index / Math.max(chartPoints.length - 1, 1)) * innerWidth
                return (
                  <g key={point.day}>
                    {index === todayIndex ? (
                      <>
                        <line
                          x1={x}
                          y1={PADDING.top}
                          x2={x}
                          y2={CHART_HEIGHT - PADDING.bottom}
                          className="chart-vertical-guide-today"
                        />
                        <text x={x} y={PADDING.top - 6} textAnchor="middle" className="chart-today-label">
                          Today
                        </text>
                      </>
                    ) : null}
                    {point.day === 1 || point.day === chartPoints.length || point.day % 5 === 0 ? (
                      <text x={x} y={CHART_HEIGHT - 8} textAnchor="middle" className="chart-axis-text">
                        {point.day}
                      </text>
                    ) : null}
                  </g>
                )
              })}

              {chartPoints.map((point, index) => {
                const x = PADDING.left + (index / Math.max(chartPoints.length - 1, 1)) * innerWidth
                const doneHeight = CHART_HEIGHT - PADDING.bottom - getY(point.done, maxValue)
                const upcomingHeight = CHART_HEIGHT - PADDING.bottom - getY(point.upcoming, maxValue)
                const barWidth = Math.max(innerWidth / Math.max(chartPoints.length, 1) - 5, 6)
                const left = x - barWidth / 2
                const doneY = CHART_HEIGHT - PADDING.bottom - doneHeight
                const upcomingY = doneY - upcomingHeight

                return (
                  <g key={`bar-${point.day}`}>
                    {point.upcoming > 0 ? (
                      <rect
                        x={left}
                        y={upcomingY}
                        width={barWidth}
                        height={upcomingHeight}
                        rx={6}
                        className="recurring-bar recurring-bar-upcoming"
                      >
                        <title>{`Day ${point.day}: Upcoming ${formatCurrency(point.upcoming)}`}</title>
                      </rect>
                    ) : null}
                    {point.done > 0 ? (
                      <rect
                        x={left}
                        y={doneY}
                        width={barWidth}
                        height={doneHeight}
                        rx={6}
                        className="recurring-bar recurring-bar-done"
                      >
                        <title>{`Day ${point.day}: Done ${formatCurrency(point.done)}`}</title>
                      </rect>
                    ) : null}
                  </g>
                )
              })}
            </svg>
          </div>
        </section>

        <section className="recurring-month-list-card">
          <div className="recurring-month-heading">
            <div>
              <h3>When they will come</h3>
              <p>Month schedule with clear dates and amounts.</p>
            </div>
          </div>

          <div className="recurring-month-schedule">
            {occurrences.length === 0 ? (
              <div className="empty-state">No recurring entries are scheduled in this month.</div>
            ) : (
              occurrences.map((item) => (
                <article key={item.key} className="recurring-month-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.frequency} · {item.status === 'done' ? 'Done in month' : 'Upcoming'}</span>
                  </div>
                  <div className="recurring-month-row-meta">
                    <strong className={item.type === 'income' ? 'dashboard-amount dashboard-amount-positive' : 'dashboard-amount dashboard-amount-negative'}>
                      {formatCurrency(item.amount)}
                    </strong>
                    <span>{formatCompactDate(item.date)}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default RecurringMonthOverview
