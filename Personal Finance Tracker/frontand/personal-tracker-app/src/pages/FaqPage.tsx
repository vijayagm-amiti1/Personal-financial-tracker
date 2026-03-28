import { useMemo, useState } from 'react'

const faqSections = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'What should I set up first after login?',
        answer:
          'Start with Accounts, then Categories, then Transactions. After that, create Budgets, Goals, Recurring items, and Rules only if you need automation or planning features.',
      },
      {
        question: 'Can I use the app with only one account?',
        answer:
          'Yes. A single account works fine. Multiple accounts help when you want to separate spending, savings, cash, salary, or shared balances more clearly.',
      },
      {
        question: 'What is the difference between opening balance and current balance?',
        answer:
          'Opening balance is the starting amount you set when the account is created. Current balance changes as income, expenses, transfers, recurring items, and goal contributions are processed.',
      },
    ],
  },
  {
    category: 'Authentication and Access',
    items: [
      {
        question: 'Can I log in with Google?',
        answer:
          'Yes. Google login is supported. If an account was created through Google-only authentication and does not yet have a password, password login should not be used until signup or password setup is completed through the correct flow.',
      },
      {
        question: 'How is my session stored?',
        answer:
          'The app uses backend-managed authentication cookies. The frontend does not read the auth token directly. The browser automatically sends the secure session cookies to the backend for protected API requests.',
      },
      {
        question: 'Why do I stay logged in until I close the browser?',
        answer:
          'The application currently uses session-style cookies for normal browser use. That means the session can remain active while the browser is open and ends when the browser session is fully closed or you log out.',
      },
      {
        question: 'What happens on logout?',
        answer:
          'Logout clears the auth cookies, clears the session cookie, removes user-specific local state used by the frontend, and sends you back to the login screen.',
      },
    ],
  },
  {
    category: 'Accounts and Sharing',
    items: [
      {
        question: 'Can I share an account with another user?',
        answer:
          'Yes. Owners can invite members to a shared account and assign access roles through account sharing. Members can then view or operate the account based on the role they were given.',
      },
      {
        question: 'What is the difference between OWNER and VIEWER access?',
        answer:
          'Owners can use the account in write operations. Viewers can see the account but cannot select it in write flows such as adding transactions, recurring items, goal contributions, or other money-moving actions.',
      },
      {
        question: 'Why is a shared account visible in lists but missing in transaction forms?',
        answer:
          'That usually means your access role is view-only. The app intentionally hides view-only accounts from account selectors used in money-changing flows.',
      },
      {
        question: 'What happens if an account is deleted?',
        answer:
          'Accounts are soft-deactivated. They stop appearing in active write flows and most current reports, but historical records remain protected instead of being hard-deleted.',
      },
    ],
  },
  {
    category: 'Transactions, Budgets, and Goals',
    items: [
      {
        question: 'What transaction types exist in the app?',
        answer:
          'The main flows support income, expense, transfer, and goal contribution. Goal contribution still moves through the transaction system so balances and reporting remain aligned.',
      },
      {
        question: 'Do transfers affect budgets?',
        answer:
          'No. Budgets are based on expense activity. Transfers move balance between accounts but are not counted as category spending.',
      },
      {
        question: 'How do budget alerts work?',
        answer:
          'When spending is added to a budgeted category, the backend checks threshold and exceeded conditions. If the relevant notification settings are enabled, the app creates alerts and can also send email when supported.',
      },
      {
        question: 'How do goals work?',
        answer:
          'A goal is linked to an account. Contributions move money through the normal account flow and update the goal progress. When a goal reaches its target, completion notifications and celebratory UI effects can be triggered.',
      },
      {
        question: 'Can a goal be linked to any shared account?',
        answer:
          'Only accounts you can actively operate should be available in write selectors. View-only accounts are not intended to be used for new money movement actions.',
      },
    ],
  },
  {
    category: 'Recurring Items and Rules',
    items: [
      {
        question: 'What happens when a recurring item becomes due?',
        answer:
          'The internal recurring job converts the due recurring item into a normal transaction and advances the next run date. That means balances, budgets, reports, and notifications continue through the standard transaction pipeline.',
      },
      {
        question: 'Will recurring items stop automatically?',
        answer:
          'If an end date exists and the next run passes it, the recurring schedule stops. If no end date is set, the recurring item continues indefinitely.',
      },
      {
        question: 'What is the is_recurred flag used for?',
        answer:
          'Transactions created by recurring processing are marked internally so the system can distinguish recurring-generated activity from manually entered transactions in reporting and forecast logic.',
      },
      {
        question: 'What are automation rules used for?',
        answer:
          'Rules let you define condition-action logic such as setting category suggestions, adding tags, or creating alerts when transaction fields match configured values.',
      },
      {
        question: 'Why do rule suggestions change while I type a transaction?',
        answer:
          'Rule suggestions are frontend auto-suggestions. If the current form values no longer match the old rule, the previous auto-suggestion is cleared and the current matching rule suggestion is applied instead. Manual user edits are still respected.',
      },
    ],
  },
  {
    category: 'Forecasting, Health Score, and Insights',
    items: [
      {
        question: 'What does the cash flow forecast show?',
        answer:
          'Forecasting estimates projected balance through the end of the current month using current balances, historical non-recurring spending behavior, and upcoming recurring payments and inflows.',
      },
      {
        question: 'How is safe to spend calculated?',
        answer:
          'Safe to spend is based on projected end-of-month position after considering expected spending behavior and upcoming recurring obligations. If recurring obligations are not safely covered, the app can show an insufficient recurring payments warning.',
      },
      {
        question: 'Why does the forecast use non-recurring spending patterns?',
        answer:
          'Recurring payments are already known scheduled obligations, so the forecast handles them directly. Non-recurring spending is estimated from historical behavior to avoid double-counting recurring expenses in the projection.',
      },
      {
        question: 'What happens if I have very little history for cash flow forecasting?',
        answer:
          'If the account is new or transaction history is sparse, the forecast falls back to simpler heuristics. For very new users, a default daily pending expense assumption can be used until enough real history is available.',
      },
      {
        question: 'Why does the forecast graph show a Today line?',
        answer:
          'The Today marker helps separate actual or already-known progress from upcoming projected balance movement for the rest of the month.',
      },
      {
        question: 'What is the Financial Health Score?',
        answer:
          'It is a weighted score that combines savings rate, budget adherence, cash buffer, and expense stability into a single 0 to 100 style health indicator for quick financial review.',
      },
      {
        question: 'Which factors improve the Financial Health Score?',
        answer:
          'The score usually improves when your savings rate goes up, budgets are respected, your cash buffer grows, and your spending becomes more stable instead of highly erratic.',
      },
      {
        question: 'Why can the Financial Health Score fall?',
        answer:
          'The score can fall if expenses rise faster than income, budgets are exceeded, savings rate drops, cash reserves become thin, or monthly spending becomes more volatile and unpredictable.',
      },
      {
        question: 'What is savings rate in the score?',
        answer:
          'Savings rate is the portion of income left after expenses. In simple terms, if income stays healthy while expenses are controlled, the savings rate component usually improves.',
      },
      {
        question: 'What is cash buffer in the score?',
        answer:
          'Cash buffer measures how much balance protection you have compared with typical spending. A stronger buffer means you can absorb routine outflows more safely without immediate financial pressure.',
      },
      {
        question: 'What is expense stability in the score?',
        answer:
          'Expense stability looks at how wildly monthly spending changes over time. Lower volatility generally helps because stable spending is easier to plan and forecast.',
      },
      {
        question: 'How can I improve my Financial Health Score practically?',
        answer:
          'Useful ways to improve the score include recording transactions consistently, reducing avoidable expenses, increasing savings contributions, keeping recurring commitments realistic, following budget limits, and maintaining healthier account balances.',
      },
      {
        question: 'Why is my score not changing quickly?',
        answer:
          'The score depends on patterns, not just one transaction. It usually moves when enough account balance, spending, budget, and savings behavior changes accumulate across time.',
      },
      {
        question: 'What is the new Insights page for?',
        answer:
          'Insights gives deeper analysis beyond the basic monthly report. It includes trend cards, income vs expense comparison over time, category trends, net worth tracking, and human-readable observations such as rising food spend or improved savings rate.',
      },
      {
        question: 'Why might an insight not appear for me?',
        answer:
          'If your data is sparse, too new, or too stable for a meaningful comparison, the app may show fewer insight cards. Trend features need enough transaction history to produce useful comparisons.',
      },
      {
        question: 'What does net worth tracking mean in this app?',
        answer:
          'Net worth tracking currently reflects the running value of your account balances across time using opening balances and transaction movement. It is useful as a practical balance trend even if formal liabilities are not modeled separately yet.',
      },
    ],
  },
  {
    category: 'Notifications, Settings, and Support',
    items: [
      {
        question: 'Can I control which notifications the app sends?',
        answer:
          'Yes. Settings lets you control email notifications and specific alert families such as budget alerts, goal notifications, target-date notifications, and monthly budget reports.',
      },
      {
        question: 'Why do I still get in-app notifications when email is disabled?',
        answer:
          'Email permission only affects email delivery. In-app notifications can still be created for supported flows unless that notification family itself is disabled.',
      },
      {
        question: 'Where do I manage rules?',
        answer:
          'Rules are managed on a dedicated Rules page. Settings only provides an entry point to that management page so the configuration stays focused and does not overcrowd the settings screen.',
      },
      {
        question: 'How should I report a bug effectively?',
        answer:
          'Use Report Issue and include the page, the steps you performed, what you expected, what actually happened, and whether the problem is related to login, accounts, transactions, recurring items, reports, or another feature.',
      },
    ],
  },
]

