/**
 * Two-step OTP-based password reset:
 *  Step 1 — enter email, request a 6-digit code via email
 *  Step 2 — enter the code + a new password in one submission
 */
import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, MailCheck, Lock, ShieldCheck, RotateCcw } from 'lucide-react'
import * as authService from '../services/authService'
import { extractErrorMessage } from '../services/api'
import { validateForm, isRequired, isEmail, isStrongPassword, passwordsMatch } from '../utils/validators'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = request code, 2 = enter code + new password
  const [email, setEmail] = useState('')
  const [serverMessage, setServerMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [step1Error, setStep1Error] = useState('')
  const [values, setValues] = useState({ otp: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const otpInputRef = useRef(null)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm({ email }, { email: [isRequired, isEmail] })
    if (validationErrors.email) { setStep1Error(validationErrors.email); return }
    setStep1Error('')
    setIsSubmitting(true)
    try {
      const res = await authService.forgotPassword(email)
      setServerMessage(res.data.message)
      setStep(2)
      setTimeout(() => otpInputRef.current?.focus(), 100)
    } catch (err) {
      setStep1Error(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value }))
  }

  const handleReset = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, {
      otp: [(v) => (!v || v.length !== 6 ? 'Enter the 6-digit code' : null)],
      new_password: [isRequired, isStrongPassword],
      confirm_password: [isRequired, passwordsMatch(values.new_password)],
    })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await authService.resetPassword(email, values.otp, values.new_password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setErrors({ form: extractErrorMessage(err) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsSubmitting(true)
    try {
      const res = await authService.forgotPassword(email)
      setServerMessage(res.data.message)
    } catch (err) {
      setErrors({ form: extractErrorMessage(err) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6">
          <ArrowLeft size={15} /> Back to sign in
        </Link>

        {success ? (
          <div className="card p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <MailCheck size={22} />
            </div>
            <h2 className="text-base font-semibold text-slate-50 mb-1.5">Password reset</h2>
            <p className="text-sm text-slate-400">Redirecting you to sign in...</p>
          </div>
        ) : step === 1 ? (
          <>
            <h1 className="text-xl font-semibold text-slate-50 mb-1.5">Forgot password?</h1>
            <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send you a 6-digit reset code.</p>

            <form onSubmit={handleRequestCode} className="card p-6 space-y-4">
              <div>
                <label className="label-text">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`input-field pl-9 ${step1Error ? 'border-red-500/60' : ''}`} placeholder="you@company.com"
                  />
                </div>
                {step1Error && <p className="error-text">{step1Error}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Send reset code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-50 mb-1.5">Enter your code</h1>
            <p className="text-sm text-slate-500 mb-6">{serverMessage || `We sent a 6-digit code to ${email}.`}</p>

            <form onSubmit={handleReset} className="card p-6 space-y-4">
              {errors.form && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{errors.form}</p>}

              <div>
                <label className="label-text">6-digit code</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    ref={otpInputRef} name="otp" inputMode="numeric" value={values.otp} onChange={handleChange}
                    className={`input-field pl-9 tracking-[0.4em] font-mono text-center ${errors.otp ? 'border-red-500/60' : ''}`}
                    placeholder="000000" maxLength={6}
                  />
                </div>
                {errors.otp && <p className="error-text">{errors.otp}</p>}
              </div>

              <div>
                <label className="label-text">New password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="new_password" type="password" value={values.new_password} onChange={handleChange} className={`input-field pl-9 ${errors.new_password ? 'border-red-500/60' : ''}`} placeholder="••••••••" />
                </div>
                {errors.new_password && <p className="error-text">{errors.new_password}</p>}
              </div>

              <div>
                <label className="label-text">Confirm new password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="confirm_password" type="password" value={values.confirm_password} onChange={handleChange} className={`input-field pl-9 ${errors.confirm_password ? 'border-red-500/60' : ''}`} placeholder="••••••••" />
                </div>
                {errors.confirm_password && <p className="error-text">{errors.confirm_password}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Reset password'}
              </button>

              <button type="button" onClick={handleResend} disabled={isSubmitting} className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
                <RotateCcw size={12} /> Didn't get a code? Resend
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
