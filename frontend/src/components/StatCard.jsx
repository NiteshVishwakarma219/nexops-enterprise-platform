export default function StatCard({ label, value, icon: Icon, trend, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-400 bg-brand-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
    sky: 'text-sky-400 bg-sky-500/10',
  }
  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="text-2xl font-semibold text-slate-50 mt-1.5 tabular-nums">{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-1.5">{trend}</p>}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
