import { useState } from 'react'
import { Loader2, Lock, User } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import Avatar from '../../components/Avatar'
import FormField, { TextInput } from '../../components/FormField'
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import * as userService from '../../services/userService'
import { validateForm, isRequired, isStrongPassword, passwordsMatch } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'

export default function Profile() {
  const { user, updateUserInContext } = useAuth()
  const { showToast } = useToast()

  const [profileValues, setProfileValues] = useState({ full_name: user?.full_name || '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [pwdValues, setPwdValues] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [isSavingPwd, setIsSavingPwd] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm(profileValues, { full_name: [isRequired] })
    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) return
    setIsSavingProfile(true)
    try {
      const res = await userService.updateMyProfile(profileValues)
      updateUserInContext(res.data)
      showToast('Profile updated successfully', 'success')
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm(pwdValues, {
      current_password: [isRequired],
      new_password: [isStrongPassword],
      confirm_password: [passwordsMatch(pwdValues.new_password)],
    })
    setPwdErrors(errors)
    if (Object.keys(errors).length > 0) return
    setIsSavingPwd(true)
    try {
      await userService.changePassword({ current_password: pwdValues.current_password, new_password: pwdValues.new_password })
      showToast('Password changed successfully', 'success')
      setPwdValues({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSavingPwd(false)
    }
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your personal information and security settings." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.full_name} size="lg" src={user?.avatar_url} />
            <h2 className="text-lg font-semibold text-slate-50 mt-4">{user?.full_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mt-3 ${ROLE_COLORS[user?.role]}`}>
              {ROLE_LABELS[user?.role]}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleProfileSubmit} className="card p-6">
            <p className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2"><User size={15} /> Personal Information</p>
            <div className="space-y-4">
              <FormField label="Full Name" required error={profileErrors.full_name}>
                <TextInput value={profileValues.full_name} onChange={(e) => setProfileValues({ full_name: e.target.value })} error={profileErrors.full_name} />
              </FormField>
              <FormField label="Email">
                <TextInput value={user?.email} disabled className="opacity-60" />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button type="submit" className="btn-primary" disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="card p-6">
            <p className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2"><Lock size={15} /> Change Password</p>
            <div className="space-y-4">
              <FormField label="Current Password" required error={pwdErrors.current_password}>
                <TextInput type="password" value={pwdValues.current_password} onChange={(e) => setPwdValues((v) => ({ ...v, current_password: e.target.value }))} error={pwdErrors.current_password} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="New Password" required error={pwdErrors.new_password}>
                  <TextInput type="password" value={pwdValues.new_password} onChange={(e) => setPwdValues((v) => ({ ...v, new_password: e.target.value }))} error={pwdErrors.new_password} />
                </FormField>
                <FormField label="Confirm New Password" required error={pwdErrors.confirm_password}>
                  <TextInput type="password" value={pwdValues.confirm_password} onChange={(e) => setPwdValues((v) => ({ ...v, confirm_password: e.target.value }))} error={pwdErrors.confirm_password} />
                </FormField>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button type="submit" className="btn-primary" disabled={isSavingPwd}>
                {isSavingPwd ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
