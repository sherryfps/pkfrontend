import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Download, IndianRupee } from 'lucide-react'
import { orderService, OrderResponse } from '@/services/orderService'
import toast from 'react-hot-toast'

const formatCurrency = (val: number) => `₹${new Intl.NumberFormat('en-IN').format(val || 0)}`
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export default function InvoicesPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await orderService.getAllOrders(0, 100)
        // Show orders that have received some payment as "invoices"
        setOrders((data.content ?? []).filter(o =>
          o.paymentStatus === 'FULLY_PAID' || o.paymentStatus === 'ADVANCE_PAID' || (o.paidAmount && o.paidAmount > 0)
        ))
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load invoices')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = orders.filter(o =>
    !search ||
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalInvoiced = orders.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const totalPaid = orders.reduce((s, o) => s + (o.paidAmount || 0), 0)

  return (
    <div className="space-y-6">
      <h1 className="page-title">Invoices</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Collected', value: formatCurrency(totalPaid), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Invoice Count', value: orders.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center animate-pulse"><div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><FileText size={32} className="mx-auto mb-3 opacity-50" /><p className="text-sm">No invoices found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800">
                  <th className="px-5 py-3 text-left table-header">Invoice #</th>
                  <th className="px-5 py-3 text-left table-header">Customer</th>
                  <th className="px-5 py-3 text-left table-header">Date</th>
                  <th className="px-5 py-3 text-right table-header">Subtotal</th>
                  <th className="px-5 py-3 text-right table-header">GST</th>
                  <th className="px-5 py-3 text-right table-header">Total</th>
                  <th className="px-5 py-3 text-right table-header">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="text-sm font-mono font-semibold text-primary-600">{o.orderNumber}</span></td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{o.customer?.name}</p>
                      {o.customer?.gstin && <p className="text-xs text-gray-400">GSTIN: {o.customer.gstin}</p>}
                    </td>
                    <td className="px-5 py-3.5"><span className="text-sm text-gray-500">{formatDate(o.createdAt)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(o.subtotal)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(o.gstAmount)} ({o.gstRate})</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</span></td>
                    <td className="px-5 py-3.5 text-right"><span className="text-sm font-semibold text-green-600">{formatCurrency(o.paidAmount)}</span></td>
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
