import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-4">
      <div className="h-14 w-14 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
        <Compass size={26} />
      </div>
      <h1 className="text-2xl font-semibold text-slate-50">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  )
}
