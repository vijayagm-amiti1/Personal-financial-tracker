import { useEffect, useMemo, useRef, useState } from 'react'
import type { DevAccount, DevCategory, EndpointConfig } from '../types/report'
import type {
  TransactionFilters,
  TransactionFormValues,
  TransactionRecord,
} from '../types/transaction'
import { dispatchNotificationsRefresh } from '../utils/appEvents'
import { authFetch } from '../utils/authFetch'

type UseTransactionsDataArgs = {
  userId: string
  accounts: DevAccount[]
  categories: DevCategory[]
}

type SaveTransactionArgs = {
  values: TransactionFormValues
  transactionId?: string
}

const PAGE_SIZE = 12

const defaultFilters: TransactionFilters = {
  search: '',
  type: 'all',
  accountId: 'all',
  categoryId: 'all',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
}

async function loadEndpointConfig(): Promise<EndpointConfig> {
  const response = await fetch('/endpoints.json')

  if (!response.ok) {
    throw new Error('Failed to load endpoint configuration.')
  }

  return response.json()
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

function mapTransactionPayload(payload: unknown): TransactionRecord[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((item) => {
    const record = item as Record<string, unknown>

    return {
      id: String(record.id),
      userId: String(record.userId),
      accountId: String(record.accountId),
      toAccountId: record.toAccountId ? String(record.toAccountId) : null,
      categoryId: record.categoryId ? String(record.categoryId) : null,
      type: String(record.type) as TransactionRecord['type'],
      amount: Number(record.amount),
      date: String(record.date),
      merchant: record.merchant ? String(record.merchant) : null,
      note: record.note ? String(record.note) : null,
      paymentMethod: record.paymentMethod ? String(record.paymentMethod) : null,
      createdAt: String(record.createdAt),
      updatedAt: String(record.updatedAt),
    }
  })
}

function filterTransactions(
  transactions: TransactionRecord[],
  filters: TransactionFilters,
) {
  return transactions.filter((transaction) => {
    const searchValue = filters.search.trim().toLowerCase()
    const matchesSearch =
      searchValue === '' ||
      transaction.merchant?.toLowerCase().includes(searchValue) ||
      transaction.note?.toLowerCase().includes(searchValue)

    const matchesType =
      filters.type === 'all' || transaction.type === filters.type

    const matchesAccount =
      filters.accountId === 'all' ||
      transaction.accountId === filters.accountId ||
      transaction.toAccountId === filters.accountId

    const matchesCategory =
      filters.categoryId === 'all' || transaction.categoryId === filters.categoryId

    const matchesDateFrom =
      filters.dateFrom === '' || transaction.date >= filters.dateFrom

    const matchesDateTo =
      filters.dateTo === '' || transaction.date <= filters.dateTo

    const matchesMinAmount =
      filters.minAmount === '' || transaction.amount >= Number(filters.minAmount)

    const matchesMaxAmount =
      filters.maxAmount === '' || transaction.amount <= Number(filters.maxAmount)

    return (
      matchesSearch &&
      matchesType &&
      matchesAccount &&
      matchesCategory &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesMinAmount &&
      matchesMaxAmount
    )
  })
}

function useTransactionsData({
  userId,
}: UseTransactionsDataArgs) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters)
  const [page, setPage] = useState(1)
  const configRef = useRef<EndpointConfig | null>(null)

  const reload = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (configRef.current === null) {
        configRef.current = await loadEndpointConfig()
      }

      const config = configRef.current
      const path = config.transactions.getByUser.path
      const response = await authFetch(new URL(path, config.baseUrl).toString())

      if (!response.ok) {
        throw new Error((await extractErrorMessage(response)) ?? 'Failed to load transactions.')
      }

      const payload = await response.json()
      setTransactions(mapTransactionPayload(payload))
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unexpected error while loading transactions.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [userId])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  )

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))

  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE
    return filteredTransactions.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredTransactions, page])

  const saveTransaction = async ({
    values,
    transactionId,
  }: SaveTransactionArgs) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const config = configRef.current
    const endpoint = transactionId ? config.transactions.update : config.transactions.create
    const path = transactionId
      ? endpoint.path.replace('{transactionId}', transactionId)
      : endpoint.path
    const url = new URL(path, config.baseUrl)

    const payload = {
      type: values.type,
      amount: Number(values.amount),
      date: values.date,
      accountId: values.accountId,
      toAccountId: values.type === 'transfer' ? values.toAccountId : null,
      categoryId:
        values.type === 'transfer' || values.categoryId === '' ? null : values.categoryId,
      merchant: values.merchant || null,
      note: values.note || null,
      paymentMethod: values.paymentMethod || null,
      tags:
        values.tags.trim() === ''
          ? []
          : values.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
    }

    const response = await authFetch(url.toString(), {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to save transaction.')
    }

    await reload()
    dispatchNotificationsRefresh()
  }

  const deleteTransaction = async (transactionId: string) => {
    if (configRef.current === null) {
      configRef.current = await loadEndpointConfig()
    }

    const config = configRef.current
    const path = config.transactions.delete.path.replace('{transactionId}', transactionId)
    const url = new URL(path, config.baseUrl)

    const response = await authFetch(url.toString(), {
      method: config.transactions.delete.method,
    })

    if (!response.ok) {
      throw new Error((await extractErrorMessage(response)) ?? 'Failed to delete transaction.')
    }

    await reload()
    dispatchNotificationsRefresh()
  }

  return {
    transactions,
    filteredTransactions,
    paginatedTransactions,
    isLoading,
    error,
    filters,
    setFilters,
    page,
    totalPages,
    setPage,
    saveTransaction,
    deleteTransaction,
    reload,
  }
}

export default useTransactionsData
