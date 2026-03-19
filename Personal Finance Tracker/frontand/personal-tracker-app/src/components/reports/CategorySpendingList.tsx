import type { CategorySpendingReport } from '../../types/report'

type CategorySpendingListProps = {
  items: CategorySpendingReport[]
  isLoading: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function CategorySpendingList({
  items,
  isLoading,
}: CategorySpendingListProps) {
  if (isLoading) {
    return <div className="empty-state">Loading category spending...</div>
  }

  if (items.length === 0) {
    return <div className="empty-state">No category expenses found for this month.</div>
  }

  const largestExpense = Math.max(...items.map((item) => item.expense), 1)

  return (
    <div className="category-list">
      {items.map((item) => (
        <article key={item.categoryId} className="category-row">
          <div className="category-row-text">
            <strong>{item.categoryName}</strong>
            <span>{item.categoryId}</span>
          </div>
          <div className="category-row-metrics">
            <span>{formatCurrency(item.expense)}</span>
            <div className="meter-track" aria-hidden="true">
              <div
                className="meter-fill"
                style={{ width: `${(item.expense / largestExpense) * 100}%` }}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default CategorySpendingList
