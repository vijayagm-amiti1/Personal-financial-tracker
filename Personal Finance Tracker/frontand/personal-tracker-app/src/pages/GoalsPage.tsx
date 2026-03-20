import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router-dom'
import GoalContributionPanel from '../components/goals/GoalContributionPanel'
import GoalsList from '../components/goals/GoalsList'
import GoalSummaryChart from '../components/goals/GoalSummaryChart'
import ReportPanel from '../components/reports/ReportPanel'
import useDevelopmentBootstrap from '../hooks/useDevelopmentBootstrap'
import type { GoalContributionValues } from '../types/goal'
import type { DevGoal } from '../types/report'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function GoalsPage() {
  const navigate = useNavigate()
  const { goals, activeAccounts, contributeToGoal, deleteGoal } = useDevelopmentBootstrap()
  const [selectedGoal, setSelectedGoal] = useState<DevGoal | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [targetDateCutoff, setTargetDateCutoff] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  const sortedGoals = useMemo(
    () => [...goals].sort((left, right) => left.targetDate.localeCompare(right.targetDate)),
    [goals],
  )

  const filteredGoals = useMemo(() => {
    if (targetDateCutoff === '') {
      return sortedGoals
    }

    return sortedGoals.filter(
      (goal) => goal.targetDate >= today && goal.targetDate <= targetDateCutoff,
    )
  }, [sortedGoals, targetDateCutoff, today])

  const totals = useMemo(() => {
    return filteredGoals.reduce(
      (accumulator, goal) => {
        accumulator.target += goal.targetAmount
        accumulator.current += goal.currentAmount
        return accumulator
      },
      { target: 0, current: 0 },
    )
  }, [filteredGoals])

  const upcomingGoals = filteredGoals.filter((goal) => goal.status !== 'completed').slice(0, 3)

  const handleContribution = async (values: GoalContributionValues) => {
    try {
      setActionError(null)
      const previousGoal = goals.find((goal) => goal.id === values.goalId) ?? null
      const updatedGoal = await contributeToGoal({
        goalId: values.goalId,
        accountId: values.accountId,
        amount: Number(values.amount),
      })
      if (previousGoal?.status !== 'completed' && updatedGoal.status === 'completed') {
        void confetti({
          particleCount: 140,
          spread: 78,
          startVelocity: 32,
          origin: { y: 0.62 },
          colors: ['#1f9d55', '#22c55e', '#f59e0b', '#f8fafc'],
        })
      }
      setSelectedGoal(null)
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Goal contribution failed.')
      throw caughtError
    }
  }

  const handleDelete = async (goalId: string) => {
    try {
      setActionError(null)
      await deleteGoal(goalId)
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null)
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Goal delete failed.')
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Goals</p>
          <h2>Upcoming savings goals and progress</h2>
        </div>
        <p className="page-description">
          Track how much is achieved, prioritize upcoming deadlines, and contribute from your existing accounts.
        </p>
      </header>

      <div className="summary-grid">
        <article className="summary-card summary-card-neutral">
          <p>Total saved</p>
          <strong>{formatCurrency(totals.current)}</strong>
          <span>Combined current amount across all goals.</span>
        </article>
        <article className="summary-card summary-card-warning">
          <p>Total target</p>
          <strong>{formatCurrency(totals.target)}</strong>
          <span>Combined target amount across all goals.</span>
        </article>
        <article className="summary-card summary-card-positive">
          <p>Upcoming goals</p>
          <strong>{upcomingGoals.length}</strong>
          <span>Active goals sorted by nearest target date.</span>
        </article>
        <article className="summary-card summary-card-negative">
          <p>Completed</p>
          <strong>{filteredGoals.filter((goal) => goal.status === 'completed').length}</strong>
          <span>Completed goals inside the current target-date filter.</span>
        </article>
      </div>

      {actionError ? (
        <div className="report-error" role="alert">
          <strong>Goal action failed.</strong>
          <span>{actionError}</span>
        </div>
      ) : null}

      <section className="goals-filter-bar">
        <label className="field field-small">
          <span>Target date up to</span>
          <input
            type="date"
            min={today}
            value={targetDateCutoff}
            onChange={(event) => setTargetDateCutoff(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setTargetDateCutoff('')}
        >
          Clear date filter
        </button>
      </section>

      <div className="page-actions">
        <button type="button" className="primary-button" onClick={() => navigate('/goals/new')}>
          Add goal
        </button>
      </div>

      <ReportPanel
        title="Goal progress chart"
        subtitle="Target and achieved values for the goals currently stored for this user."
      >
        <GoalSummaryChart goals={filteredGoals} />
      </ReportPanel>

      {selectedGoal ? (
        <GoalContributionPanel
          goal={selectedGoal}
          accounts={activeAccounts}
          onCancel={() => setSelectedGoal(null)}
          onSubmit={handleContribution}
        />
      ) : null}

      <ReportPanel
        title="Upcoming goals"
        subtitle="Your saved goals sorted by deadline, with quick contribution and delete actions."
      >
        <GoalsList
          goals={filteredGoals}
          onContribute={(goalId) => setSelectedGoal(goals.find((goal) => goal.id === goalId) ?? null)}
          onDelete={handleDelete}
        />
      </ReportPanel>
    </section>
  )
}

export default GoalsPage
