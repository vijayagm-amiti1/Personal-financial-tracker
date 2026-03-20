import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const MAX_ATTEMPTS = 4

function wait(delayMs: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

function GoogleAuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [message, setMessage] = useState('Finishing Google sign-in...')

  useEffect(() => {
    let active = true

    const finishGoogleSignIn = async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const user = await refreshUser()
        if (!active) {
          return
        }

        if (user) {
          navigate('/dashboard', { replace: true })
          return
        }

        setMessage(
          attempt < MAX_ATTEMPTS
            ? 'Waiting for your secure session...'
            : 'Google sign-in could not be completed.',
        )
        await wait(400)
      }

      navigate('/login?error=Google%20login%20did%20not%20create%20a%20session.', { replace: true })
    }

    void finishGoogleSignIn()

    return () => {
      active = false
    }
  }, [navigate, refreshUser])

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Google sign-in</p>
        <h2>Completing login</h2>
        <p className="page-description">{message}</p>
      </div>
    </section>
  )
}

export default GoogleAuthCallbackPage
