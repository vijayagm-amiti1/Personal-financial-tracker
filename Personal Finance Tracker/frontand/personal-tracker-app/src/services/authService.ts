import axios from 'axios'
import type {
  AuthUser,
  CompleteSignupPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from '../types/auth'
import { API_BASE_URL } from '../config/env'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/oauth2/authorization/google`
}

function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim() !== '') {
      return message
    }
  }
  return 'Request failed.'
}

export async function register(payload: RegisterPayload) {
  try {
    const response = await api.post('/api/auth/register', payload)
    return response.data as { message: string }
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  try {
    const response = await api.post('/api/auth/verify-otp', payload)
    return response.data as { message: string }
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function completeSignup(payload: CompleteSignupPayload) {
  try {
    const response = await api.post('/api/auth/complete-signup', payload)
    return response.data as { message: string }
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function login(payload: LoginPayload) {
  try {
    const response = await api.post('/api/auth/login', payload)
    return response.data as AuthUser
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function me() {
  try {
    const response = await api.get('/api/auth/me')
    return response.data as AuthUser
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw new Error(extractErrorMessage(error))
  }
}

export async function logout() {
  try {
    await api.post('/api/auth/logout')
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  try {
    const response = await api.post('/api/auth/forgot-password', payload)
    return response.data as { message: string }
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function resetPassword(payload: ResetPasswordPayload) {
  try {
    const response = await api.post('/api/auth/reset-password', payload)
    return response.data as { message: string }
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
