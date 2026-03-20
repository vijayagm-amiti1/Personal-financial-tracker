import { useNavigate } from 'react-router-dom'

type Option = {
  label: string
  onClick?: () => void
  to?: string
}

function OptionList({ options }: { options: Option[] }) {
  const navigate = useNavigate()

  return (
    <div className="chatbot-option-list">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          className="chatbot-option-button"
          onClick={() => {
            if (option.to) {
              navigate(option.to)
              return
            }
            option.onClick?.()
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function MainOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return (
    <OptionList
      options={[
        { label: 'Getting Started', onClick: actionProvider.showGettingStarted },
        { label: 'Transactions', onClick: actionProvider.showTransactions },
        { label: 'Budgets', onClick: actionProvider.showBudgets },
        { label: 'Goals', onClick: actionProvider.showGoals },
        { label: 'Reports', onClick: actionProvider.showReports },
        { label: 'Recurring', onClick: actionProvider.showRecurring },
        { label: 'Accounts', onClick: actionProvider.showAccounts },
        { label: 'Settings', onClick: actionProvider.showSettings },
        { label: 'Support', onClick: actionProvider.showSupport },
      ]}
    />
  )
}

export function QuickLinks() {
  return (
    <OptionList
      options={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Transactions', to: '/transactions' },
        { label: 'Budgets', to: '/budgets' },
        { label: 'Goals', to: '/goals' },
        { label: 'Reports', to: '/reports' },
        { label: 'Settings', to: '/settings' },
      ]}
    />
  )
}

function BackToTopics({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return { label: 'Back to Topics', onClick: actionProvider.showWelcome }
}

export function TransactionOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Transactions', to: '/transactions' }, { label: 'Add Transaction', to: '/transactions/new' }, BackToTopics({ actionProvider })]} />
}

export function BudgetOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Budgets', to: '/budgets' }, { label: 'Open Reports', to: '/reports' }, BackToTopics({ actionProvider })]} />
}

export function GoalOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Goals', to: '/goals' }, { label: 'Create Goal', to: '/goals/new' }, BackToTopics({ actionProvider })]} />
}

export function ReportOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Reports', to: '/reports' }, { label: 'Dashboard Summary', to: '/dashboard' }, BackToTopics({ actionProvider })]} />
}

export function RecurringOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Recurring', to: '/recurring' }, { label: 'Open Accounts', to: '/accounts' }, BackToTopics({ actionProvider })]} />
}

export function AccountOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Accounts', to: '/accounts' }, { label: 'Open Settings', to: '/settings' }, BackToTopics({ actionProvider })]} />
}

export function SettingsOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Settings', to: '/settings' }, { label: 'Report Issue', to: '/report-issue' }, BackToTopics({ actionProvider })]} />
}

export function SupportOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'FAQ', to: '/faq' }, { label: 'Help Page', to: '/help' }, { label: 'Report Issue', to: '/report-issue' }, BackToTopics({ actionProvider })]} />
}
