import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IndianRupee, Search, CreditCard, Clock, CheckCircle2 } from 'lucide-react'
import { orderService, OrderResponse } from '@/services/orderService'
import toast from 'react-hot-toast'

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ADVANCE_PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  FULLY_PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const formatCurrency = (val: number) => `₹${new Intl.NumberFormat('en-IN').format(val || 0)}`

export default function PaymentsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await orderService.getAllOrders(0, 100)
        setOrders(data.content ?? [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load payments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || o.paymentStatus === filter
    return matchSearch && matchFilter
  })

  const totalReceived = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0)
  const totalPending = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="page-title">Payment Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(totalReceived), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pending', value: formatCurrency(totalPending), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Orders', value: orders.length, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((card) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="ADVANCE_PAID">Advance Paid</option>
          <option value="FULLY_PAID">Fully Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center animate-pulse"><div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><CreditCard size={32} className="mx-auto mb-3 opacity-50" /><p className="text-sm">No records</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left table-header">Order</th>
                  <th className="px-5 py-3 text-left table-header">Customer</th>
                  <th className="px-5 py-3 text-right table-header">Total</th>
                  <th className="px-5 py-3 text-right table-header">Paid</th>
                  <th className="px-5 py-3 text-right table-header">Balance</th>
                  <th className="px-5 py-3 text-left table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-sm font-mono font-semibold text-primary-600">{o.orderNumber}</span></td>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-gray-900 dark:text-white">{o.customer?.name || 'N/A'}</p></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-semibold text-green-600">{formatCurrency(o.paidAmount)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className={`text-sm font-semibold ${o.balanceAmount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{formatCurrency(o.balanceAmount)}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${paymentStatusColors[o.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {o.paymentStatus?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
