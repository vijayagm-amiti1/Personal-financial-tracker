import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { loadEndpointConfig } from '../config/endpoints'
import type { DevAccount, DevCategory, DevGoal } from '../types/report'
import {
  getStoredAccounts,
  getStoredCategories,
  getStoredGoals,
  initializeDevelopmentStorage,
  setStoredAccounts,
  setStoredCategories,
  setStoredGoals,
} from '../utils/devStorage'
import { authFetch } from '../utils/authFetch'

type BootstrapState = {
  accounts: DevAccount[]
  categories: DevCategory[]
  goals: DevGoal[]
}

async function extractErrorMessage(response: Response) {
  try {
    const payload = await response.json()
    if (payload && typeof payload.message === 'string' && payload.message.trim() !== '') {
      return payload.message
    }
  } catch {
    return null
  }

  return null
}

function mapAccount(item: unknown): DevAccount {
  const record = item as Record<string, unknown>

  return {
    id: String(record.id),
    userId: String(record.userId),
    name: String(record.name ?? ''),
    type: String(record.type ?? ''),
    institutionName: String(record.institutionName ?? ''),
    openingBalance: Number(record.openingBalance ?? 0),
    currentBalance: Number(record.currentBalance ?? 0),
    isActive: record.isActive !== false,
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
  }
}

function mapGoal(item: unknown): DevGoal {
  const record = item as Record<string, unknown>

  return {
    id: String(record.id),
    userId: String(record.userId),
    name: String(record.name ?? ''),
    targetAmount: Number(record.targetAmount ?? 0),
    currentAmount: Number(record.currentAmount ?? 0),
    targetDate: String(record.targetDate ?? ''),
    linkedAccountId: String(record.linkedAccountId ?? ''),
    status: String(record.status ?? 'active'),
  }
}

