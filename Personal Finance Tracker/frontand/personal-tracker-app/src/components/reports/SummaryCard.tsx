type SummaryCardProps = {
  title: string
  value: number
  tone: 'positive' | 'negative' | 'neutral' | 'warning'
  label?: string
  isLoading?: boolean
  format?: 'currency' | 'percentage'
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
  format = 'currency',
}: SummaryCardProps) {
  const formattedValue = format === 'percentage'
    ? `${value.toFixed(1)}%`
    : formatCurrency(value)

  return (
    <article className={`summary-card summary-card-${tone}`}>
      <p>{title}</p>
      <strong>{isLoading ? 'Loading...' : formattedValue}</strong>
      <span>{label ?? 'Calculated from the selected report range'}</span>
    </article>
  )
}

export default SummaryCard
