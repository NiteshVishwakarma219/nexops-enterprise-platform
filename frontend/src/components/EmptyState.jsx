import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
      <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  )
}
