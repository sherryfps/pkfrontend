import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().min(3, 'Username/Email must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  AGENT: '/agent/dashboard',
  ACCOUNTANT: '/accountant/dashboard',
  DESIGNER: '/designer/dashboard',
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await authService.login(data)
      login(res.user as any, res.accessToken, res.refreshToken)
      toast.success(`Welcome back, ${res.user.name}!`)
      navigate(ROLE_ROUTES[res.user.role] || '/auth/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
        <p className="text-gray-500 mt-2">Sign in to your PK Corporate erp account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="label">Email or Username</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('email')}
              type="text"
              placeholder="you@company.com or username"
              autoComplete="username"
              className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/auth/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input {...register('rememberMe')} type="checkbox" id="remember" className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
          <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">Remember me for 30 days</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign in <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  )
}
