import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function VerifyOtpPage() {
  const { verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setError(null)
      setIsSubmitting(true)
      await verifyOtp({ email, otp })
      navigate(`/complete-signup?email=${encodeURIComponent(email)}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'OTP verification failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Verify email</p>
        <h2>Enter OTP</h2>
        <p className="page-description">We sent a 6-digit code to {email}.</p>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>OTP</span>
            <input
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </label>
          {error ? <div className="report-error">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <p className="auth-footnote">
          Need another try? <Link to="/signup">Back to Sign Up</Link>
        </p>
      </div>
    </section>
  )
}

export default VerifyOtpPage
