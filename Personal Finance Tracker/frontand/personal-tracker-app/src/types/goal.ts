export type GoalFormValues = {
  name: string
  targetAmount: string
  targetDate: string
  linkedAccountId: string
  status: string
}

export type GoalContributionValues = {
  goalId: string
  accountId: string
  amount: string
}
