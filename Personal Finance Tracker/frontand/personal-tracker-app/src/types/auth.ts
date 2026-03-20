export type AuthUser = {
  id: string
  email: string
  displayName: string
}

export type UserSettings = {
  email: string
  displayName: string
  allowSendEmailNotification: boolean
  allowBudgetThresholdAlert: boolean
  allowBudgetExceededAlert: boolean
  allowGoalNotification: boolean
  allowGoalCompletionBeforeTargetDateNotification: boolean
  allowGoalMissedTargetDateNotification: boolean
  allowMonthlyBudgetReport: boolean
  navbarVerticalEnabled: boolean
}

export type RegisterPayload = {
  email: string
  displayName: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  newPassword: string
}

export type CompleteSignupPayload = {
  email: string
  password: string
  confirmPassword: string
}
