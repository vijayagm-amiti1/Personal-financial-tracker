import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BudgetsPage from '../pages/BudgetsPage'
import AppShell from '../layout/AppShell'
import GoalCreatePage from '../pages/GoalCreatePage'
import GoalsPage from '../pages/GoalsPage'
import ModulePlaceholderPage from '../pages/ModulePlaceholderPage'
import ReportsPage from '../pages/ReportsPage'
import TransactionsPage from '../pages/TransactionsPage'
import TransactionCreatePage from '../pages/TransactionCreatePage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ModulePlaceholderPage
                title="Dashboard"
                description="Financial summary, quick actions, recent transactions, and goal progress will live here."
              />
            }
          />
          <Route
            path="transactions"
            element={<TransactionsPage />}
          />
          <Route path="transactions/new" element={<TransactionCreatePage />} />
          <Route
            path="budgets"
            element={<BudgetsPage />}
          />
          <Route
            path="goals"
            element={<GoalsPage />}
          />
          <Route path="goals/new" element={<GoalCreatePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route
            path="recurring"
            element={
              <ModulePlaceholderPage
                title="Recurring"
                description="Recurring bills, salary rules, and upcoming schedules will be managed here."
              />
            }
          />
          <Route
            path="accounts"
            element={
              <ModulePlaceholderPage
                title="Accounts"
                description="Account balances, wallets, and transfer tools will be available here."
              />
            }
          />
          <Route
            path="settings"
            element={
              <ModulePlaceholderPage
                title="Settings"
                description="Profile, preferences, notification rules, and session controls will be configured here."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
