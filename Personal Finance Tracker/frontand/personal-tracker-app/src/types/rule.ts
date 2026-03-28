export type RuleConditionField = 'merchant' | 'amount' | 'category' | 'type' | 'payment_method'

export type RuleConditionOperator =
  | 'equals'
  | 'contains'
  | 'starts_with'
  | 'greater_than'
  | 'less_than'

export type RuleActionType = 'set_category' | 'add_tag' | 'create_alert'

export type RuleRecord = {
  id: string
  userId: string
  name: string
  enabled: boolean
  priority: number
  conditionField: RuleConditionField
  conditionOperator: RuleConditionOperator
  conditionValue: string
  actionType: RuleActionType
  actionValue: string
  createdAt: string
  updatedAt: string
}

export type RuleFormValues = {
  name: string
  enabled: boolean
  priority: string
  conditionField: RuleConditionField
  conditionOperator: RuleConditionOperator
  conditionValue: string
  actionType: RuleActionType
  actionValue: string
}
