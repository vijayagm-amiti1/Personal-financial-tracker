export type ReportFilters = {
  accountId: string
  month: number
  year: number
  type: 'all' | 'income' | 'expense'
}

export type InsightsFilters = {
  accountId: string
  categoryId: string
  fromDate: string
  toDate: string
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
  openingBalance?: number
  currentBalance?: number
  isActive?: boolean
  accessRole?: 'OWNER' | 'EDITOR' | 'VIEWER'
  sharedMemberCount?: number
  ownerDisplayName?: string
  createdAt?: string
}

export type SharedAccountMember = {
  id?: string | null
  userId: string
  email: string
  displayName: string
  role: 'OWNER' | 'EDITOR' | 'VIEWER'
  owner: boolean
  createdAt?: string
}

export type AccountInviteRecord = {
  id: string
  accountId: string
  accountName: string
  accountType: string
  institutionName: string
  recipientEmail: string
  role: 'OWNER' | 'EDITOR' | 'VIEWER'
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED' | 'EXPIRED'
  invitedByDisplayName: string
  invitedByEmail: string
  inviteLink: string
  expiresAt: string
  respondedAt?: string | null
  createdAt: string
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

export type NotificationRecord = {
  id: string
  userId: string
  title: string
  message: string
  type: 'BUDGET_WARNING' | 'GOAL_REACHED' | 'SYSTEM_UPDATE' | 'DAILY_REMINDER' | 'RULE_ALERT'
  isRead: boolean
  createdAt: string
}

export type ForecastUpcomingItem = {
  date: string
  title: string
  type: string
  amount: number
  source: string
}

export type ForecastMonthSummary = {
  month: number
  year: number
  fromDate: string
  toDate: string
  currentBalance: number
  projectedEndBalance: number
  safeToSpend: number
  safeToSpendPerDay: number
  averageDailyExpense: number
  estimatedPatternExpenseRemaining: number
  upcomingRecurringIncome: number
  upcomingRecurringExpense: number
  insufficientForRecurringPayments: boolean
  recurringPaymentAlert: string
  negativeBalanceLikely: boolean
  firstNegativeDate?: string | null
  riskMessage: string
  upcomingKnownExpenses: ForecastUpcomingItem[]
}

export type ForecastDailyPoint = {
  date: string
  projectedBalance: number
  recurringIncome: number
  recurringExpense: number
  estimatedExpense: number
  negative: boolean
}

export type FinancialHealthComponent = {
  key: string
  label: string
  score: number
  weight: number
  summary: string
}

export type FinancialHealthScore = {
  score: number
  band: string
  summary: string
  components: FinancialHealthComponent[]
}

export type TrendMetricPoint = {
  periodKey: string
  periodLabel: string
  income: number
  expense: number
  savingsRate: number
}

export type CategoryTrendPoint = {
  periodKey: string
  periodLabel: string
  expense: number
}

export type CategoryTrendSeries = {
  categoryId: string
  categoryName: string
  totalExpense: number
  points: CategoryTrendPoint[]
}

export type TrendReportResponse = {
  fromDate: string
  toDate: string
  monthlySummary: TrendMetricPoint[]
  categoryTrends: CategoryTrendSeries[]
}

export type NetWorthPoint = {
  periodKey: string
  periodLabel: string
  date: string
  netWorth: number
  totalAssets: number
}

export type NetWorthReportResponse = {
  fromDate: string
  toDate: string
  currentNetWorth: number
  changeAmount: number
  points: NetWorthPoint[]
}

export type InsightItem = {
  type: string
  severity: 'info' | 'positive' | 'warning'
  title: string
  message: string
  changePercent?: number | null
  amount?: number | null
}

export type InsightsResponse = {
  fromDate: string
  toDate: string
  currentSavingsRate: number
  currentNetWorth: number
  insights: InsightItem[]
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
  accounts?: {
    getAll?: {
      method: string
      path: string
    }
    getById?: {
      method: string
      path: string
    }
    create?: {
      method: string
      path: string
    }
    update?: {
      method: string
      path: string
    }
    delete?: {
      method: string
      path: string
    }
    getMembers?: {
      method: string
      path: string
    }
    invite?: {
      method: string
      path: string
    }
    updateMember?: {
      method: string
      path: string
    }
    removeMember?: {
      method: string
      path: string
    }
  }
  accountInvites?: {
    getByToken?: {
      method: string
      path: string
    }
    respond?: {
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
    getAll?: {
      method: string
      path: string
    }
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
  notifications?: {
    getAll?: {
      method: string
      path: string
    }
    getById?: {
      method: string
      path: string
    }
    markAsRead?: {
      method: string
      path: string
    }
    markAllAsRead?: {
      method: string
      path: string
    }
    deleteById?: {
      method: string
      path: string
    }
    deleteAll?: {
      method: string
      path: string
    }
  }
  recurring?: {
    getAll?: {
      method: string
      path: string
    }
    create?: {
      method: string
      path: string
    }
    update?: {
      method: string
      path: string
    }
    delete?: {
      method: string
      path: string
    }
  }
  rules?: {
    getAll?: {
      method: string
      path: string
    }
    create?: {
      method: string
      path: string
    }
    update?: {
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
    trends?: {
      method: string
      path: string
    }
    netWorth?: {
      method: string
      path: string
    }
  }
  insights?: {
    getAll?: {
      method: string
      path: string
    }
  }
  forecast?: {
    month?: {
      method: string
      path: string
    }
    daily?: {
      method: string
      path: string
    }
  }
  financialHealth?: {
    score?: {
      method: string
      path: string
    }
  }
}
