import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getGoogleLoginUrl } from '../services/authService'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const errorFromQuery = searchParams.get('error')
    if (errorFromQuery) {
      setError(errorFromQuery)
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError(null)
      await login({ email, password })
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <div className="report-error">{error}</div> : null}
          <div className="transaction-form-actions auth-actions">
            <Link to="/forgot-password" className="dashboard-link">Forgot password?</Link>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </div>
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
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
