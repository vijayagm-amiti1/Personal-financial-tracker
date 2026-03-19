const helpSections = [
  {
    title: '1. Create accounts first',
    body: 'Go to Accounts, create your bank, cash, or savings accounts, and set the opening balance once.',
  },
  {
    title: '2. Add categories and transactions',
    body: 'Use Transactions to record income, expense, transfers, and goal contributions with the right account and category.',
  },
  {
    title: '3. Create budgets',
    body: 'Open Budgets and assign a monthly limit for each expense category you want to monitor.',
  },
  {
    title: '4. Track goals',
    body: 'Create savings goals linked to an account so contributions and goal completion stay visible.',
  },
  {
    title: '5. Configure recurring items',
    body: 'Use Recurring for monthly bills or planned income so the daily recurring job can create transactions automatically.',
  },
  {
    title: '6. Use reports and notifications',
    body: 'Reports show month-wise movement and category spend. Notifications highlight budget alerts, goal completion, and recurring reminders.',
  },
]

function HelpPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Help</p>
          <h2>How to use this app</h2>
        </div>
        <p className="page-description">
          Follow this order if you are setting up from zero or testing a fresh account.
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
