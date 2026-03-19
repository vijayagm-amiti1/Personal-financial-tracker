export type AuthUser = {
  id: string
  email: string
  displayName: string
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
