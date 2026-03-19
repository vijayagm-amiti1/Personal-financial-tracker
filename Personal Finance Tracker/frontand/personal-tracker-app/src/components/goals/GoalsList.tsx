import type { DevGoal } from '../../types/report'

type GoalsListProps = {
  goals: DevGoal[]
  onContribute: (goalId: string) => void
  onDelete: (goalId: string) => Promise<void>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function GoalsList({ goals, onContribute, onDelete }: GoalsListProps) {
  if (goals.length === 0) {
    return <div className="empty-state">No goals yet. Create your first goal to start tracking progress.</div>
  }

  return (
    <div className="goals-grid">
      {goals.map((goal) => {
        const achievedPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)

        return (
          <article key={goal.id} className="goal-card">
            <div className="goal-card-header">
              <div>
                <h3>{goal.name}</h3>
                <p>Due {goal.targetDate || 'No date'}</p>
              </div>
              <span className={`goal-status goal-status-${goal.status}`}>{goal.status}</span>
            </div>

            <div className="goal-card-metrics">
              <strong>{formatCurrency(goal.currentAmount)}</strong>
              <span>Target {formatCurrency(goal.targetAmount)}</span>
            </div>

            <div className="goal-progress-track" aria-hidden="true">
              <div className="goal-progress-fill" style={{ width: `${achievedPercent}%` }} />
            </div>

            <div className="goal-card-footer">
              <span>{achievedPercent.toFixed(1)}% achieved</span>
              <div className="table-actions">
                <button type="button" className="table-action-button" onClick={() => onContribute(goal.id)}>
                  Add contribution
                </button>
                <button
                  type="button"
                  className="table-action-button table-action-danger"
                  onClick={() => void onDelete(goal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default GoalsList
