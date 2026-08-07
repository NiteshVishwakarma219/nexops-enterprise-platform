import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading...', fullHeight = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-400 ${fullHeight ? 'h-64' : 'py-12'}`}>
      <Loader2 className="animate-spin text-brand-500" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
