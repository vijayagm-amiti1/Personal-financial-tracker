import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

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
        <p className="auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  )
}

export default SignupPage
