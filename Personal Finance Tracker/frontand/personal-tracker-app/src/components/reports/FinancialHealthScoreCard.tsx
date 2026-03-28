import type { FinancialHealthScore } from '../../types/report'

type FinancialHealthScoreCardProps = {
  score: FinancialHealthScore | null
  isLoading: boolean
  error: string | null
}

function FinancialHealthScoreCard({
  score,
  isLoading,
  error,
}: FinancialHealthScoreCardProps) {
  const normalizedScore = score?.score ?? 0
  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference - (normalizedScore / 100) * circumference

  if (isLoading) {
    return (
      <section className="health-score-card">
        <div className="empty-state">Loading financial health score...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="health-score-card">
        <div className="report-error" role="alert">
          <strong>Unable to load financial health score.</strong>
          <span>{error}</span>
        </div>
      </section>
    )
  }

  if (!score) {
    return (
      <section className="health-score-card">
        <div className="empty-state">Financial health score is not available yet.</div>
      </section>
    )
  }

  return (
    <section className="health-score-card">
      <div className="health-score-layout">
        <div className="health-score-ring-wrap">
          <svg className="health-score-ring" viewBox="0 0 140 140" aria-hidden="true">
            <defs>
              <linearGradient id="healthScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
            <circle className="health-score-ring-track" cx="70" cy="70" r="52" />
            <circle
              className="health-score-ring-value"
              cx="70"
              cy="70"
              r="52"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="health-score-ring-content">
            <strong>{score.score}</strong>
            <span>/100</span>
          </div>
        </div>

        <div className="health-score-copy">
          <p className="eyebrow">Financial Health Score</p>
          <h3>{score.band}</h3>
          <p>{score.summary}</p>
        </div>
      </div>

      <div className="health-score-components">
        {score.components.map((component) => (
          <article key={component.key} className="health-score-component">
            <div className="health-score-component-heading">
              <strong>{component.label}</strong>
              <span>{component.score}/100</span>
            </div>
            <div className="health-score-component-meter">
              <span style={{ width: `${component.score}%` }} />
            </div>
            <p>{component.summary}</p>
            <small>{component.weight}% weight</small>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FinancialHealthScoreCard