function FaqPage() {
  const [openKey, setOpenKey] = useState('0-0')

  const totalQuestions = useMemo(
    () => faqSections.reduce((count, section) => count + section.items.length, 0),
    [],
  )

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2>Frequently asked questions</h2>
        </div>
        <p className="page-description">
          Answers for setup, authentication, accounts, sharing, rules, recurring flows, forecasting, insights,
          and support inside Personal Finance Tracker.
        </p>
      </header>

      <section className="faq-hero">
        <div className="faq-hero-copy">
          <strong>Need quick clarity?</strong>
          <p>
            This FAQ is meant to explain real application behavior, not generic finance advice. It focuses on how
            the product works and why specific flows behave the way they do.
          </p>
        </div>
        <div className="faq-hero-stats">
          <article>
            <span>Sections</span>
            <strong>{faqSections.length}</strong>
          </article>
          <article>
            <span>Questions</span>
            <strong>{totalQuestions}</strong>
          </article>
        </div>
      </section>

      <div className="faq-layout">
        <aside className="faq-sidebar">
          {faqSections.map((section) => (
            <a key={section.category} href={`#faq-${section.category.replaceAll(' ', '-').toLowerCase()}`}>
              {section.category}
            </a>
          ))}
        </aside>

        <div className="faq-sections">
          {faqSections.map((section, sectionIndex) => (
            <section
              key={section.category}
              id={`faq-${section.category.replaceAll(' ', '-').toLowerCase()}`}
              className="faq-section-card"
            >
              <header className="faq-section-header">
                <p>{section.category}</p>
                <h3>{section.items.length} answers</h3>
              </header>

              <div className="faq-items">
                {section.items.map((item, itemIndex) => {
                  const itemKey = `${sectionIndex}-${itemIndex}`
                  const isOpen = openKey === itemKey

                  return (
                    <article key={item.question} className={isOpen ? 'faq-item faq-item-open' : 'faq-item'}>
                      <button
                        type="button"
                        className="faq-question"
                        aria-expanded={isOpen}
                        onClick={() => setOpenKey((current) => (current === itemKey ? '' : itemKey))}
                      >
                        <span>{item.question}</span>
                        <strong>{isOpen ? '−' : '+'}</strong>
                      </button>
                      {isOpen ? <p className="faq-answer">{item.answer}</p> : null}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FaqPage
