import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag, IndianRupee, Users, Factory, Truck,
  Clock, CheckCircle2, AlertCircle, TrendingUp, Package
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import StatCard from '@/components/ui/StatCard'
import { dashboardService, AdminStatsResponse } from '@/services/dashboardService'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  PAYMENT_PENDING: 'badge-warning',
  PAYMENT_VERIFIED: 'badge-info',
  DESIGN_IN_PROGRESS: 'badge-info',
  DESIGN_APPROVED: 'badge-success',
  PRODUCTION: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 badge',
  QUALITY_CHECK: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 badge',
  DISPATCH_READY: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 badge',
  DISPATCHED: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 badge',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending', PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_VERIFIED: 'Payment Verified', DESIGN_IN_PROGRESS: 'Design In Progress',
  DESIGN_APPROVED: 'Design Approved', PRODUCTION: 'Production',
  QUALITY_CHECK: 'Quality Check', DISPATCH_READY: 'Ready to Dispatch',
  DISPATCHED: 'Dispatched', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
}

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`
  return `₹${val.toFixed(0)}`
}

const formatAmount = (val: number) => {
  return new Intl.NumberFormat('en-IN').format(val)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-card-hover">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name === 'revenue' ? formatCurrency(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  )
}

// Skeleton component for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-28">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-80" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-80" />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState('')
  const [data, setData] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError(false)
      try {
        const stats = await dashboardService.getAdminDashboard()
        setData(stats)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(true)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Unable to Load Dashboard</h2>
          <p className="text-gray-500 text-sm mt-2">Check your connection to the backend API.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { title: 'Total Revenue', value: formatAmount(data.totalRevenue), prefix: '₹', icon: IndianRupee, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'This Month Revenue', value: formatAmount(data.monthRevenue), prefix: '₹', icon: TrendingUp, iconColor: 'text-primary-500', iconBg: 'bg-primary-50 dark:bg-primary-900/20' },
    { title: 'Active Orders', value: data.activeOrders, icon: ShoppingBag, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Pending Payments', value: formatAmount(data.pendingPayments), prefix: '₹', icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'In Production', value: data.inProduction, icon: Factory, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Ready to Dispatch', value: data.dispatchReady, icon: Truck, iconColor: 'text-teal-600', iconBg: 'bg-teal-50 dark:bg-teal-900/20' },
    { title: 'Total Customers', value: data.totalCustomers, icon: Users, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Completed (Month)', value: data.completedThisMonth, icon: CheckCircle2, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            {greeting}, Admin 👋
          </motion.h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening at PK Corporate erp today</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Dashboard
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Revenue Overview</h2>
              <p className="text-sm text-gray-500 mt-0.5">Monthly revenue trend (last 12 months)</p>
            </div>
          </div>
          {data.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E10600" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E10600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#E10600" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
              No revenue data yet — create orders to see trends
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="section-title">Quick Summary</h2>
            <p className="text-sm text-gray-500 mt-0.5">Business snapshot</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), color: 'text-green-600' },
              { label: 'This Month', value: formatCurrency(data.monthRevenue), color: 'text-primary-600' },
              { label: 'Pending Collections', value: formatCurrency(data.pendingPayments), color: 'text-amber-600' },
              { label: 'Active Pipeline', value: `${data.activeOrders} orders`, color: 'text-blue-600' },
              { label: 'Production Queue', value: `${data.inProduction} orders`, color: 'text-purple-600' },
              { label: 'Ready to Ship', value: `${data.dispatchReady} orders`, color: 'text-teal-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="section-title">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">Latest order activity from your team</p>
          </div>
        </div>
        {data.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left table-header">Order</th>
                  <th className="px-5 py-3 text-left table-header">Customer</th>
                  <th className="px-5 py-3 text-left table-header">Amount</th>
                  <th className="px-5 py-3 text-left table-header">Agent</th>
                  <th className="px-5 py-3 text-left table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono font-semibold text-primary-600">{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.qty} pcs • {order.date}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{order.amount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{order.agent}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={statusColors[order.status] || 'badge-neutral'}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Package size={32} className="mx-auto mb-3 opacity-50" />
            No orders yet — create your first order to see it here
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ...(data.pendingPayments > 0 ? [{ icon: Clock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50', title: 'Pending Payments', desc: `₹${formatAmount(data.pendingPayments)} in outstanding balances to collect` }] : []),
          ...(data.dispatchReady > 0 ? [{ icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50', title: 'Dispatch Pending', desc: `${data.dispatchReady} order(s) ready for dispatch — awaiting logistics` }] : []),
          ...(data.inProduction > 0 ? [{ icon: Factory, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/50', title: 'In Production', desc: `${data.inProduction} order(s) currently in production pipeline` }] : []),
        ].map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`p-4 rounded-xl border ${alert.bg} flex items-start gap-3`}
          >
            <alert.icon size={18} className={`${alert.color} shrink-0 mt-0.5`} />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{alert.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
