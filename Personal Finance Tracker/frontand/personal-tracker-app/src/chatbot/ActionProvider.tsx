type CreateChatBotMessage = (message: string, options?: Record<string, unknown>) => unknown
type SetState = (stateUpdater: (prev: { messages: unknown[] }) => { messages: unknown[] }) => void

class ActionProvider {
  createChatBotMessage: CreateChatBotMessage
  setState: SetState
  createClientMessage: CreateChatBotMessage

  constructor(createChatBotMessage: CreateChatBotMessage, setStateFunc: SetState, createClientMessage: CreateChatBotMessage) {
    this.createChatBotMessage = createChatBotMessage
    this.setState = setStateFunc
    this.createClientMessage = createClientMessage
  }

  private addMessageToState(message: unknown) {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  }

  private reply(message: string, widget?: string) {
    this.addMessageToState(
      this.createChatBotMessage(message, widget ? { widget } : undefined),
    )
  }

  private replyStack(messages: string[], widget?: string) {
    messages.forEach((message, index) => {
      this.addMessageToState(
        this.createChatBotMessage(message, {
          ...(widget && index === messages.length - 1 ? { widget } : {}),
        }),
      )
    })
  }

  showWelcome = () => {
    this.replyStack(
      [
        'I can help with the major version 1 and post-version-1 workflows in Personal Finance Tracker.',
        'Ask about transactions, budgets, goals, recurring items, rules, shared accounts, forecast, health score, insights, Google login, FAQ, or support.',
      ],
      'mainOptions',
    )
  }

  showGettingStarted = () => {
    this.replyStack(
      [
        'Best setup order: Accounts -> Categories -> Transactions -> Budgets -> Goals -> Recurring -> Rules -> Reports and Insights.',
        'That sequence gives the app cleaner balances, better categorization, stronger forecast quality, and a more reliable Financial Health Score.',
      ],
      'gettingStartedOptions',
    )
  }

  showTransactions = () => {
    this.replyStack(
      [
        'Transactions support income, expense, transfer, and goal-contribution flows.',
        'Account selectors only show accounts the user can actively operate, and rule suggestions can auto-suggest category or tags while the form is being filled.',
        'If an old rule no longer matches after a field change, the previous auto-suggestion is cleared and the current matching rule is applied instead.',
      ],
      'transactionOptions',
    )
  }

  showBudgets = () => {
    this.replyStack(
      [
        'Budgets are monthly category limits and only expense activity affects them.',
        'Threshold and exceeded conditions can create in-app notifications and, when enabled in settings, email alerts too.',
      ],
      'budgetOptions',
    )
  }

  showGoals = () => {
    this.replyStack(
      [
        'Goals are linked to an account and progress through contributions.',
        'Contributions move through the normal transaction pipeline so balances, reports, and goal totals stay aligned.',
      ],
      'goalOptions',
    )
  }

  showReports = () => {
    this.replyStack(
      [
        'Reports focus on operational month views such as daily income vs expense and category spending.',
        'For deeper analysis like long-term trends, net worth, and readable findings, use the Insights page.',
      ],
      'reportOptions',
    )
  }

  showInsights = () => {
    this.replyStack(
      [
        'Insights adds advanced analysis: income vs expense over months, category trends, net worth tracking, and readable findings like rising spending or improved savings.',
        'If you do not see many insights yet, the usual reason is sparse or very new transaction history.',
      ],
      'insightOptions',
    )
  }

  showForecast = () => {
    this.replyStack(
      [
        'Cash Flow Forecast estimates projected end-of-month balance, upcoming recurring pressure, and safe-to-spend amount.',
        'It combines current balances, upcoming recurring transactions, and historical non-recurring spending behavior.',
        'If recurring obligations are not safely covered, the dashboard shows an insufficient recurring payments warning.',
      ],
      'forecastOptions',
    )
  }

  showFinancialHealth = () => {
    this.replyStack(
      [
        'Financial Health Score is a weighted score built from savings rate, budget adherence, cash buffer, and expense stability.',
        'It usually improves when savings rise, budgets are respected, balances stay stronger, and spending becomes less erratic.',
        'It often falls when expenses rise too fast, budgets are exceeded, cash reserves weaken, or spending becomes unstable month to month.',
      ],
      'financialHealthOptions',
    )
  }

  showRecurring = () => {
    this.replyStack(
      [
        'Recurring items define scheduled income or expense behavior.',
        'When the internal recurring job runs on or after the next run date, it creates a normal transaction and marks that transaction as recurring-generated for reporting and forecast logic.',
        'The dedicated month view helps users review what is already done this month and what is still upcoming.',
      ],
      'recurringOptions',
    )
  }

  showRules = () => {
    this.replyStack(
      [
        'Rules let users automate categorization, tags, and alerts through condition-action logic.',
        'Rules are managed on the separate Rules page, while the transaction form uses them as live frontend auto-suggestions.',
        'For the same condition and same action type, conflicting alternate action values are not allowed, which keeps rule behavior predictable.',
      ],
      'ruleOptions',
    )
  }

  showAccounts = () => {
    this.replyStack(
      [
        'Accounts drive most money movement in the app and are also the base for balance, forecast, and net-worth views.',
        'Shared accounts support roles, and view-only members should not be able to pick those accounts in write-action forms.',
      ],
      'accountOptions',
    )
  }

  showSharing = () => {
    this.replyStack(
      [
        'Account sharing supports invites and role-based access.',
        'Owners can manage and use the account in write flows, while view-only users can see the account but cannot use it for transactions, recurring items, or goal contributions.',
      ],
      'sharingOptions',
    )
  }

  showSettings = () => {
    this.replyStack(
      [
        'Settings controls profile details, notification preferences, email behavior, and layout choices.',
        'Rules are not edited directly in Settings. Settings only gives entry into the dedicated Rules management page.',
      ],
      'settingsOptions',
    )
  }

  showAuth = () => {
    this.replyStack(
      [
        'The app supports password login and Google login.',
        'Sessions are backend cookie-based. If login succeeds and `/api/auth/me` still returns unauthorized, the usual cause is cookie or OAuth session handoff, not the login button itself.',
      ],
      'authOptions',
    )
  }

  showSupport = () => {
    this.replyStack(
      [
        'Use FAQ when you want expected behavior, Help when you want setup guidance, and Report Issue when you need to send a detailed bug report.',
        'Good issue reports include page name, steps, expected result, and actual result.',
      ],
      'supportOptions',
    )
  }

  showNavigationHelp = () => {
    this.reply(
      'Use the quick links below to jump directly into the right module.',
      'quickLinks',
    )
  }

  showScoreTips = () => {
    this.replyStack(
      [
        'Fast ways to improve the Financial Health Score: keep transactions accurate, reduce avoidable spending, stay within budgets, keep recurring commitments realistic, and build stronger balances.',
        'The score does not move from one tiny action alone. It usually changes when patterns improve across savings, budget usage, and balance health.',
      ],
      'financialHealthOptions',
    )
  }

  showForecastQuality = () => {
    this.replyStack(
      [
        'Forecast quality improves when current balances are accurate, recurring schedules are correct, and manual spending is recorded consistently.',
        'New users or sparse-history users may see simpler fallback forecasting until enough data is available.',
      ],
      'forecastOptions',
    )
  }

  showFallback = () => {
    this.reply(
      'I did not match that clearly. Try topics like transactions, rules, recurring, forecast, health score, insights, shared accounts, Google login, FAQ, or support.',
      'mainOptions',
    )
  }
}

export default ActionProvider
