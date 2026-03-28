function AboutPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">About</p>
          <h2>About Personal Finance Tracker</h2>
        </div>
        <p className="page-description">
          Personal Finance Tracker is a full money-operating workspace for day-to-day transactions, planning,
          automation, forecasting, sharing, and insight-driven financial review.
        </p>
      </header>

      <div className="support-page-grid">
        <article className="support-card">
          <h3>What the product covers</h3>
          <p>
            The app combines accounts, categories, transactions, budgets, goals, recurring payments, rules,
            reports, forecast models, financial health scoring, notifications, support tools, and account sharing
            in one workflow.
          </p>
        </article>

        <article className="support-card">
          <h3>How it is designed to work</h3>
          <p>
            Everyday actions flow through normal transactions first. Budgets, goals, reports, recurring runs,
            rules, insights, and forecast calculations all build on that same transaction history so the numbers
            stay consistent across the product.
          </p>
        </article>

        <article className="support-card">
          <h3>Who it is for</h3>
          <p>
            It is useful for individuals who want clean money visibility, families managing shared spending, or
            anyone who needs both manual control and lightweight automation without moving into full accounting software.
          </p>
        </article>
      </div>

      <div className="support-stack">
        <article className="support-card">
          <h3>Core modules</h3>
          <p>
            Accounts store balance state. Categories organize transaction intent. Transactions capture income,
            expense, transfer, and goal contribution activity. Budgets monitor category spending. Goals track savings
            progress. Recurring items create future scheduled activity. Rules suggest categorization, tags, and alerts.
          </p>
        </article>

        <article className="support-card">
          <h3>Planning and analysis</h3>
          <p>
            Forecasting estimates end-of-month balance, safe-to-spend amount, and upcoming recurring impact.
            Financial Health scoring uses weighted signals such as savings rate, budget adherence, cash buffer,
            and expense stability. Insights and advanced reports show trends, net worth movement, and month-over-month changes.
          </p>
        </article>

        <article className="support-card">
          <h3>Authentication and security</h3>
          <p>
            The app supports password-based login as well as Google login. Authentication is handled through secure
            backend-managed cookies. Logout clears both session and auth cookies. Accounts created through Google-only
            flows can later complete signup separately if password login is needed.
          </p>
        </article>

        <article className="support-card">
          <h3>Shared accounts and permissions</h3>
          <p>
            Shared account access is role-based. Owners can manage and operate the account fully. View-only members
            can see account data but are intentionally blocked from write flows such as transaction creation, recurring
            scheduling, and goal contribution account selection.
          </p>
        </article>

        <article className="support-card">
          <h3>Notifications and email</h3>
          <p>
            The product supports in-app notifications for budget alerts, goal events, recurring reminders, rule alerts,
            and system updates. Email delivery can be enabled or disabled in Settings, and individual notification classes
            can be controlled there as well.
          </p>
        </article>

        <article className="support-card">
          <h3>Support philosophy</h3>
          <p>
            Help, FAQ, and issue reporting are built into the product so users can understand behavior, troubleshoot
            common flows, and send specific issues with page context and reproduction details when something goes wrong.
          </p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage
