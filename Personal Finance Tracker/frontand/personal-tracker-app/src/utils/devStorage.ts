import type { DevAccount, DevCategory, DevGoal, DevUser } from '../types/report'

export const ALL_ACCOUNTS_VALUE = 'all'

const STORAGE_KEYS = {
  user: 'financeTracker.dev.user',
  accounts: 'financeTracker.dev.accounts',
  categories: 'financeTracker.dev.categories',
  goals: 'financeTracker.dev.goals',
} as const

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
    writeJson(STORAGE_KEYS.accounts, [])
  }

  if (!localStorage.getItem(STORAGE_KEYS.categories)) {
    writeJson(STORAGE_KEYS.categories, [])
  }

  if (!localStorage.getItem(STORAGE_KEYS.goals)) {
    writeJson(STORAGE_KEYS.goals, [])
  }
}

export function getStoredUser() {
  return readJson<DevUser | null>(STORAGE_KEYS.user, null)
}

export function setStoredUser(user: DevUser) {
  writeJson(STORAGE_KEYS.user, user)
}

export function getStoredAccounts() {
  return readJson<DevAccount[]>(STORAGE_KEYS.accounts, [])
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
  return readJson<DevGoal[]>(STORAGE_KEYS.goals, [])
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
