import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError(null)
      setIsSubmitting(true)
      await resetPassword({ token, newPassword })
      navigate('/login')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Reset password</p>
        <h2>Create a new password</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="report-error">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Reset password'}
          </button>
        </form>
        <p className="auth-footnote">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  )
}

export default ResetPasswordPage
