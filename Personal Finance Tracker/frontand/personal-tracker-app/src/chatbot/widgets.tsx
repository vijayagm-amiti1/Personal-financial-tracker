import { ArrowRight, BarChart3, Bell, CircleHelp, FolderKanban, Goal, Repeat, Settings, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Option = {
  label: string
  caption?: string
  icon?: typeof Wallet
  onClick?: () => void
  to?: string
}

function OptionList({ options }: { options: Option[] }) {
  const navigate = useNavigate()

  return (
    <div className="chatbot-option-list">
      {options.map((option) => {
        const Icon = option.icon

        return (
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
            <span className="chatbot-option-label-row">
              {Icon ? <Icon size={16} strokeWidth={2.2} /> : null}
              <span>{option.label}</span>
            </span>
            {option.caption ? <span className="chatbot-option-caption">{option.caption}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

function BackToTopics({ actionProvider }: { actionProvider: Record<string, () => void> }): Option {
  return { label: 'Back to Topics', caption: 'Return to the main help topics', icon: ArrowRight, onClick: actionProvider.showWelcome }
}

export function MainOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return (
    <OptionList
      options={[
        { label: 'Getting Started', caption: 'Best setup order for the app', icon: Sparkles, onClick: actionProvider.showGettingStarted },
        { label: 'Transactions', caption: 'Income, expense, transfer, and suggestions', icon: Wallet, onClick: actionProvider.showTransactions },
        { label: 'Rules', caption: 'Automation, tags, and category suggestions', icon: Settings, onClick: actionProvider.showRules },
        { label: 'Recurring', caption: 'Scheduled income and expenses', icon: Repeat, onClick: actionProvider.showRecurring },
        { label: 'Cash Flow Forecast', caption: 'Safe to spend and projected balance', icon: BarChart3, onClick: actionProvider.showForecast },
        { label: 'Health Score', caption: 'Savings rate, cash buffer, and score tips', icon: ShieldCheck, onClick: actionProvider.showFinancialHealth },
        { label: 'Insights', caption: 'Trends, net worth, and comparisons', icon: FolderKanban, onClick: actionProvider.showInsights },
        { label: 'Shared Accounts', caption: 'Invites, owner role, and viewer role', icon: Goal, onClick: actionProvider.showSharing },
        { label: 'Login & Google Auth', caption: 'Session and sign-in help', icon: ShieldCheck, onClick: actionProvider.showAuth },
        { label: 'Support', caption: 'FAQ, Help, and Report Issue', icon: CircleHelp, onClick: actionProvider.showSupport },
      ]}
    />
  )
}

export function QuickLinks() {
  return (
    <OptionList
      options={[
        { label: 'Dashboard', caption: 'Forecast and health score', icon: BarChart3, to: '/dashboard' },
        { label: 'Transactions', caption: 'View and add transactions', icon: Wallet, to: '/transactions' },
        { label: 'Budgets', caption: 'Monthly category limits', icon: Bell, to: '/budgets' },
        { label: 'Goals', caption: 'Savings targets and contributions', icon: Goal, to: '/goals' },
        { label: 'Insights', caption: 'Advanced reports and findings', icon: FolderKanban, to: '/insights' },
        { label: 'Rules', caption: 'Manage automation rules', icon: Settings, to: '/rules' },
        { label: 'Recurring', caption: 'Manage recurring items', icon: Repeat, to: '/recurring' },
        { label: 'Accounts', caption: 'Balances and account sharing', icon: Wallet, to: '/accounts' },
        { label: 'Settings', caption: 'Notifications and preferences', icon: Settings, to: '/settings' },
      ]}
    />
  )
}

export function GettingStartedOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Accounts', caption: 'Start with active money sources', icon: Wallet, to: '/accounts' }, { label: 'Open Transactions', caption: 'Begin recording real activity', icon: Wallet, to: '/transactions' }, { label: 'Open Help', caption: 'Read full setup guidance', icon: CircleHelp, to: '/help' }, BackToTopics({ actionProvider })]} />
}

export function TransactionOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Transactions', caption: 'Review your transaction history', icon: Wallet, to: '/transactions' }, { label: 'Add Transaction', caption: 'Create a new income or expense', icon: Wallet, to: '/transactions/new' }, { label: 'Open Rules', caption: 'Review live rule suggestions', icon: Settings, to: '/rules' }, BackToTopics({ actionProvider })]} />
}

export function BudgetOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Budgets', caption: 'Monthly category limits', icon: Bell, to: '/budgets' }, { label: 'Open Reports', caption: 'Operational spending reports', icon: BarChart3, to: '/reports' }, BackToTopics({ actionProvider })]} />
}

export function GoalOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Goals', caption: 'See active goals and progress', icon: Goal, to: '/goals' }, { label: 'Create Goal', caption: 'Add a new target', icon: Goal, to: '/goals/new' }, BackToTopics({ actionProvider })]} />
}

export function ReportOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Reports', caption: 'Operational report views', icon: BarChart3, to: '/reports' }, { label: 'Open Insights', caption: 'Trend comparisons and findings', icon: FolderKanban, to: '/insights' }, { label: 'Dashboard', caption: 'Forecast and score summary', icon: BarChart3, to: '/dashboard' }, BackToTopics({ actionProvider })]} />
}

export function InsightOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Insights', caption: 'Advanced analysis page', icon: FolderKanban, to: '/insights' }, { label: 'Open Reports', caption: 'Monthly operational reports', icon: BarChart3, to: '/reports' }, { label: 'Dashboard', caption: 'Quick overview cards', icon: BarChart3, to: '/dashboard' }, BackToTopics({ actionProvider })]} />
}

export function ForecastOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Dashboard', caption: 'Forecast lives on the dashboard', icon: BarChart3, to: '/dashboard' }, { label: 'Open Recurring', caption: 'Review upcoming recurring items', icon: Repeat, to: '/recurring' }, { label: 'Open FAQ', caption: 'Read forecast explanations', icon: CircleHelp, to: '/faq' }, BackToTopics({ actionProvider })]} />
}

