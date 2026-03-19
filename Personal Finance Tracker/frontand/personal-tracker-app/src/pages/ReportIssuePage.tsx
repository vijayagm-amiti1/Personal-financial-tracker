import { useState } from 'react'
import { reportIssue } from '../services/supportService'

const initialForm = {
  subject: '',
  page: '',
  message: '',
}

function ReportIssuePage() {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const response = await reportIssue({
        subject: form.subject.trim(),
        page: form.page.trim(),
        message: form.message.trim(),
      })
      setSuccessMessage(response.message)
      setForm(initialForm)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send issue report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Support</p>
          <h2>Report an issue</h2>
        </div>
        <p className="page-description">
          Send a clear issue report by email. Include the page name, what you did, and what went wrong.
        </p>
      </header>

      {successMessage ? (
        <div className="report-success" role="status">
          <strong>Issue report sent.</strong>
          <span>{successMessage}</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="report-error" role="alert">
          <strong>Unable to send issue report.</strong>
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <form className="support-form support-card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Subject</span>
          <input
            type="text"
            maxLength={120}
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            placeholder="Budget page failed after save"
            required
          />
        </label>

        <label className="field">
          <span>Page</span>
          <input
            type="text"
            maxLength={160}
            value={form.page}
            onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))}
            placeholder="/budgets or Transactions page"
          />
        </label>

        <label className="field field-full">
          <span>Issue details</span>
          <textarea
            rows={8}
            maxLength={4000}
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            placeholder="Explain the steps, expected result, and actual result."
            required
          />
        </label>

        <div className="page-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send issue report'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ReportIssuePage
