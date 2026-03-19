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

const seededUser: DevUser = {
  id: '00000000-0000-0000-0000-000000002001',
  email: 'akash@financetracker.local',
  displayName: 'akash',
}

const seededAccounts: DevAccount[] = [
  {
    id: '00000000-0000-0000-0000-000000002020',
    userId: seededUser.id,
    name: 'akash_axis_primary',
    type: 'checking',
    institutionName: 'Axis Bank',
    currentBalance: 177770,
  },
  {
    id: '00000000-0000-0000-0000-000000002021',
    userId: seededUser.id,
    name: 'akash_icici_reserve',
    type: 'savings',
    institutionName: 'ICICI Bank',
    currentBalance: 105659,
  },
  {
    id: '00000000-0000-0000-0000-000000002022',
    userId: seededUser.id,
    name: 'akash_wallet_cash',
    type: 'cash',
    institutionName: 'Cash Wallet',
    currentBalance: 7861,
  },
]

const seededGoals: DevGoal[] = [
  {
    id: '00000000-0000-0000-0000-000000002030',
    userId: seededUser.id,
    name: 'Emergency Corpus',
    targetAmount: 180000,
    currentAmount: 10500,
    targetDate: '2026-12-31',
    linkedAccountId: '00000000-0000-0000-0000-000000002021',
    status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000002031',
    userId: seededUser.id,
    name: 'Japan Trip',
    targetAmount: 95000,
    currentAmount: 6700,
    targetDate: '2026-11-15',
    linkedAccountId: '00000000-0000-0000-0000-000000002021',
    status: 'active',
  },
  {
    id: '00000000-0000-0000-0000-000000002032',
    userId: seededUser.id,
    name: 'Studio Laptop',
    targetAmount: 135000,
    currentAmount: 5800,
    targetDate: '2026-10-30',
    linkedAccountId: '00000000-0000-0000-0000-000000002020',
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
  if (!localStorage.getItem(STORAGE_KEYS.user)) {
    writeJson(STORAGE_KEYS.user, seededUser)
  }

  if (!localStorage.getItem(STORAGE_KEYS.accounts)) {
    writeJson(STORAGE_KEYS.accounts, seededAccounts)
  }

  if (!localStorage.getItem(STORAGE_KEYS.goals)) {
    writeJson(STORAGE_KEYS.goals, seededGoals)
  }

  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    writeJson(STORAGE_KEYS.categories, [])
  }
}

export function getStoredUser() {
  return readJson(STORAGE_KEYS.user, seededUser)
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