export function FinancialHealthOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Dashboard', caption: 'See the score widget', icon: ShieldCheck, to: '/dashboard' }, { label: 'Open Insights', caption: 'Compare trends behind the score', icon: FolderKanban, to: '/insights' }, { label: 'Open Help', caption: 'Read score improvement tips', icon: CircleHelp, to: '/help' }, BackToTopics({ actionProvider })]} />
}

export function RecurringOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Recurring', caption: 'Manage recurring schedules', icon: Repeat, to: '/recurring' }, { label: 'Open Accounts', caption: 'Review linked account access', icon: Wallet, to: '/accounts' }, BackToTopics({ actionProvider })]} />
}

export function RuleOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Rules', caption: 'Create, edit, disable, and delete rules', icon: Settings, to: '/rules' }, { label: 'Open Transactions', caption: 'See rule suggestions in forms', icon: Wallet, to: '/transactions' }, { label: 'Open Settings', caption: 'Rules entry is linked from settings', icon: Settings, to: '/settings' }, BackToTopics({ actionProvider })]} />
}

export function AccountOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Accounts', caption: 'Balances, members, and ownership', icon: Wallet, to: '/accounts' }, { label: 'Open Settings', caption: 'Preferences and notification controls', icon: Settings, to: '/settings' }, BackToTopics({ actionProvider })]} />
}

export function SharingOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Accounts', caption: 'Manage shared account access', icon: Wallet, to: '/accounts' }, { label: 'Open FAQ', caption: 'Read owner vs viewer behavior', icon: CircleHelp, to: '/faq' }, BackToTopics({ actionProvider })]} />
}

export function SettingsOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Settings', caption: 'Profile, notifications, and layout', icon: Settings, to: '/settings' }, { label: 'Open Rules', caption: 'Enter the separate rules manager', icon: Settings, to: '/rules' }, { label: 'Report Issue', caption: 'Send a bug report', icon: CircleHelp, to: '/report-issue' }, BackToTopics({ actionProvider })]} />
}

export function AuthOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'Open Login', caption: 'Return to login screen', icon: ShieldCheck, to: '/login' }, { label: 'Open FAQ', caption: 'Read login and Google auth help', icon: CircleHelp, to: '/faq' }, { label: 'Report Issue', caption: 'Send sign-in issue details', icon: CircleHelp, to: '/report-issue' }, BackToTopics({ actionProvider })]} />
}

export function SupportOptions({ actionProvider }: { actionProvider: Record<string, () => void> }) {
  return <OptionList options={[{ label: 'FAQ', caption: 'Expected behavior and product answers', icon: CircleHelp, to: '/faq' }, { label: 'Help Page', caption: 'Guided product usage', icon: CircleHelp, to: '/help' }, { label: 'Report Issue', caption: 'Submit a bug report', icon: CircleHelp, to: '/report-issue' }, BackToTopics({ actionProvider })]} />
}
