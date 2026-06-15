import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, IndianRupee, TrendingUp, ShoppingBag, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService, AdminStatsResponse } from '@/services/dashboardService'
import toast from 'react-hot-toast'

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`
  return `₹${val.toFixed(0)}`
}

export default function ReportsPage() {
  const [data, setData] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const stats = await dashboardService.getAdminDashboard()
        setData(stats)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load report data')
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
      </div>
    )
  }

  if (!data) return null

  const summaryCards = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Monthly Revenue', value: formatCurrency(data.monthRevenue), icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Pending Collection', value: formatCurrency(data.pendingPayments), icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Orders', value: (data.activeOrders + data.completedThisMonth).toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="page-title">Financial Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon size={22} className={card.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue by Month */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="section-title mb-1">Monthly Revenue Report</h2>
        <p className="text-sm text-gray-500 mb-6">Revenue breakdown by month</p>
        {data.monthlyRevenue?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#E10600" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>
        )}
      </div>

      {/* Monthly Table */}
      {data.monthlyRevenue?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="section-title">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left table-header">Month</th>
                  <th className="px-5 py-3 text-right table-header">Revenue</th>
                  <th className="px-5 py-3 text-right table-header">Orders</th>
                  <th className="px-5 py-3 text-right table-header">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.monthlyRevenue.map((m) => (
                  <tr key={m.month} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-sm font-semibold text-gray-900 dark:text-white">{m.month}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-green-600">{formatCurrency(m.revenue)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm text-gray-600 dark:text-gray-400">{m.orders}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm text-gray-600 dark:text-gray-400">{m.orders > 0 ? formatCurrency(m.revenue / m.orders) : '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
