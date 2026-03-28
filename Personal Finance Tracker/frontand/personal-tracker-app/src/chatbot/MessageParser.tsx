class MessageParser {
  actionProvider: {
    showTransactions: () => void
    showBudgets: () => void
    showGoals: () => void
    showReports: () => void
    showInsights: () => void
    showForecast: () => void
    showFinancialHealth: () => void
    showRecurring: () => void
    showRules: () => void
    showAccounts: () => void
    showSharing: () => void
    showSettings: () => void
    showAuth: () => void
    showSupport: () => void
    showGettingStarted: () => void
    showNavigationHelp: () => void
    showScoreTips: () => void
    showForecastQuality: () => void
    showFallback: () => void
  }

  constructor(actionProvider: MessageParser['actionProvider']) {
    this.actionProvider = actionProvider
  }

  parse(message: string) {
    const normalized = message.trim().toLowerCase()

    if (
      normalized.includes('forecast') ||
      normalized.includes('cash flow') ||
      normalized.includes('safe to spend') ||
      normalized.includes('projected balance') ||
      normalized.includes('recurring payment warning')
    ) {
      return this.actionProvider.showForecast()
    }

    if (
      normalized.includes('forecast quality') ||
      normalized.includes('forecast wrong') ||
      normalized.includes('forecast issue') ||
      normalized.includes('why forecast')
    ) {
      return this.actionProvider.showForecastQuality()
    }

    if (
      normalized.includes('health score') ||
      normalized.includes('financial health') ||
      normalized.includes('score improve') ||
      normalized.includes('score drop') ||
      normalized.includes('savings rate') ||
      normalized.includes('cash buffer') ||
      normalized.includes('expense stability')
    ) {
      return this.actionProvider.showFinancialHealth()
    }

    if (
      normalized.includes('improve score') ||
      normalized.includes('score tips') ||
      normalized.includes('better score')
    ) {
      return this.actionProvider.showScoreTips()
    }

    if (
      normalized.includes('insight') ||
      normalized.includes('net worth') ||
      normalized.includes('trend') ||
      normalized.includes('income vs expense')
    ) {
      return this.actionProvider.showInsights()
    }

    if (
      normalized.includes('transaction') ||
      normalized.includes('expense') ||
      normalized.includes('income') ||
      normalized.includes('transfer') ||
      normalized.includes('goal contribution')
    ) {
      return this.actionProvider.showTransactions()
    }

    if (normalized.includes('budget')) return this.actionProvider.showBudgets()
    if (normalized.includes('goal')) return this.actionProvider.showGoals()
    if (normalized.includes('report')) return this.actionProvider.showReports()
    if (normalized.includes('recurring')) return this.actionProvider.showRecurring()

    if (
      normalized.includes('rule') ||
      normalized.includes('tag') ||
      normalized.includes('categor') ||
      normalized.includes('auto suggestion') ||
      normalized.includes('automation')
    ) {
      return this.actionProvider.showRules()
    }

    if (
      normalized.includes('share') ||
      normalized.includes('invite') ||
      normalized.includes('viewer') ||
      normalized.includes('owner role') ||
      normalized.includes('view role')
    ) {
      return this.actionProvider.showSharing()
    }

    if (normalized.includes('account')) return this.actionProvider.showAccounts()

    if (
      normalized.includes('setting') ||
      normalized.includes('profile') ||
      normalized.includes('notification') ||
      normalized.includes('email alert')
    ) {
      return this.actionProvider.showSettings()
    }

    if (
      normalized.includes('login') ||
      normalized.includes('logout') ||
      normalized.includes('google') ||
      normalized.includes('auth') ||
      normalized.includes('password') ||
      normalized.includes('/api/auth/me') ||
      normalized.includes('unauthorized')
    ) {
      return this.actionProvider.showAuth()
    }

    if (
      normalized.includes('help') ||
      normalized.includes('faq') ||
      normalized.includes('issue') ||
      normalized.includes('support') ||
      normalized.includes('bug')
    ) {
      return this.actionProvider.showSupport()
    }

    if (
      normalized.includes('start') ||
      normalized.includes('begin') ||
      normalized.includes('setup') ||
      normalized.includes('first step')
    ) {
      return this.actionProvider.showGettingStarted()
    }

    if (
      normalized.includes('page') ||
      normalized.includes('navigate') ||
      normalized.includes('where') ||
      normalized.includes('open')
    ) {
      return this.actionProvider.showNavigationHelp()
    }

    this.actionProvider.showFallback()
  }
}

export default MessageParser
