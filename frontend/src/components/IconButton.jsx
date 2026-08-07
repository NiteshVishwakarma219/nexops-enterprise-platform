export default function IconButton({ icon: Icon, onClick, title, variant = 'default', size = 16 }) {
  const variants = {
    default: 'text-slate-400 hover:text-slate-100 hover:bg-white/5',
    danger: 'text-slate-400 hover:text-red-400 hover:bg-red-500/10',
    brand: 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10',
  }
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-8 w-8 rounded-md flex items-center justify-center transition ${variants[variant]}`}
    >
      <Icon size={size} />
    </button>
  )
}
