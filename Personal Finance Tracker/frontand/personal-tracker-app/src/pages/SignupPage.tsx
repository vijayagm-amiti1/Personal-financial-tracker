import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getGoogleLoginUrl } from '../services/authService'

function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError(null)
      setIsSubmitting(true)
      await register({ displayName, email })
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Signup failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Create account</p>
        <h2>Sign Up</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {error ? <div className="report-error">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <a
          href={getGoogleLoginUrl()}
          className="secondary-button auth-google-button auth-google-link"
        >
          <span className="auth-google-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation" focusable="false">
              <path
                fill="#EA4335"
                d="M12.24 10.286v3.934h5.518c-.242 1.27-.967 2.347-2.056 3.07l3.322 2.58c1.936-1.784 3.056-4.407 3.056-7.53 0-.724-.065-1.42-.185-2.054z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.76 0 5.078-.913 6.77-2.47l-3.322-2.58c-.924.62-2.108.987-3.448.987-2.649 0-4.893-1.788-5.694-4.192H2.87v2.66A10.216 10.216 0 0 0 12 22z"
              />
              <path
                fill="#4A90E2"
                d="M6.306 13.745A6.14 6.14 0 0 1 5.988 12c0-.606.11-1.194.318-1.745V7.595H2.87A10.216 10.216 0 0 0 1.8 12c0 1.63.391 3.173 1.07 4.405z"
              />
              <path
                fill="#FBBC05"
                d="M12 6.063c1.5 0 2.846.516 3.907 1.53l2.93-2.93C17.073 3.024 14.757 2 12 2A10.216 10.216 0 0 0 2.87 7.595l3.436 2.66C7.107 7.85 9.351 6.063 12 6.063z"
              />
            </svg>
          </span>
          Continue with Google
        </a>
        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  )
}

export default SignupPage
