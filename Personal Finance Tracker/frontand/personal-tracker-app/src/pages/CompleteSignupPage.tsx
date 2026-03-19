import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function CompleteSignupPage() {
  const { completeSignup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError('Password and confirm password must be the same.')
      return
    }

    try {
      setError(null)
      setIsSubmitting(true)
      await completeSignup({ email, password, confirmPassword })
      navigate('/login')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not complete signup.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Final step</p>
        <h2>Set your password</h2>
        <p className="page-description">Email verified for {email}. Now create your password.</p>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="report-error">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Complete signup'}
          </button>
        </form>
        <p className="auth-footnote">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  )
}

export default CompleteSignupPage
