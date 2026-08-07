import { STATUS_STYLES, formatStatusLabel } from '../constants/statusStyles'

export default function Badge({ status, children }) {
  const style = STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${style}`}>
      {children || formatStatusLabel(status)}
    </span>
  )
}
