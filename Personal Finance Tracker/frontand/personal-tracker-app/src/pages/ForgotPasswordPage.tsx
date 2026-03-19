import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError(null)
      setMessage(null)
      setIsSubmitting(true)
      setMessage(await forgotPassword({ email }))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not send reset link.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Recover access</p>
        <h2>Forgot Password</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {message ? <div className="report-success">{message}</div> : null}
          {error ? <div className="report-error">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-footnote">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  )
}

export default ForgotPasswordPage
