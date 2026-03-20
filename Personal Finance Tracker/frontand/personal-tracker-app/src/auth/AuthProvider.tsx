import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import type {
  AuthUser,
  CompleteSignupPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from '../types/auth'
import { clearDevelopmentStorage, setStoredUser } from '../utils/devStorage'

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  refreshUser: () => Promise<AuthUser | null>
  register: (payload: RegisterPayload) => Promise<string>
  verifyOtp: (payload: VerifyOtpPayload) => Promise<string>
  completeSignup: (payload: CompleteSignupPayload) => Promise<string>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<string>
  resetPassword: (payload: ResetPasswordPayload) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const currentUser = await authService.me()
    setUser(currentUser)
    if (currentUser) {
      setStoredUser(currentUser)
    } else {
      clearDevelopmentStorage()
    }
    return currentUser
  }

  useEffect(() => {
    let active = true
    void refreshUser()
      .then(() => {
        if (!active) {
          return
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    refreshUser,
    register: async (payload) => (await authService.register(payload)).message,
    verifyOtp: async (payload) => (await authService.verifyOtp(payload)).message,
    completeSignup: async (payload) => (await authService.completeSignup(payload)).message,
    login: async (payload) => {
      const authenticatedUser = await authService.login(payload)
      setUser(authenticatedUser)
      setStoredUser(authenticatedUser)
    },
    logout: async () => {
      await authService.logout()
      setUser(null)
      clearDevelopmentStorage()
    },
    forgotPassword: async (payload) => (await authService.forgotPassword(payload)).message,
    resetPassword: async (payload) => (await authService.resetPassword(payload)).message,
  }), [isLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
