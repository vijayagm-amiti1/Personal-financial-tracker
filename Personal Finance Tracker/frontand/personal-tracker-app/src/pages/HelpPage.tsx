const helpSections = [
  {
    title: '1. Set up your accounts',
    body: 'Create the active bank, savings, cash, or wallet accounts you use. The account opening balance becomes the starting point for all future balance movement.',
  },
  {
    title: '2. Add categories before heavy usage',
    body: 'Create the expense and income categories you want to reuse in transactions, budgets, recurring items, and rule actions. Category color and icon choices help the app stay readable across pages.',
  },
  {
    title: '3. Record transactions correctly',
    body: 'Use Transactions for income, expense, and transfer activity. Goal contributions also move through the normal transaction flow so balance, reporting, and goal progress stay in sync.',
  },
  {
    title: '4. Create budgets for spending control',
    body: 'Budgets are monthly category-based limits. As expense transactions are added, the backend evaluates threshold and exceeded conditions and can generate alerts depending on your notification settings.',
  },
  {
    title: '5. Use goals for savings planning',
    body: 'Create goals with a linked account and target date. Contributions update both the account flow and the goal amount. Completed goals trigger progress and completion feedback across the app.',
  },
  {
    title: '6. Automate recurring activity',
    body: 'Recurring items define scheduled income or expense behavior. When the internal recurring process runs, due items create normal transactions and move the next run date forward.',
  },
  {
    title: '7. Add rules for smart suggestions',
    body: 'Rules let you define condition-action logic for category suggestions, tags, and alerts. These rules are managed on the dedicated Rules page, while transaction forms use them as live frontend auto-suggestions.',
  },
  {
    title: '8. Review forecast and health score',
    body: 'Dashboard forecasting estimates month-end balance, safe-to-spend amount, and upcoming recurring pressure. Financial Health summarizes savings rate, budget adherence, cash buffer, and expense stability.',
  },
  {
    title: '9. Improve your forecast quality',
    body: 'Keep transactions accurate, separate recurring items properly, and avoid leaving account balances stale. Forecasting becomes more useful when the app has clean balances, real expenses, and realistic recurring commitments.',
  },
  {
    title: '10. Improve your Financial Health Score',
    body: 'To improve the score, try to raise savings rate, stay within budgets, build stronger balances, reduce erratic monthly spending, and keep recurring obligations affordable compared with your income.',
  },
  {
    title: '11. Understand why the score drops',
    body: 'The score can fall when budgets are exceeded, savings shrink, balances become weak, or month-to-month expenses become unstable. Large unplanned spending can affect multiple parts of the score at once.',
  },
  {
    title: '12. Use Reports and Insights for analysis',
    body: 'Reports give month-wise operational views. Insights provides deeper comparisons such as income vs expense over months, category trends, net worth tracking, and readable findings about spending and saving changes.',
  },
  {
    title: '13. Read insight cards correctly',
    body: 'Insights are built from your stored transactions and balances. If history is too new or too limited, the app may show fewer findings. As more data is recorded, the comparisons become stronger and more meaningful.',
  },
  {
    title: '14. Manage account sharing carefully',
    body: 'Shared account permissions matter. View-only accounts may appear in visibility contexts but should not appear in write-action selectors such as transaction, recurring, or goal contribution forms.',
  },
  {
    title: '15. Configure notification behavior in Settings',
    body: 'Settings controls email delivery and specific notification families, including budget alerts, goal updates, target-date notifications, recurring communication, and layout preferences like desktop navigation style.',
  },
  {
    title: '16. Use support tools when something fails',
    body: 'Read FAQ for expected behavior, use Help for setup order, and use Report Issue when you need to describe a bug with page name, steps, expected result, and actual result.',
  },
]

function HelpPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Help</p>
          <h2>How to use this app effectively</h2>
        </div>
        <p className="page-description">
          Follow this sequence to set up the product properly and understand how the major workflows connect.
        </p>
      </header>

      <div className="support-stack">
        {helpSections.map((section) => (
          <article key={section.title} className="support-card">
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HelpPage
