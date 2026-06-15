import { Outlet, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    const roleRoutes: Record<string, string> = {
      ADMIN: '/admin/dashboard',
      AGENT: '/agent/dashboard',
      ACCOUNTANT: '/accountant/dashboard',
      DESIGNER: '/designer/dashboard',
    }
    return <Navigate to={roleRoutes[user.role] || '/auth/login'} replace />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden flex-col justify-between p-12"
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Red accent lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary-500 to-transparent" />

        {/* Glowing orb */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">PK</span>
            </div>
            <div>
              <h1 className="text-white font-black text-2xl tracking-tight">PK Corporate erp</h1>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">ERP System</p>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-primary-400 text-xs font-semibold uppercase tracking-widest">Enterprise Manufacturing ERP</span>
            </div>

            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Manufacture
              <span className="text-primary-500"> Excellence</span>
              <br />at Scale
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Complete manufacturing control for textile & custom bulk t-shirt orders. From raw fabric to final dispatch.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { label: 'Orders Managed', value: '10K+' },
                { label: 'Businesses Served', value: '500+' },
                { label: 'Revenue Tracked', value: '₹5Cr+' },
              ].map((stat) => (
                <div key={stat.label} className="border border-white/10 rounded-xl p-4 bg-white/5">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2025 PK Corporate erp. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">PK</span>
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white font-black text-xl">PK Corporate erp</h1>
              <p className="text-gray-500 text-xs">ERP System</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
