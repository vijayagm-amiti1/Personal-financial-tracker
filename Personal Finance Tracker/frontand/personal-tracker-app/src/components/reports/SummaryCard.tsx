type SummaryCardProps = {
  title: string
  value: number
  tone: 'positive' | 'negative' | 'neutral' | 'warning'
  label?: string
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function SummaryCard({
  title,
  value,
  tone,
  label,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <article className={`summary-card summary-card-${tone}`}>
      <p>{title}</p>
      <strong>{isLoading ? 'Loading...' : formatCurrency(value)}</strong>
      <span>{label ?? 'Calculated from the selected report range'}</span>
    </article>
  )
}

export default SummaryCard
