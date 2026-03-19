export type TransactionType = 'income' | 'expense' | 'transfer' | 'goal_contribution'

export type EditableTransactionType = 'income' | 'expense' | 'transfer'

export type TransactionRecord = {
  id: string
  userId: string
  accountId: string
  toAccountId: string | null
  categoryId: string | null
  type: TransactionType
  amount: number
  date: string
  merchant: string | null
  note: string | null
  paymentMethod: string | null
  createdAt: string
  updatedAt: string
}

export type TransactionFormValues = {
  type: EditableTransactionType
  amount: string
  date: string
  accountId: string
  toAccountId: string
  categoryId: string
  merchant: string
  note: string
  paymentMethod: string
  tags: string
}

export type TransactionFilters = {
  search: string
  type: 'all' | TransactionType
  accountId: string
  categoryId: string
  dateFrom: string
  dateTo: string
  minAmount: string
  maxAmount: string
}
