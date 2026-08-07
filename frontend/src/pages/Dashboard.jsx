import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Building2, CalendarCheck2, Boxes, CalendarClock, LifeBuoy,
  FolderKanban, TrendingUp, UserPlus, FilePlus, Ticket as TicketIcon, ArrowUpRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import * as dashboardService from '../services/dashboardService'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/roles'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'
import { timeAgo } from '../utils/formatters'

const PIE_COLORS = ['#3466fa', '#22c55e', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4']

export default function Dashboard() {
  const { user } = useAuth()
  const isManagement = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER].includes(user?.role)
  const [stats, setStats] = useState(null)
  const [deptDist, setDeptDist] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getDepartmentDistribution(),
      dashboardService.getAttendanceTrend(7),
      dashboardService.getRecentActivities(6),
    ])
      .then(([s, d, a, r]) => {
        setStats(s.data)
        setDeptDist(d.data)
        setAttendanceTrend(a.data)
        setActivities(r.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loader fullHeight label="Loading your dashboard..." />

  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, to: '/employees', roles: [ROLES.ADMIN, ROLES.HR] },
    { label: 'Apply for Leave', icon: CalendarClock, to: '/leave', roles: null },
    { label: 'Raise a Ticket', icon: TicketIcon, to: '/tickets', roles: null },
    { label: 'New Project', icon: FilePlus, to: '/projects', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  ].filter((a) => !a.roles || a.roles.includes(user?.role))

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0]}`}
        description="Here's what's happening across your organization today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={stats.total_employees} icon={Users} accent="brand" trend={`${stats.active_employees} active`} />
        <StatCard label="Departments" value={stats.total_departments} icon={Building2} accent="sky" />
        <StatCard label="Present Today" value={stats.present_today} icon={CalendarCheck2} accent="emerald" trend={`${stats.on_leave_today} on leave`} />
        <StatCard label="Assets Assigned" value={`${stats.assigned_assets}/${stats.total_assets}`} icon={Boxes} accent="amber" />
        <StatCard label="Pending Leave Requests" value={stats.pending_leave_requests} icon={CalendarClock} accent="pink" />
        <StatCard label="Open Tickets" value={stats.open_tickets} icon={LifeBuoy} accent="brand" />
        <StatCard label="Active Projects" value={stats.active_projects} icon={FolderKanban} accent="sky" trend={`${stats.total_projects} total`} />
        <StatCard label="Absent Today" value={stats.absent_today} icon={TrendingUp} accent="amber" />
      </div>

      {quickActions.length > 0 && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-medium text-slate-300 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-border py-4 hover:border-brand-500/40 hover:bg-brand-500/5 transition group">
                <a.icon size={20} className="text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-300 text-center px-2">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isManagement && (
          <div className="card p-5 lg:col-span-2">
            <p className="text-sm font-medium text-slate-300 mb-4">Attendance Trend (Last 7 Days)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1f2937' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3466fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {isManagement && (
          <div className="card p-5">
            <p className="text-sm font-medium text-slate-300 mb-4">Employees by Department</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptDist} dataKey="value" nameKey="label" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {deptDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
              {deptDist.map((d, i) => (
                <span key={d.label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={`card p-5 ${isManagement ? 'lg:col-span-3' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Recent Activity</p>
            <ArrowUpRight size={15} className="text-slate-500" />
          </div>
          <div className="space-y-3">
            {activities.length === 0 && <p className="text-sm text-slate-500">No recent activity to show.</p>}
            {activities.map((a) => (
              <div key={`${a.type}-${a.id}`} className="flex items-start gap-3 pb-3 border-b border-surface-border/60 last:border-0 last:pb-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${a.type === 'leave' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
                  {a.type === 'leave' ? <CalendarClock size={14} /> : <TicketIcon size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{a.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
