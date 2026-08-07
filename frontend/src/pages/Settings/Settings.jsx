import { useState } from 'react'
import { Bell, Palette, Shield, Info } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../constants/roles'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-surface-border/60 last:border-0">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition shrink-0 ${checked ? 'bg-brand-600' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({
    emailLeaveUpdates: true,
    emailTicketUpdates: true,
    emailWeeklyDigest: false,
    inAppSound: true,
  })

  const updatePref = (key, value) => setPrefs((p) => ({ ...p, [key]: value }))

  return (
    <div>
      <PageHeader title="Settings" description="Manage your notification preferences and account details." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Bell size={15} /> Notification Preferences</p>
          <p className="text-xs text-slate-500 mb-2">Choose what you'd like to be notified about.</p>
          <ToggleRow label="Leave request updates" description="Get notified when your leave requests are reviewed" checked={prefs.emailLeaveUpdates} onChange={(v) => updatePref('emailLeaveUpdates', v)} />
          <ToggleRow label="Help desk ticket updates" description="Get notified on status changes and new comments" checked={prefs.emailTicketUpdates} onChange={(v) => updatePref('emailTicketUpdates', v)} />
          <ToggleRow label="Weekly digest email" description="A weekly summary of your team's activity" checked={prefs.emailWeeklyDigest} onChange={(v) => updatePref('emailWeeklyDigest', v)} />
          <ToggleRow label="In-app notification sound" checked={prefs.inAppSound} onChange={(v) => updatePref('inAppSound', v)} />
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <p className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Shield size={15} /> Account & Access</p>
            <p className="text-xs text-slate-500 mb-4">Your current role determines what you can see and manage.</p>
            <div className="rounded-lg bg-white/[0.02] border border-surface-border p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Role</span><span className="text-slate-200">{ROLE_LABELS[user?.role]}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Account Status</span><span className="text-emerald-400">{user?.is_active ? 'Active' : 'Inactive'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-200">{user?.email}</span></div>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Palette size={15} /> Appearance</p>
            <p className="text-xs text-slate-500 mb-4">NexOps is optimized for a dark, focused workspace.</p>
            <div className="rounded-lg border border-brand-500/30 bg-brand-500/5 p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700" />
              <div>
                <p className="text-sm text-slate-200">Dark Theme</p>
                <p className="text-xs text-slate-500">Currently active</p>
              </div>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-3">
            <Info size={16} className="text-slate-500 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500">
              Preferences on this page are stored locally for this demo build. In a production deployment they would be persisted per-user in the backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
