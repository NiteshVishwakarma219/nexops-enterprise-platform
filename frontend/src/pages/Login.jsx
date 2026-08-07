import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Boxes, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  ShieldCheck, BarChart3, Users, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { validateForm, isRequired, isEmail } from '../utils/validators'
import { extractErrorMessage } from '../services/api'

const HIGHLIGHTS = [
  { icon: Users, title: 'Unified Workforce Management', description: 'Employees, departments, and org structure in one place.' },
  { icon: ShieldCheck, title: 'Role-Based Access Control', description: 'Granular permissions across Admin, HR, Manager, and Employee roles.' },
  { icon: BarChart3, title: 'Real-Time Insights', description: 'Live dashboards for attendance, leave, assets, and projects.' },
]

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, {
      email: [isRequired, isEmail],
      password: [isRequired],
    })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      showToast('Welcome back!', 'success')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — brand / professional visual */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#101a33] to-[#151c50]">
        {/* Decorative background layers */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand-600/25 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-brand-800/20 blur-[120px]" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow">
              <Boxes size={22} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white leading-none">NexOps</p>
              <p className="text-xs text-slate-400 leading-none mt-1">Enterprise Platform</p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300 mb-6">
              <Sparkles size={12} /> Built for modern operations teams
            </span>
            <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-tight tracking-tight">
              One platform to run your entire workforce.
            </h1>
            <p className="text-slate-400 mt-4 text-[15px] leading-relaxed">
              HR, assets, attendance, leave, projects, and help desk — unified
              in a single enterprise-grade workspace built for teams that move fast.
            </p>

            <div className="mt-10 space-y-5">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <h.icon size={16} className="text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{h.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600">© {new Date().getFullYear()} NexOps Enterprise Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="lg:hidden absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />

        <div className="w-full max-w-sm relative animate-slide-up">
          <div className="flex flex-col items-center lg:items-start mb-8">
            <div className="lg:hidden h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow mb-4">
              <Boxes size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-50">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1.5">Sign in to your NexOps workspace to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange}
                  className={`input-field pl-9 ${errors.email ? 'border-red-500/60' : ''}`} placeholder="you@company.com"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-text mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={values.password} onChange={handleChange}
                  className={`input-field pl-9 pr-9 ${errors.password ? 'border-red-500/60' : ''}`} placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="card p-4 mt-6 text-xs text-slate-500">
            <p className="font-medium text-slate-400 mb-2">Demo accounts (each role has its own password)</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span>admin@nexops.com</span><span className="font-mono text-slate-400">Admin@NexOps2026</span></div>
              <div className="flex justify-between"><span>hr@nexops.com</span><span className="font-mono text-slate-400">HrPortal@2026</span></div>
              <div className="flex justify-between"><span>manager@nexops.com</span><span className="font-mono text-slate-400">Manager@2026</span></div>
              <div className="flex justify-between"><span>employee@nexops.com</span><span className="font-mono text-slate-400">Employee@2026</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
