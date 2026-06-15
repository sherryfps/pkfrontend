import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, BarChart3
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardService, AdminStatsResponse } from '@/services/dashboardService'
import toast from 'react-hot-toast'

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`
  return `₹${val.toFixed(0)}`
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const stats = await dashboardService.getAdminDashboard()
        setData(stats)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800" />)}
        </div>
        <div className="h-72 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800" />
      </div>
    )
  }

  if (!data) return null

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'This Month', value: formatCurrency(data.monthRevenue), icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Active Orders', value: data.activeOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Customers', value: data.totalCustomers.toString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="page-title">Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>
              <kpi.icon size={22} className={kpi.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="section-title mb-1">Revenue Trend</h2>
        <p className="text-sm text-gray-500 mb-6">Monthly revenue over the last 12 months</p>
        {data.monthlyRevenue?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E10600" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E10600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#E10600" strokeWidth={2.5} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-60 text-gray-400 text-sm">No data available yet</div>
        )}
      </div>

      {/* Orders by Month */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="section-title mb-1">Orders by Month</h2>
        <p className="text-sm text-gray-500 mb-6">Order volume trend</p>
        {data.monthlyRevenue?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#E10600" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available yet</div>
        )}
      </div>
    </div>
  )
}
