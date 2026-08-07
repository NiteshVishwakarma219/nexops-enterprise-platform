import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import IconButton from '../../components/IconButton'
import * as notificationService from '../../services/notificationService'
import { useToast } from '../../context/ToastContext'
import { timeAgo } from '../../utils/formatters'
import { extractErrorMessage } from '../../services/api'

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle }
const COLORS = {
  info: 'bg-sky-500/10 text-sky-400', success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400', error: 'bg-red-500/10 text-red-400',
}

export default function Notifications() {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setIsLoading(true)
    notificationService.listNotifications({ page: 1, page_size: 50, unread_only: filter === 'unread' })
      .then((res) => setItems(res.data.items))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleMarkRead = async (id) => {
    await notificationService.markNotificationRead(id)
    load()
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead()
      showToast('All notifications marked as read', 'success')
      load()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    }
  }

  const handleDelete = async (id) => {
    await notificationService.deleteNotification(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay up to date with approvals, tickets, and system alerts."
        actions={
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto">
              <option value="all">All</option>
              <option value="unread">Unread only</option>
            </select>
            <button className="btn-secondary" onClick={handleMarkAllRead}><CheckCheck size={16} /> Mark all read</button>
          </div>
        }
      />

      <div className="card">
        {isLoading ? <Loader label="Loading notifications..." /> : items.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." />
        ) : (
          <div>
            {items.map((n) => {
              const Icon = ICONS[n.type] || Info
              return (
                <div key={n.id} className={`flex items-start gap-3 px-5 py-4 border-b border-surface-border/60 last:border-0 ${!n.is_read ? 'bg-brand-500/[0.03]' : ''}`}>
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${COLORS[n.type]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">{n.title}</p>
                      {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.is_read && <IconButton icon={CheckCheck} title="Mark as read" onClick={() => handleMarkRead(n.id)} />}
                    <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => handleDelete(n.id)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
