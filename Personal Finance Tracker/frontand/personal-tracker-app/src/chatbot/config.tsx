import { createChatBotMessage } from 'react-chatbot-kit'
import {
  AccountOptions,
  BudgetOptions,
  GoalOptions,
  MainOptions,
  QuickLinks,
  RecurringOptions,
  ReportOptions,
  SettingsOptions,
  SupportOptions,
  TransactionOptions,
} from './widgets'

const botName = 'Tracker Help'

const config: any = {
  botName,
  initialMessages: [
    createChatBotMessage('Need help using Personal Finance Tracker?', {
      widget: 'mainOptions',
      delay: 250,
    }),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#1153c2',
    },
    chatButton: {
      backgroundColor: '#1153c2',
    },
  },
  customComponents: {
    header: () => <div className="chatbot-custom-header">{botName}</div>,
  },
  widgets: [
    { widgetName: 'mainOptions', widgetFunc: (props: any) => <MainOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'quickLinks', widgetFunc: () => <QuickLinks />, props: [], mapStateToProps: [] },
    { widgetName: 'transactionOptions', widgetFunc: (props: any) => <TransactionOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'budgetOptions', widgetFunc: (props: any) => <BudgetOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'goalOptions', widgetFunc: (props: any) => <GoalOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'reportOptions', widgetFunc: (props: any) => <ReportOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'recurringOptions', widgetFunc: (props: any) => <RecurringOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'accountOptions', widgetFunc: (props: any) => <AccountOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'settingsOptions', widgetFunc: (props: any) => <SettingsOptions {...props} />, props: [], mapStateToProps: [] },
    { widgetName: 'supportOptions', widgetFunc: (props: any) => <SupportOptions {...props} />, props: [], mapStateToProps: [] },
  ],
}

export default config
