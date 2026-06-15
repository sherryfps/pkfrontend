import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must have uppercase').regex(/[0-9]/, 'Must have number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(token, data.password)
      toast.success('Password reset successfully')
      navigate('/auth/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">New password</h2>
        <p className="text-gray-500 mt-2">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {[
          { name: 'password' as const, label: 'New password', placeholder: '••••••••' },
          { name: 'confirmPassword' as const, label: 'Confirm password', placeholder: '••••••••' },
        ].map((field) => (
          <div key={field.name}>
            <label className="label">{field.label}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register(field.name)}
                type={showPw ? 'text' : 'password'}
                placeholder={field.placeholder}
                className={`input-field pl-10 pr-10 ${errors[field.name] ? 'border-red-400' : ''}`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors[field.name] && <p className="text-xs text-red-500 mt-1.5">{errors[field.name]?.message}</p>}
          </div>
        ))}
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center">
          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset password'}
        </button>
      </form>
    </div>
  )
}
