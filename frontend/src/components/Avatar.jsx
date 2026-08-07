import { initials } from '../utils/formatters'

const COLORS = [
  'bg-brand-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600', 'bg-purple-600', 'bg-sky-600',
]

function hashToIndex(str, mod) {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % mod
}

export default function Avatar({ name, size = 'md', src }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-14 w-14 text-lg' }
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-surface-border`} />
  }
  const color = COLORS[hashToIndex(name, COLORS.length)]
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}>
      {initials(name)}
    </div>
  )
}
