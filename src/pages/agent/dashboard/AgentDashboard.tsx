import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, IndianRupee, Users, TrendingUp, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { OrderStatusBadge } from '@/components/ui/Badge'
import apiClient from '@/services/apiClient'

interface AgentStats {
  ordersThisMonth: number
  commissionThisMonth: number
  totalCustomers: number
  revenueGenerated: number
  commissionTrend: { month: string; commission: number }[]
  recentOrders: { id: string; customer: string; qty: number; amount: string; status: string; date: string }[]
}

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/v1/dashboard/agent')
      setData(res.data?.data ?? res.data)
    } catch {
      setError('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-gray-500 text-sm">{error || 'No data available'}</p>
        <button onClick={loadData} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> Retry</button>
      </div>
    )
  }

  const stats = [
    { title: 'My Orders (Month)', value: data.ordersThisMonth, icon: ShoppingBag, iconColor: 'text-primary-500', iconBg: 'bg-primary-50 dark:bg-primary-900/20' },
    { title: 'My Commission', value: (data.commissionThisMonth / 1000).toFixed(1) + 'K', prefix: '₹', icon: IndianRupee, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'My Customers', value: data.totalCustomers, icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Revenue Generated', value: (data.revenueGenerated / 100000).toFixed(1) + 'L', prefix: '₹', icon: TrendingUp, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Your sales performance at a glance</p>
        </div>
        <button onClick={() => navigate('/agent/catalog')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="section-title">Commission Trend</h2>
            <p className="text-sm text-gray-500">Monthly commission earned (₹)</p>
          </div>
          {data.commissionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.commissionTrend}>
                <defs>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E10600" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E10600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Commission']} />
                <Area type="monotone" dataKey="commission" stroke="#E10600" strokeWidth={2.5} fill="url(#commGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No commission data yet</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="section-title">Quick Actions</h2>
          {[
            { label: 'Browse T-Shirt Catalog', desc: 'Select product for new order', path: '/agent/catalog', icon: '👕', color: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50 hover:border-red-300' },
            { label: 'My Orders', desc: 'Track all your orders', path: '/agent/orders', icon: '📦', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 hover:border-blue-300' },
            { label: 'My Customers', desc: 'Manage your customer list', path: '/agent/customers', icon: '👥', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50 hover:border-green-300' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {data.recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="section-title mb-0">My Recent Orders</h2>
            <button onClick={() => navigate('/agent/orders')} className="text-xs text-primary-500 hover:text-primary-600 font-medium">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Order ID', 'Customer', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-bold text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{order.qty}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{order.amount}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{order.date}</td>
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
