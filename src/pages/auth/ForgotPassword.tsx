import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-gray-500 mb-2">We sent a reset link to</p>
        <p className="text-gray-900 dark:text-white font-semibold mb-8">{getValues('email')}</p>
        <Link to="/auth/login" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Reset password</h2>
        <p className="text-gray-500 mt-2">Enter your email and we'll send a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@pkcorporate.com"
              className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  )
}
