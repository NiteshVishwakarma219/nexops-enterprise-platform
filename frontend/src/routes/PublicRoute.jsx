/**
 * Wraps auth pages (login, forgot/reset password) so a logged-in user
 * is redirected straight to the dashboard instead of seeing the login form again.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
