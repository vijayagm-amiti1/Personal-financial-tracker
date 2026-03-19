import type {
  DevAccount,
  DevCategory,
  DevGoal,
  DevUser,
} from '../types/report'

export const ALL_ACCOUNTS_VALUE = 'all'

const STORAGE_KEYS = {
  user: 'financeTracker.dev.user',
  accounts: 'financeTracker.dev.accounts',
  categories: 'financeTracker.dev.categories',
  goals: 'financeTracker.dev.goals',
} as const

const seededAccounts: DevAccount[] = [
  {
    id: '00000000-0000-0000-0000-000000004030',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'demo2_hdfc_primary',
    type: 'checking',
    institutionName: 'HDFC Bank',
    openingBalance: 240000,
    currentBalance: 240000,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000004031',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'demo2_sbi_reserve',
    type: 'savings',
    institutionName: 'SBI',
    openingBalance: 125000,
    currentBalance: 125000,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000004032',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'demo2_wallet_cash',
    type: 'cash',
    institutionName: 'Cash Wallet',
    openingBalance: 18000,
    currentBalance: 18000,
    isActive: true,
  },
]

const seededGoals: DevGoal[] = [
  {
    id: '00000000-0000-0000-0000-000000004040',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'Emergency Reserve',
    targetAmount: 250000,
    currentAmount: 16200,
    targetDate: '2026-12-31',
    linkedAccountId: '00000000-0000-0000-0000-000000004031',
    status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000004041',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'Europe Vacation',
    targetAmount: 180000,
    currentAmount: 10200,
    targetDate: '2026-11-20',
    linkedAccountId: '00000000-0000-0000-0000-000000004031',
    status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000004042',
    userId: '00000000-0000-0000-0000-000000004001',
    name: 'Workstation Upgrade',
    targetAmount: 150000,
    currentAmount: 9800,
    targetDate: '2026-10-15',
    linkedAccountId: '00000000-0000-0000-0000-000000004030',
    status: 'active',
  },
]

function readJson<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initializeDevelopmentStorage() {
  const existingUser = readJson<DevUser | null>(STORAGE_KEYS.user, null)

  if (existingUser === null) {
    return
  }

  if (!localStorage.getItem(STORAGE_KEYS.accounts)) {
    writeJson(
      STORAGE_KEYS.accounts,
      seededAccounts.map((account) => ({ ...account, userId: existingUser.id })),
    )
  }

  if (!localStorage.getItem(STORAGE_KEYS.goals)) {
    writeJson(
      STORAGE_KEYS.goals,
      seededGoals.map((goal) => ({ ...goal, userId: existingUser.id })),
    )
  }

  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    writeJson(STORAGE_KEYS.categories, [])
  }
}

export function getStoredUser() {
  return readJson<DevUser | null>(STORAGE_KEYS.user, null)
}

export function setStoredUser(user: DevUser) {
  writeJson(STORAGE_KEYS.user, user)
}

export function getStoredAccounts() {
  return readJson(STORAGE_KEYS.accounts, seededAccounts)
}

export function getStoredCategories() {
  return readJson<DevCategory[]>(STORAGE_KEYS.categories, [])
}

export function setStoredAccounts(accounts: DevAccount[]) {
  writeJson(STORAGE_KEYS.accounts, accounts)
}

export function setStoredCategories(categories: DevCategory[]) {
  writeJson(STORAGE_KEYS.categories, categories)
}

export function getStoredGoals() {
  return readJson(STORAGE_KEYS.goals, seededGoals)
}

export function setStoredGoals(goals: DevGoal[]) {
  writeJson(STORAGE_KEYS.goals, goals)
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEYS.user)
}

export function clearDevelopmentStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}
