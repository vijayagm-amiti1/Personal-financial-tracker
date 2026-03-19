export type RecurringRecord = {
  id: string
  userId: string
  title: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  categoryName: string | null
  accountId: string
  accountName: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate: string | null
  nextRunDate: string
  autoCreateTransaction: boolean
}

export type RecurringFormValues = {
  title: string
  type: 'income' | 'expense'
  amount: string
  categoryId: string
  accountId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate: string
  autoCreateTransaction: boolean
}
