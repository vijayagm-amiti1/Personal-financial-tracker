import { useEffect, useState } from 'react'
import type { DevAccount, DevCategory, DevGoal, DevUser, EndpointConfig } from '../types/report'
import {
  getStoredAccounts,
  getStoredCategories,
  getStoredGoals,
  getStoredUser,
  initializeDevelopmentStorage,
  setStoredAccounts,
  setStoredCategories,
  setStoredGoals,
} from '../utils/devStorage'

type BootstrapState = {
  user: DevUser
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

async function loadEndpointConfig(): Promise<EndpointConfig> {
  const response = await fetch('/endpoints.json')

  if (!response.ok) {
    throw new Error('Failed to load endpoint configuration.')
  }

  return response.json()
}

function useDevelopmentBootstrap() {
  const [state, setState] = useState<BootstrapState>(() => {
    initializeDevelopmentStorage()

    return {
      user: getStoredUser(),
      accounts: getStoredAccounts(),
      categories: getStoredCategories(),
      goals: getStoredGoals(),
    }
  })

  const refreshCategories = async () => {
    const config = await loadEndpointConfig()
    const categoryPath = config.categories?.getAll?.path

    if (!categoryPath) {
      return []
    }

    const user = getStoredUser()
    const url = new URL(categoryPath, config.baseUrl)
    url.searchParams.set('userId', user.id)

    const response = await fetch(url.toString())

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

    const user = getStoredUser()
    const url = new URL(categoryPath, config.baseUrl)
    url.searchParams.set('userId', user.id)

    const response = await fetch(url.toString(), {
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

    const user = getStoredUser()
    const url = new URL(goalPath, config.baseUrl)
    url.searchParams.set('userId', user.id)

    const response = await fetch(url.toString(), {
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

    const user = getStoredUser()
    const url = new URL(goalPath, config.baseUrl)
    url.searchParams.set('userId', user.id)

    const response = await fetch(url.toString(), {
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

    const user = getStoredUser()
    const transactionPath = config.transactions.getByUser.path.replace('{userId}', user.id)
    const transactionsResponse = await fetch(new URL(transactionPath, config.baseUrl).toString())

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
    url.searchParams.set('userId', user.id)
    url.searchParams.set('goalId', goalId)

    const response = await fetch(url.toString(), {
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

  useEffect(() => {
    void refreshCategories().catch(() => undefined)
  }, [])

  return {
    ...state,
    refreshCategories,
    createCategory,
    createGoal,
    contributeToGoal,
    deleteGoal,
  }
}

export default useDevelopmentBootstrap
