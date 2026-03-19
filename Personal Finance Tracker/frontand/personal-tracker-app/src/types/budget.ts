export type BudgetRecord = {
  id: string
  userId: string
  categoryId: string
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
  month: number
  year: number
  amount: number
  currentSpent: number
  spentAmount: number
  remainingAmount: number
  spentPercent: number
  alertThresholdPercent: number
}

export type BudgetFormValues = {
  categoryId: string
  month: string
  year: string
  amount: string
  alertThresholdPercent: string
}
