/**
 * Legacy route kept only for anyone with an old bookmarked link — the
 * reset flow now lives entirely on /forgot-password (email -> OTP -> new password).
 */
import { Navigate } from 'react-router-dom'

export default function ResetPassword() {
  return <Navigate to="/forgot-password" replace />
}
