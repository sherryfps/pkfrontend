import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, IndianRupee, ShoppingBag, Users, Award
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardService, AgentStatsResponse } from '@/services/dashboardService'
import StatCard from '@/components/ui/StatCard'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PAYMENT_VERIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DESIGN_IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PRODUCTION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DISPATCHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`
  return `₹${val.toFixed(0)}`
}

export default function AgentPerformance() {
  const [data, setData] = useState<AgentStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const stats = await dashboardService.getAgentDashboard()
        setData(stats)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load performance data')
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { title: 'Orders This Month', value: data.ordersThisMonth, icon: ShoppingBag, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Commission (Month)', value: formatCurrency(data.commissionThisMonth), prefix: '₹', icon: Award, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Total Customers', value: data.totalCustomers, icon: Users, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Revenue Generated', value: formatCurrency(data.revenueGenerated), prefix: '₹', icon: TrendingUp, iconColor: 'text-primary-600', iconBg: 'bg-primary-50 dark:bg-primary-900/20' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="page-title">My Performance</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Commission Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="section-title mb-1">Commission Trend</h2>
        <p className="text-sm text-gray-500 mb-6">Your commission earnings over recent months</p>
        {data.commissionTrend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.commissionTrend}>
              <defs>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), 'Commission']} />
              <Area type="monotone" dataKey="commission" stroke="#22c55e" strokeWidth={2.5} fill="url(#commGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No commission data yet</div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="section-title">Recent Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your latest order activity</p>
        </div>
        {data.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left table-header">Order</th>
                  <th className="px-5 py-3 text-left table-header">Customer</th>
                  <th className="px-5 py-3 text-right table-header">Amount</th>
                  <th className="px-5 py-3 text-left table-header">Date</th>
                  <th className="px-5 py-3 text-left table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-sm font-mono font-semibold text-primary-600">{o.id}</span></td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{o.customer}</p>
                      <p className="text-xs text-gray-400">{o.qty} pcs</p>
                    </td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-gray-900 dark:text-white">{o.amount}</span></td>
                    <td className="px-5 py-3.5"><span className="text-sm text-gray-500">{o.date}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">No recent orders</div>
        )}
      </div>
    </div>
  )
}
