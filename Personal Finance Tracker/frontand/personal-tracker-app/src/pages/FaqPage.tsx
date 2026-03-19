import { useMemo, useState } from 'react'

const faqSections = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'What should I set up first after signing in?',
        answer:
          'Start with Accounts. Create the bank, cash, or savings accounts you actively use. After that, add categories, then record transactions, then create budgets and goals.',
      },
      {
        question: 'Why is opening balance different from current balance?',
        answer:
          'Opening balance is the starting amount you set once when creating the account. Current balance changes over time as transactions, transfers, recurring items, and goal contributions happen.',
      },
      {
        question: 'Can I use the app with only one account?',
        answer:
          'Yes. The app works with a single account, but multiple accounts help you separate spending, savings, and cash clearly in reports and dashboards.',
      },
    ],
  },
  {
    category: 'Transactions and Budgets',
    items: [
      {
        question: 'How does a budget alert get triggered?',
        answer:
          'When you add an expense transaction, the app checks whether a budget exists for the same user, category, month, and year. If spending crosses the configured alert threshold or reaches 100%, a notification is created.',
      },
      {
        question: 'Why can a deleted account stop appearing in reports and transactions?',
        answer:
          'Deleted accounts are soft-deactivated for safety. Active screens, reports, and selectors only use active accounts, so removed accounts no longer participate in new flows.',
      },
      {
        question: 'Do transfers affect budgets?',
        answer:
          'No. Budgets are based on expense transactions. Transfers move money between accounts, but they do not count as category spending.',
      },
    ],
  },
  {
    category: 'Goals and Recurring Items',
    items: [
      {
        question: 'How do savings goals work?',
        answer:
          'A goal is linked to an account. When you contribute to it, the transaction flow updates balances and the goal amount. When the target is reached, a notification is created.',
      },
      {
        question: 'What happens when a recurring item runs?',
        answer:
          'When the daily recurring job processes an item whose next run date is due, it creates a normal transaction. That means balances, budgets, reports, and notifications all continue through the regular transaction pipeline.',
      },
      {
        question: 'Will recurring items stop automatically?',
        answer:
          'If an end date exists and the next calculated run would go past it, the recurring item is removed. If end date is empty, it continues indefinitely and only the next run date is updated.',
      },
    ],
  },
  {
    category: 'Security and Sessions',
    items: [
      {
        question: 'How is my session stored?',
        answer:
          'Authentication uses JWT tokens stored in HttpOnly cookies. The frontend cannot read the token directly; the browser attaches it automatically to protected backend requests.',
      },
      {
        question: 'What happens if my access token expires?',
        answer:
          'Protected frontend requests attempt a refresh once using the refresh cookie. If refresh fails, the app clears local user state and sends you back to the login page.',
      },
      {
        question: 'What does Logout remove?',
        answer:
          'Logout clears the backend auth cookies and removes locally stored user, account, category, and goal state from the browser before redirecting to login.',
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
          Clear answers for the most common setup, transaction, budget, goal, recurring, and security questions in this app.
        </p>
      </header>

      <section className="faq-hero">
        <div className="faq-hero-copy">
          <strong>Need quick clarity?</strong>
          <p>
            This page is written like a real product FAQ so you can understand how the app behaves before raising an issue.
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
