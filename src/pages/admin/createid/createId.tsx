import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserPlus, User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, UserCircle, DollarSign, Palette
} from 'lucide-react'
import { userService, CreateUserRequest } from '@/services/userService'
import toast from 'react-hot-toast'

type RoleType = 'AGENT' | 'ACCOUNTANT' | 'DESIGNER'

interface Props {
  role: RoleType
}

const roleConfig: Record<RoleType, {
  label: string
  color: string
  bgColor: string
  icon: React.ComponentType<any>
  description: string
}> = {
  AGENT: {
    label: 'Agent',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: UserCircle,
    description: 'Create login credentials for a new Sales Agent',
  },
  ACCOUNTANT: {
    label: 'Accountant',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: DollarSign,
    description: 'Create login credentials for a new Accountant',
  },
  DESIGNER: {
    label: 'Designer',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: Palette,
    description: 'Create login credentials for a new Designer',
  },
}

const initialForm = {
  name: '',
  email: '',
  phoneNumber: '',
  gender: '',
  password: '',
  confirmPassword: '',
}

export default function CreateId({ role }: Props) {
  const [formData, setFormData] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof initialForm>>({})

  const config = roleConfig[role]
  const RoleIcon = config.icon

  const validate = () => {
    const newErrors: Partial<typeof initialForm> = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) newErrors.phoneNumber = 'Enter a valid 10-digit number'
    if (!formData.gender) newErrors.gender = 'Please select a gender'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else {
      const pwd = formData.password
      const hasUpper = /[A-Z]/.test(pwd)
      const hasLower = /[a-z]/.test(pwd)
      const hasDigit = /\d/.test(pwd)
      const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        newErrors.password = 'Must include uppercase, lowercase, digit, and special character'
      }
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm the password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload: CreateUserRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
        gender: formData.gender,
        password: formData.password,
        role,
      }
      await userService.createUser(payload)
      setSuccess(true)
      toast.success(`${config.label} account created successfully!`)
      setFormData(initialForm)
      setErrors({})
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create account'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: keyof typeof errors) =>
    `w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      errors[field]
        ? 'border-red-400 dark:border-red-500 focus:ring-red-300/30 focus:border-red-400'
        : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500/30 focus:border-primary-500'
    }`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
            <RoleIcon className={config.color} size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Create {config.label} ID
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="text-sm font-medium">{config.label} account has been created successfully.</span>
        </motion.div>
      )}

      {/* Form card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5 sm:p-7">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={inputClass('phoneNumber')}
                  disabled={loading}
                  maxLength={10}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.phoneNumber}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`${inputClass('gender')} appearance-none cursor-pointer`}
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              {errors.gender && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.gender}</p>}
            </div>

            {/* Spacer on larger screens when gender is alone in row */}
            <div className="hidden sm:block" />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass('password')} pr-10`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
              <p className="mt-1 text-[10px] text-gray-400">Min 8 chars, with uppercase, lowercase, digit &amp; special character</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass('confirmPassword')} pr-10`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPassword}</p>}
            </div>

          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-red-glow active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Account…
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create {config.label} Account
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            The new user will receive their credentials at the provided email address.
          </p>
        </form>
      </div>
    </motion.div>
  )
}
