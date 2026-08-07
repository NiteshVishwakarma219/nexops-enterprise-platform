/**
 * Guards private routes: redirects unauthenticated users to /login,
 * and enforces RBAC when `allowedRoles` is provided.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-surface"><Loader label="Loading NexOps..." /></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
