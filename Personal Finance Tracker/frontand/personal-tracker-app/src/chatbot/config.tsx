import { createChatBotMessage } from 'react-chatbot-kit'
import {
  AccountOptions,
  AuthOptions,
  BudgetOptions,
  FinancialHealthOptions,
  ForecastOptions,
  GettingStartedOptions,
  GoalOptions,
  InsightOptions,
  MainOptions,
  QuickLinks,
  RecurringOptions,
  ReportOptions,
  RuleOptions,
  SettingsOptions,
  SharingOptions,
  SupportOptions,
  TransactionOptions,
} from './widgets'

const botName = 'Tracker Guide'

const config: any = {
  botName,
  initialMessages: [
    createChatBotMessage('Need help with the newer modules added after version 1?', {
      delay: 200,
    }),
    createChatBotMessage('I can guide you through rules, recurring items, shared accounts, cash flow forecast, Financial Health Score, insights, Google login, FAQ, and support tools.', {
      delay: 420,
    }),
    createChatBotMessage('Pick a topic or ask in plain language, for example: "why did my health score drop?" or "how does recurring affect forecast?"', {
      widget: 'mainOptions',
      delay: 680,
    }),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#0e2e64',
    },
    chatButton: {
      backgroundColor: '#1e66db',
    },
  },
  customComponents: {
    header: () => (
      <div className="chatbot-custom-header">
        <div className="chatbot-header-copy">
          <strong>{botName}</strong>
          <span>Feature help for the latest app flows</span>
        </div>
      </div>
    ),
  },
  widgets: [
    { widgetName: 'mainOptions', widgetFunc: (props: any) => <MainOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'quickLinks', widgetFunc: () => <QuickLinks />, props: [], mapStateToProps: [] },
    { widgetName: 'gettingStartedOptions', widgetFunc: (props: any) => <GettingStartedOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'transactionOptions', widgetFunc: (props: any) => <TransactionOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'budgetOptions', widgetFunc: (props: any) => <BudgetOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'goalOptions', widgetFunc: (props: any) => <GoalOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'reportOptions', widgetFunc: (props: any) => <ReportOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'insightOptions', widgetFunc: (props: any) => <InsightOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'forecastOptions', widgetFunc: (props: any) => <ForecastOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'financialHealthOptions', widgetFunc: (props: any) => <FinancialHealthOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'recurringOptions', widgetFunc: (props: any) => <RecurringOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'ruleOptions', widgetFunc: (props: any) => <RuleOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'accountOptions', widgetFunc: (props: any) => <AccountOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'sharingOptions', widgetFunc: (props: any) => <SharingOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'settingsOptions', widgetFunc: (props: any) => <SettingsOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'authOptions', widgetFunc: (props: any) => <AuthOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'supportOptions', widgetFunc: (props: any) => <SupportOptions {...props} />, props: [], mapStateToProps: [] },
  ],
}

export default config