function useDevelopmentBootstrap() {
  const { user } = useAuth()
  const [state, setState] = useState<BootstrapState>(() => {
    initializeDevelopmentStorage()

    return {
      accounts: getStoredAccounts(),
      categories: getStoredCategories(),
      goals: getStoredGoals(),
    }
  })

  if (!user) {
    throw new Error('Authenticated user is required')
  }

  const refreshCategories = async () => {
    const config = await loadEndpointConfig()
    const categoryPath = config.categories?.getAll?.path

    if (!categoryPath) {
      return []
    }

    const response = await authFetch(new URL(categoryPath, config.baseUrl).toString())

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to load categories.')
    }

    const categories = (await response.json()) as DevCategory[]
    setStoredCategories(categories)
    setState((currentState) => ({
      ...currentState,
      categories,
    }))

    return categories
  }

  const refreshAccounts = async () => {
    const config = await loadEndpointConfig()
    const accountPath = config.accounts?.getAll?.path

    if (!accountPath) {
      return []
    }

    const response = await authFetch(new URL(accountPath, config.baseUrl).toString())
    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to load accounts.')
    }

    const accounts = ((await response.json()) as unknown[]).map(mapAccount)
    setStoredAccounts(accounts)
    setState((currentState) => ({
      ...currentState,
      accounts,
    }))
    return accounts
  }

  const refreshGoals = async () => {
    const config = await loadEndpointConfig()
    const goalPath = config.goals?.getAll?.path

    if (!goalPath) {
      return []
    }

    const response = await authFetch(new URL(goalPath, config.baseUrl).toString())

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to load goals.')
    }

    const goals = ((await response.json()) as unknown[]).map(mapGoal)
    setStoredGoals(goals)
    setState((currentState) => ({
      ...currentState,
      goals,
    }))

    return goals
  }

  const createCategory = async (payload: {
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string
  }) => {
    const config = await loadEndpointConfig()
    const categoryPath = config.categories?.create?.path

    if (!categoryPath) {
      throw new Error('Category create endpoint is not configured.')
    }

    const url = new URL(categoryPath, config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.categories?.create?.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        isArchived: false,
      }),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to create category.')
    }

    const createdCategory = (await response.json()) as DevCategory
    const nextCategories = [...state.categories, createdCategory]
    setStoredCategories(nextCategories)
    setState((currentState) => ({
      ...currentState,
      categories: nextCategories,
    }))

    return createdCategory
  }

  const createGoal = async (payload: {
    name: string
    targetAmount: number
    targetDate: string
    linkedAccountId: string
    status: string
  }) => {
    const config = await loadEndpointConfig()
    const goalPath = config.goals?.create?.path

    if (!goalPath) {
      throw new Error('Goal create endpoint is not configured.')
    }

    const url = new URL(goalPath, config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.goals?.create?.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        currentAmount: 0,
      }),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to create goal.')
    }

    const createdGoal = (await response.json()) as DevGoal
    const nextGoals = [...state.goals, createdGoal]
    setStoredGoals(nextGoals)
    setState((currentState) => ({
      ...currentState,
      goals: nextGoals,
    }))

    return createdGoal
  }

  const contributeToGoal = async (payload: {
    goalId: string
    accountId: string
    amount: number
  }) => {
    const config = await loadEndpointConfig()
    const goalPath = config.goals?.contribute?.path

    if (!goalPath) {
      throw new Error('Goal contribution endpoint is not configured.')
    }

    const url = new URL(goalPath, config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.goals?.contribute?.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to contribute to goal.')
    }

    const updatedGoal = (await response.json()) as DevGoal
    const nextGoals = state.goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    const linkedAccountId = updatedGoal.linkedAccountId
    const nextAccounts = state.accounts.map((account) => {
      let nextBalance = account.currentBalance

      if (typeof nextBalance === 'number' && payload.accountId !== linkedAccountId && account.id === payload.accountId) {
        nextBalance = Number((nextBalance - payload.amount).toFixed(2))
      }

      if (typeof nextBalance === 'number' && payload.accountId !== linkedAccountId && account.id === linkedAccountId) {
        nextBalance = Number((nextBalance + payload.amount).toFixed(2))
      }

      return {
        ...account,
        currentBalance: nextBalance,
      }
    })
    setStoredAccounts(nextAccounts)
    setStoredGoals(nextGoals)
    setState((currentState) => ({
      ...currentState,
      accounts: nextAccounts,
      goals: nextGoals,
    }))

    return updatedGoal
  }

  const deleteGoal = async (goalId: string) => {
    const config = await loadEndpointConfig()
    const goalPath = config.goals?.delete?.path

    if (!goalPath) {
      throw new Error('Goal delete endpoint is not configured.')
    }

    const transactionPath = config.transactions.getByUser.path
    const transactionsResponse = await authFetch(new URL(transactionPath, config.baseUrl).toString())

    if (!transactionsResponse.ok) {
      throw new Error((await extractErrorMessage(transactionsResponse)) ?? 'Failed to load transactions before deleting goal.')
    }

    const transactions = (await transactionsResponse.json()) as Array<{
      goalId?: string | null
      accountId: string
      toAccountId?: string | null
      amount: number
      type: string
    }>

    const url = new URL(goalPath, config.baseUrl)
    url.searchParams.set('goalId', goalId)

    const response = await authFetch(url.toString(), {
      method: config.goals?.delete?.method ?? 'DELETE',
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to delete goal.')
    }

    const revertedAccountAmounts = new Map<string, number>()
    transactions
      .filter((transaction) => transaction.type === 'goal_contribution' && transaction.goalId === goalId)
      .forEach((transaction) => {
        if (transaction.toAccountId && transaction.toAccountId !== transaction.accountId) {
          revertedAccountAmounts.set(
            transaction.accountId,
            (revertedAccountAmounts.get(transaction.accountId) ?? 0) + Number(transaction.amount),
          )
          revertedAccountAmounts.set(
            transaction.toAccountId,
            (revertedAccountAmounts.get(transaction.toAccountId) ?? 0) - Number(transaction.amount),
          )
        }
      })

    const nextAccounts = state.accounts.map((account) => ({
      ...account,
      currentBalance:
        typeof account.currentBalance === 'number'
          ? Number((account.currentBalance + (revertedAccountAmounts.get(account.id) ?? 0)).toFixed(2))
          : account.currentBalance,
    }))

    const nextGoals = state.goals.filter((goal) => goal.id !== goalId)
    setStoredAccounts(nextAccounts)
    setStoredGoals(nextGoals)
    setState((currentState) => ({
      ...currentState,
      accounts: nextAccounts,
      goals: nextGoals,
    }))
  }

  const createAccount = async (payload: {
    name: string
    type: string
    institutionName: string
    openingBalance: number
  }) => {
    const config = await loadEndpointConfig()
    const accountPath = config.accounts?.create?.path

    if (!accountPath) {
      throw new Error('Account create endpoint is not configured.')
    }

    const url = new URL(accountPath, config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.accounts?.create?.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to create account.')
    }

    const createdAccount = mapAccount(await response.json())
    await refreshAccounts()
    return createdAccount
  }

  const updateAccount = async (accountId: string, payload: {
    name: string
    type: string
    institutionName: string
    openingBalance: number
  }) => {
    const config = await loadEndpointConfig()
    const accountPath = config.accounts?.update?.path

    if (!accountPath) {
      throw new Error('Account update endpoint is not configured.')
    }

    const url = new URL(accountPath.replace('{accountId}', accountId), config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.accounts?.update?.method ?? 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to update account.')
    }

    const updatedAccount = mapAccount(await response.json())
    await refreshAccounts()
    return updatedAccount
  }

  const deactivateAccount = async (accountId: string) => {
    const config = await loadEndpointConfig()
    const accountPath = config.accounts?.delete?.path

    if (!accountPath) {
      throw new Error('Account delete endpoint is not configured.')
    }

    const url = new URL(accountPath.replace('{accountId}', accountId), config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.accounts?.delete?.method ?? 'DELETE',
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to deactivate account.')
    }

    await refreshAccounts()
    const nextGoals = state.goals.filter((goal) => goal.linkedAccountId !== accountId)
    setStoredGoals(nextGoals)
    setState((currentState) => ({
      ...currentState,
      goals: nextGoals,
    }))
  }

  useEffect(() => {
    void refreshAccounts().catch(() => undefined)
    void refreshCategories().catch(() => undefined)
    void refreshGoals().catch(() => undefined)
  }, [])

  const activeAccounts = useMemo(
    () => state.accounts.filter((account) => account.isActive !== false),
    [state.accounts],
  )

  return {
    user,
    ...state,
    activeAccounts,
    refreshAccounts,
    refreshCategories,
    refreshGoals,
    createAccount,
    updateAccount,
    deactivateAccount,
    createCategory,
    createGoal,
    contributeToGoal,
    deleteGoal,
  }
}

export default useDevelopmentBootstrap
