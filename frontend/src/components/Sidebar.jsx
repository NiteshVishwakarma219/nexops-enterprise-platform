import { NavLink } from 'react-router-dom'
import { Boxes as LogoIcon, X } from 'lucide-react'
import { NAV_ITEMS } from '../constants/navigation'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role))

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-surface-card border-r border-surface-border flex flex-col transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
              <LogoIcon size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-50 leading-none">NexOps</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Enterprise Platform</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-300 border border-brand-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border text-[11px] text-slate-600">
          NexOps Enterprise v1.0
        </div>
      </aside>
    </>
  )
}
