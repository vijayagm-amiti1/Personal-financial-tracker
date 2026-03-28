export type ProductTourStep = {
  route: string
  selector: string
  title: string
  description: string
}

export const productTourSteps: ProductTourStep[] = [
  {
    route: '/dashboard',
    selector: '.dashboard-header',
    title: 'Dashboard',
    description:
      'This is your main overview page. It combines balances, forecast, recurring summary, health score, charts, and recent activity in one place.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-summary-cards"]',
    title: 'Dashboard Summary Cards',
    description:
      'These cards surface the most important numbers quickly, such as current balance, month income, month expense, projected month end, and safe-to-spend amount.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="add-transaction"]',
    title: 'Quick Add Transaction',
    description:
      'Use this shortcut to record an income, expense, or transfer quickly from anywhere in the product without navigating through multiple pages first.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-health-score"]',
    title: 'Financial Health Score',
    description:
      'This section explains overall financial quality using savings rate, budget adherence, cash buffer, and expense stability. It helps users understand why their score improved or dropped.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-forecast-panel"]',
    title: 'Cash Flow Forecast',
    description:
      'The forecast estimates projected end-of-month balance, safe-to-spend amount, and recurring payment pressure using known recurring schedules plus historical non-recurring spending.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-category-spending"]',
    title: 'Category-Wise Spending',
    description:
      'This chart shows the current month expense mix by category so users can quickly see where most money is going.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-income-expense"]',
    title: 'Income vs Expense Trend',
    description:
      'This section helps users compare day-wise income and expense movement in the current month and understand whether they are spending faster than they are earning.',
  },
  {
    route: '/dashboard',
    selector: '[data-tour="dashboard-recurring-summary"]',
    title: 'Recurring Summary',
    description:
      'This month recurring gives a compact view of scheduled recurring items in the current month and links to a deeper recurring month breakdown.',
  },
  {
    route: '/transactions',
    selector: '.page-header',
    title: 'Transactions',
    description:
      'This page is where users record and manage day-to-day money movement including income, expense, transfer, and goal-linked contribution flows.',
  },
  {
    route: '/budgets',
    selector: '.page-header',
    title: 'Budgets',
    description:
      'Budgets help users control monthly category spending. The app uses them for threshold and exceeded alerts as transactions are recorded.',
  },
  {
    route: '/budgets',
    selector: '[data-tour="budgets-summary-cards"]',
    title: 'Budget Overview',
    description:
      'These cards summarize budget plan count, planned amount, actual spent amount, near-limit budgets, and over-budget categories for the selected month.',
  },
  {
    route: '/budgets',
    selector: '[data-tour="budgets-form-panel"]',
    title: 'Budget Planning Form',
    description:
      'This is where users create or edit category budgets for a selected month and year. Budgets are month-specific and do not carry automatically.',
  },
  {
    route: '/budgets',
    selector: '[data-tour="budgets-plan-list"]',
    title: 'Budget Plans List',
    description:
      'The budget list shows each plan with category details, current spending progress, and available edit or delete actions.',
  },
  {
    route: '/goals',
    selector: '.page-header',
    title: 'Goals',
    description:
      'Goals help users plan savings targets and monitor progress toward them. Contributions stay connected with real account flow.',
  },
  {
    route: '/goals',
    selector: '[data-tour="goals-summary-cards"]',
    title: 'Goal Summary',
    description:
      'These summary cards show total saved, total target, upcoming goals, and completed goal counts to make the overall savings picture easy to read.',
  },
  {
    route: '/goals',
    selector: '[data-tour="goals-progress-chart"]',
    title: 'Goal Progress Chart',
    description:
      'This chart compares current goal progress against target amount so users can see which goals are on track and which goals need more funding.',
  },
  {
    route: '/goals',
    selector: '[data-tour="goals-list-panel"]',
    title: 'Goal List and Contributions',
    description:
      'This area lists goals by deadline and supports contribution actions so users can add money toward a goal from eligible accounts.',
  },
  {
    route: '/reports',
    selector: '.page-header',
    title: 'Reports',
    description:
      'Reports is the operational reporting area. It focuses on month-wise daily movement and category spending for selected filters.',
  },
  {
    route: '/reports',
    selector: '[data-tour="reports-filter-bar"]',
    title: 'Report Filters',
    description:
      'These controls let users narrow the report by account, month, year, and transaction type so the output matches the exact operational view they need.',
  },
  {
    route: '/reports',
    selector: '[data-tour="reports-income-expense-chart"]',
    title: 'Daily Income vs Expense',
    description:
      'This chart compares daily income and expense inside the selected month so users can inspect the monthly flow pattern clearly.',
  },
  {
    route: '/reports',
    selector: '[data-tour="reports-category-spending"]',
    title: 'Report Category Spending',
    description:
      'This section shows category-wise expense distribution for the current report selection and helps users study where spending is concentrated.',
  },
  {
    route: '/insights',
    selector: '.page-header',
    title: 'Insights',
    description:
      'Insights gives deeper financial analysis beyond monthly charts, including trend comparisons, net worth tracking, and readable observations.',
  },
  {
    route: '/insights',
    selector: '[data-tour="insights-summary-cards"]',
    title: 'Insights Summary',
    description:
      'These top cards show total income, total expense, current net worth, and current savings rate for the selected analysis range.',
  },
  {
    route: '/insights',
    selector: '[data-tour="insights-key-findings"]',
    title: 'Key Findings',
    description:
      'These insight cards convert raw financial data into readable findings such as rising food spending, improved savings, or other significant changes.',
  },
  {
    route: '/insights',
    selector: '[data-tour="insights-category-trends"]',
    title: 'Category Trends',
    description:
      'Category trends show how top spending categories move across time, giving a better long-term view than only looking at one current month.',
  },
  {
    route: '/insights',
    selector: '[data-tour="insights-net-worth"]',
    title: 'Net Worth Tracking',
    description:
      'This chart tracks overall balance movement across time so users can see whether their financial position is getting stronger or weaker.',
  },
  {
    route: '/rules',
    selector: '.page-header',
    title: 'Rules',
    description:
      'Rules automate category suggestions, tags, and alerts based on transaction conditions. They help reduce repetitive manual entry.',
  },
  {
    route: '/rules',
    selector: '[data-tour="rules-builder"]',
    title: 'Rule Builder',
    description:
      'This form is where users define a rule using condition field, operator, condition value, action type, action value, priority, and enabled state.',
  },
  {
    route: '/rules',
    selector: '[data-tour="rules-saved-list"]',
    title: 'Saved Rules',
    description:
      'Saved rules are listed here with readable summaries, priority order, enabled state, and quick edit or delete actions.',
  },
  {
    route: '/recurring',
    selector: '.page-header',
    title: 'Recurring',
    description:
      'Recurring items define scheduled income and expense rules that can later be processed into normal transactions by the internal recurring job.',
  },
  {
    route: '/recurring',
    selector: '[data-tour="recurring-month-overview"]',
    title: 'Recurring Month Overview',
    description:
      'This section gives a clearer monthly view of recurring entries, including dates, amounts, processed count, remaining count, and the recurring graph.',
  },
  {
    route: '/recurring',
    selector: '[data-tour="recurring-schedule-list"]',
    title: 'Recurring Schedule List',
    description:
      'The recurring schedule list stores each recurring plan with next run dates and lets users maintain ongoing commitments when they change.',
  },
  {
    route: '/accounts',
    selector: '.page-header',
    title: 'Accounts',
    description:
      'Accounts are the base for balances, forecasts, net worth, goal contributions, recurring flows, and sharing permissions.',
  },
  {
    route: '/accounts',
    selector: '[data-tour="accounts-summary-cards"]',
    title: 'Account Summary',
    description:
      'These cards show account count and total active balance so users can quickly understand how much money is currently represented inside the app.',
  },
  {
    route: '/accounts',
    selector: '[data-tour="accounts-list-panel"]',
    title: 'Account List and Access',
    description:
      'This panel shows opening balance, current balance, access role, and sharing actions. Access role affects which forms can actively use an account.',
  },
  {
    route: '/settings',
    selector: '.page-header',
    title: 'Settings',
    description:
      'Settings controls profile information, notification preferences, email behavior, layout choices, and access to rules management.',
  },
  {
    route: '/settings',
    selector: '[data-tour="settings-profile-panel"]',
    title: 'Profile and Notification Controls',
    description:
      'This section lets users update display name, navigation layout preference, and notification or email settings used by alerts and reports.',
  },
  {
    route: '/settings',
    selector: '[data-tour="settings-category-panel"]',
    title: 'Categories',
    description:
      'Categories are created here and reused throughout transactions, budgets, recurring items, charts, and insights, so they shape many reporting views.',
  },
  {
    route: '/settings',
    selector: '[data-tour="settings-rules-entry"]',
    title: 'Rules Entry from Settings',
    description:
      'Settings keeps a clean link into the dedicated Rules page so advanced automation can be managed without overcrowding the settings screen.',
  },
]
