/**
 * Root application router. Public auth routes are wrapped in PublicRoute
 * (redirects away if already logged in); everything else sits behind
 * ProtectedRoute + AppLayout, with per-module RBAC via `allowedRoles`.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AppLayout from './components/AppLayout'
import { ROLES } from './constants/roles'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import EmployeesList from './pages/Employees/EmployeesList'
import EmployeeProfile from './pages/Employees/EmployeeProfile'
import Departments from './pages/Departments/Departments'
import Assets from './pages/Assets/Assets'
import Attendance from './pages/Attendance/Attendance'
import Leave from './pages/Leave/Leave'
import Projects from './pages/Projects/Projects'
import Tickets from './pages/Tickets/Tickets'
import Reports from './pages/Reports/Reports'
import Notifications from './pages/Notifications/Notifications'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR, ROLES.MANAGER]} />}>
            <Route path="/employees" element={<EmployeesList />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
