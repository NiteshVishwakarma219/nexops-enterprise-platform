import {
  LayoutDashboard, Users, Building2, Boxes, CalendarCheck2,
  CalendarClock, FolderKanban, LifeBuoy, BarChart3, Bell, UserCircle, Settings,
} from 'lucide-react'
import { ROLES } from './roles'

// Every entry maps to a route. `roles: null` means visible to all authenticated users.
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: null },
  { label: 'Employees', path: '/employees', icon: Users, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER] },
  { label: 'Departments', path: '/departments', icon: Building2, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER] },
  { label: 'Assets', path: '/assets', icon: Boxes, roles: null },
  { label: 'Attendance', path: '/attendance', icon: CalendarCheck2, roles: null },
  { label: 'Leave', path: '/leave', icon: CalendarClock, roles: null },
  { label: 'Projects', path: '/projects', icon: FolderKanban, roles: null },
  { label: 'Help Desk', path: '/tickets', icon: LifeBuoy, roles: null },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: null },
  { label: 'Profile', path: '/profile', icon: UserCircle, roles: null },
  { label: 'Settings', path: '/settings', icon: Settings, roles: null },
]
