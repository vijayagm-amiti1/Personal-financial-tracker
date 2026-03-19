import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'

function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="auth-page"><div className="auth-card">Loading...</div></div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
