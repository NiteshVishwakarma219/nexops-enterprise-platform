import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import { ROLE_LABELS, ROLE_COLORS } from '../constants/roles'
import * as notificationService from '../services/notificationService'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchUnread = () => {
      notificationService.listNotifications({ unread_only: true, page: 1, page_size: 1 })
        .then((res) => setUnreadCount(res.data.total))
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface/80 backdrop-blur-md border-b border-surface-border flex items-center justify-between px-4 lg:px-6">
      <button className="lg:hidden text-slate-400" onClick={onMenuClick}>
        <Menu size={22} />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <Link to="/notifications" className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/5 transition">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface" />
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/5 transition"
          >
            <Avatar name={user?.full_name} src={user?.avatar_url} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-100 leading-none">{user?.full_name}</p>
              <p className={`text-[10px] mt-1 inline-flex items-center rounded px-1.5 py-0.5 border ${ROLE_COLORS[user?.role]}`}>
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 card p-1.5 animate-scale-in origin-top-right">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 transition">
                <UserCircle size={16} /> My Profile
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 transition">
                <Settings size={16} /> Settings
              </Link>
              <div className="my-1 border-t border-surface-border" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
