function AboutPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">About</p>
          <h2>About Personal Finance Tracker</h2>
        </div>
        <p className="page-description">
          This app is built to keep day-to-day money tracking simple: clear accounts, disciplined budgets,
          visible goals, recurring payments, reports, and notifications in one place.
        </p>
      </header>

      <div className="support-page-grid">
        <article className="support-card">
          <h3>What this app covers</h3>
          <p>Track income, expense, transfer, budgets, goals, recurring bills, notifications, and monthly reports.</p>
        </article>
        <article className="support-card">
          <h3>Who it is for</h3>
          <p>Anyone who wants one practical dashboard for spending control, account balances, and planning.</p>
        </article>
        <article className="support-card">
          <h3>Current focus</h3>
          <p>Reliable session security, clear financial workflows, and clean mobile and desktop usability.</p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage
