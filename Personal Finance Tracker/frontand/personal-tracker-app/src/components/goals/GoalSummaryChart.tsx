import type { DevGoal } from '../../types/report'

type GoalSummaryChartProps = {
  goals: DevGoal[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function GoalSummaryChart({ goals }: GoalSummaryChartProps) {
  if (goals.length === 0) {
    return <div className="empty-state">No goals available for the current user.</div>
  }

  const highestTarget = Math.max(...goals.map((goal) => goal.targetAmount), 1)

  return (
    <div className="goal-chart">
      {goals.map((goal) => {
        const achievedPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        return (
          <article key={goal.id} className="goal-chart-row">
            <div className="goal-chart-copy">
              <strong>{goal.name}</strong>
              <span>
                {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <div className="goal-chart-bars">
              <div className="goal-chart-track" aria-hidden="true">
                <div
                  className="goal-chart-fill"
                  style={{ width: `${(goal.targetAmount / highestTarget) * 100}%` }}
                />
              </div>
              <div className="goal-progress-track" aria-hidden="true">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${achievedPercent}%` }}
                />
              </div>
            </div>
            <span className="goal-percentage">{achievedPercent.toFixed(1)}%</span>
          </article>
        )
      })}
    </div>
  )
}

export default GoalSummaryChart
