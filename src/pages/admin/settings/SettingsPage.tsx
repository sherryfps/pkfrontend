import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Lock, Bell, Moon, Sun, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { isDark, toggleDark } = useThemeStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="page-title">Settings</h1>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
            <User size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Profile Information</h2>
            <p className="text-xs text-gray-500">Your account details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Name', value: user?.name || 'N/A' },
            { label: 'Email', value: user?.email || 'N/A' },
            { label: 'Role', value: user?.role || 'N/A' },
            { label: 'Phone', value: user?.phone || 'Not set' },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{field.label}</label>
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white">
                {field.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              {isDark ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-600" />}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Appearance</h2>
              <p className="text-xs text-gray-500">Toggle dark/light mode</p>
            </div>
          </div>
          <button onClick={toggleDark}
            className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Lock size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-xs text-gray-500">Update your account password</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
          </div>
          <button type="submit" disabled={changingPassword}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50">
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-gray-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">PK Corporate erp</h2>
            <p className="text-xs text-gray-500">Version 1.0.0 • Built with ❤️</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
