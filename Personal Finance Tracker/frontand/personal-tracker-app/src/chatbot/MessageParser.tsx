class MessageParser {
  actionProvider: {
    showTransactions: () => void
    showBudgets: () => void
    showGoals: () => void
    showReports: () => void
    showRecurring: () => void
    showAccounts: () => void
    showSettings: () => void
    showSupport: () => void
    showGettingStarted: () => void
    showNavigationHelp: () => void
    showFallback: () => void
  }

  constructor(actionProvider: MessageParser['actionProvider']) {
    this.actionProvider = actionProvider
  }

  parse(message: string) {
    const normalized = message.trim().toLowerCase()

    if (normalized.includes('transaction')) return this.actionProvider.showTransactions()
    if (normalized.includes('budget')) return this.actionProvider.showBudgets()
    if (normalized.includes('goal')) return this.actionProvider.showGoals()
    if (normalized.includes('report')) return this.actionProvider.showReports()
    if (normalized.includes('recurring')) return this.actionProvider.showRecurring()
    if (normalized.includes('account')) return this.actionProvider.showAccounts()
    if (normalized.includes('setting') || normalized.includes('profile') || normalized.includes('category')) return this.actionProvider.showSettings()
    if (normalized.includes('help') || normalized.includes('faq') || normalized.includes('issue') || normalized.includes('support')) return this.actionProvider.showSupport()
    if (normalized.includes('start') || normalized.includes('begin')) return this.actionProvider.showGettingStarted()
    if (normalized.includes('page') || normalized.includes('navigate')) return this.actionProvider.showNavigationHelp()

    this.actionProvider.showFallback()
  }
}

export default MessageParser
