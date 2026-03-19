export type ReportFilters = {
  userId: string
  accountId: string
  month: number
  year: number
  type: 'all' | 'income' | 'expense'
}

export type DevUser = {
  id: string
  email: string
  displayName: string
}

export type DevAccount = {
  id: string
  userId: string
  name: string
  type: string
  institutionName: string
  currentBalance?: number
}

export type DevCategory = {
  id: string
  userId: string
  name: string
  type: string
  color: string
  icon: string
  isArchived: boolean
}

export type DevGoal = {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  linkedAccountId: string
  status: string
}

export type DailyReport = {
  day: number
  accountId: string
  income: number
  expense: number
}

export type CategorySpendingReport = {
  categoryId: string
  categoryName: string
  expense: number
}

export type EndpointConfig = {
  baseUrl: string
  transactions: {
    getByUser: {
      method: string
      path: string
    }
    getByAccount: {
      method: string
      path: string
    }
    getById: {
      method: string
      path: string
    }
    create: {
      method: string
      path: string
    }
    update: {
      method: string
      path: string
    }
    delete: {
      method: string
      path: string
    }
  }
  categories?: {
    getAll?: {
      method: string
      path: string
    }
    create?: {
      method: string
      path: string
    }
  }
  budgets?: {
    create?: {
      method: string
      path: string
    }
    getAll?: {
      method: string
      path: string
    }
    getById?: {
      method: string
      path: string
    }
    update?: {
      method: string
      path: string
    }
    copyPrevious?: {
      method: string
      path: string
    }
    delete?: {
      method: string
      path: string
    }
  }
  goals?: {
    create?: {
      method: string
      path: string
    }
    contribute?: {
      method: string
      path: string
    }
    delete?: {
      method: string
      path: string
    }
  }
  reports: {
    monthlyDaily: {
      method: string
      path: string
    }
    monthlyCategorySpending: {
      method: string
      path: string
    }
  }
}
