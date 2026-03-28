import type { DevCategory } from '../types/report'
import type { RuleRecord } from '../types/rule'
import type { TransactionFormValues } from '../types/transaction'

export type RuleSuggestionSummary = {
  suggestedCategoryId: string | null
  suggestedCategoryName: string | null
  suggestedTags: string[]
  alertMessages: string[]
  matchedRuleNames: string[]
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function matchesRule(rule: RuleRecord, values: TransactionFormValues) {
  switch (rule.conditionField) {
    case 'merchant':
      return matchText(values.merchant, rule.conditionOperator, rule.conditionValue)
    case 'payment_method':
      return matchText(values.paymentMethod, rule.conditionOperator, rule.conditionValue)
    case 'type':
      return matchText(values.type, rule.conditionOperator, rule.conditionValue)
    case 'category':
      return rule.conditionOperator === 'equals' && values.categoryId === rule.conditionValue
    case 'amount':
      return matchNumber(values.amount, rule.conditionOperator, rule.conditionValue)
    default:
      return false
  }
}

function matchText(actual: string, operator: RuleRecord['conditionOperator'], expected: string) {
  if (actual.trim() === '') {
    return false
  }

  const normalizedActual = normalizeText(actual)
  const normalizedExpected = normalizeText(expected)

  if (operator === 'equals') {
    return normalizedActual === normalizedExpected
  }

  if (operator === 'contains') {
    return normalizedActual.includes(normalizedExpected)
  }

  if (operator === 'starts_with') {
    return normalizedActual.startsWith(normalizedExpected)
  }

  return false
}

function matchNumber(actual: string, operator: RuleRecord['conditionOperator'], expected: string) {
  if (actual.trim() === '') {
    return false
  }

  const actualValue = Number(actual)
  const expectedValue = Number(expected)

  if (Number.isNaN(actualValue) || Number.isNaN(expectedValue)) {
    return false
  }

  if (operator === 'equals') {
    return actualValue === expectedValue
  }

  if (operator === 'greater_than') {
    return actualValue > expectedValue
  }

  if (operator === 'less_than') {
    return actualValue < expectedValue
  }

  return false
}

export function evaluateRuleSuggestions(
  rules: RuleRecord[],
  values: TransactionFormValues,
  categories: DevCategory[],
): RuleSuggestionSummary {
  const enabledRules = rules
    .filter((rule) => rule.enabled)
    .sort((left, right) => left.priority - right.priority)

  let suggestedCategoryId: string | null = null
  const suggestedTags = new Set<string>()
  const alertMessages: string[] = []
  const matchedRuleNames: string[] = []

  enabledRules.forEach((rule) => {
    if (!matchesRule(rule, values)) {
      return
    }

    matchedRuleNames.push(rule.name)

    if (rule.actionType === 'set_category' && suggestedCategoryId === null) {
      suggestedCategoryId = rule.actionValue
      return
    }

    if (rule.actionType === 'add_tag') {
      suggestedTags.add(rule.actionValue)
      return
    }

    if (rule.actionType === 'create_alert') {
      alertMessages.push(rule.actionValue)
    }
  })

  const suggestedCategoryName = suggestedCategoryId
    ? categories.find((category) => category.id === suggestedCategoryId)?.name ?? null
    : null

  return {
    suggestedCategoryId,
    suggestedCategoryName,
    suggestedTags: Array.from(suggestedTags),
    alertMessages,
    matchedRuleNames,
  }
}
