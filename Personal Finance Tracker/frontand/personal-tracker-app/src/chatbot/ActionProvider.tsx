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

  showWelcome = () => {
    this.addMessageToState(
      this.createChatBotMessage('Choose a help topic below. I can guide you through the main flows in this app.', {
        widget: 'mainOptions',
      }),
    )
  }

  showGettingStarted = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Start with Accounts, then add Categories, then record Transactions. After that you can create Budgets, Goals, and Recurring plans.',
        { widget: 'quickLinks' },
      ),
    )
  }

  showTransactions = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Open Transactions, click Add Transaction, choose type, amount, date, account, and category, then save. Expense transactions can also update budget alerts automatically.',
        { widget: 'transactionOptions' },
      ),
    )
  }

  showBudgets = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Budgets are monthly category plans. Create a budget for a category, set the amount and alert threshold, then expense transactions in the same month and category will update the spend.',
        { widget: 'budgetOptions' },
      ),
    )
  }

  showGoals = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Goals are linked to an account. Create the goal with target amount and date, then contribute money from an account to move the current amount forward.',
        { widget: 'goalOptions' },
      ),
    )
  }

  showReports = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Reports use active-account transactions to show daily income and expense trends plus category spending for the selected month and account filter.',
        { widget: 'reportOptions' },
      ),
    )
  }

  showRecurring = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Recurring items create scheduled income or expense transactions. When processed on or after next run date, they create a normal transaction and continue the same account, budget, and notification flow.',
        { widget: 'recurringOptions' },
      ),
    )
  }

  showAccounts = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Accounts hold opening and current balance. Opening balance is fixed at creation. Deleting an account hides it from active flows while preserving history where needed.',
        { widget: 'accountOptions' },
      ),
    )
  }

  showSettings = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Settings let you update your display name, notification preferences, and create categories directly from one place.',
        { widget: 'settingsOptions' },
      ),
    )
  }

  showSupport = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'If you are stuck, open FAQ, Help, or Report Issue from the profile menu. Report Issue sends your message to support email from inside the app.',
        { widget: 'supportOptions' },
      ),
    )
  }

  showNavigationHelp = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'Use the quick links below to jump directly to the page you need, or go back to the main help topics.',
        { widget: 'quickLinks' },
      ),
    )
  }

  showFallback = () => {
    this.addMessageToState(
      this.createChatBotMessage(
        'I did not match that request. Use the options below and I will guide you to the right area.',
        { widget: 'mainOptions' },
      ),
    )
  }
}

export default ActionProvider
