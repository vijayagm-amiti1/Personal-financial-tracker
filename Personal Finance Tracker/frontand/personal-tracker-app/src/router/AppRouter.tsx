import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import ProtectedRoute from '../auth/ProtectedRoute'
import PublicOnlyRoute from '../auth/PublicOnlyRoute'
import BudgetsPage from '../pages/BudgetsPage'
import AppShell from '../layout/AppShell'
import AccountsPage from '../pages/AccountsPage'
import AboutPage from '../pages/AboutPage'
import CompleteSignupPage from '../pages/CompleteSignupPage'
import DashboardPage from '../pages/DashboardPage'
import FaqPage from '../pages/FaqPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import GoalCreatePage from '../pages/GoalCreatePage'
import GoogleAuthCallbackPage from '../pages/GoogleAuthCallbackPage'
import GoalsPage from '../pages/GoalsPage'
import HelpPage from '../pages/HelpPage'
import LoginPage from '../pages/LoginPage'
import ReportIssuePage from '../pages/ReportIssuePage'
import ReportsPage from '../pages/ReportsPage'
import RecurringPage from '../pages/RecurringPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import SettingsPage from '../pages/SettingsPage'
import SignupPage from '../pages/SignupPage'
import TransactionsPage from '../pages/TransactionsPage'
import TransactionCreatePage from '../pages/TransactionCreatePage'
import VerifyOtpPage from '../pages/VerifyOtpPage'

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/complete-signup" element={<CompleteSignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="transactions/new" element={<TransactionCreatePage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="goals/new" element={<GoalCreatePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="recurring" element={<RecurringPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="report-issue" element={<ReportIssuePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AppRouter
