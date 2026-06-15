import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Upload, CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { OrderStatusBadge } from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/services/apiClient'

interface DesignOrder {
  id: string; customer: string; qty: number; deadline: string
  status: string; priority: string; notes: string; mockupUploaded: boolean
}

interface DesignerStats {
  assignedOrders: number
  mockupsPending: number
  approvedThisMonth: number
  avgTurnaround: string
  orders: DesignOrder[]
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 badge',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 badge',
  MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 badge',
  LOW: 'badge-neutral',
}

export default function DesignerDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DesignerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<DesignOrder | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/v1/dashboard/designer')
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

  const urgentOrders = data.orders.filter(o => o.priority === 'URGENT')

  const stats = [
    { title: 'Assigned Orders', value: data.assignedOrders, icon: Palette, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Mockups Pending', value: data.mockupsPending, icon: Upload, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Approved This Month', value: data.approvedThisMonth, icon: CheckCircle2, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Avg. Turnaround', value: data.avgTurnaround, icon: Clock, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Design Studio 🎨</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name} — your design assignments</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      {urgentOrders.length > 0 && urgentOrders.map(order => (
        <div key={order.id} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">!</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Urgent: {order.id} — {order.customer}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Design needed urgently. Deadline: {order.deadline}</p>
          </div>
          <button onClick={() => setSelectedOrder(order)} className="ml-auto btn-primary py-1.5 px-4 text-xs whitespace-nowrap">Start Now</button>
        </div>
      ))}

      {data.orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🎨</div>
          <p className="text-gray-500 font-medium">No design assignments yet</p>
          <p className="text-xs text-gray-400 mt-1">Orders assigned to you will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover transition-all duration-300">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-gray-400">{order.id}</p>
                    <p className="font-bold text-gray-900 dark:text-white">{order.customer}</p>
                  </div>
                  <span className={priorityColors[order.priority] || 'badge-neutral'}>{order.priority}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Qty</span><span className="font-semibold">{order.qty} pcs</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="font-semibold text-red-600">{order.deadline}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-500">Status</span><OrderStatusBadge status={order.status} /></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mockup</span>
                    <span className={`text-xs font-bold ${order.mockupUploaded ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.mockupUploaded ? '✓ Uploaded' : 'Pending'}
                    </span>
                  </div>
                </div>
                {order.notes && <p className="mt-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 leading-relaxed">{order.notes}</p>}
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <button onClick={() => setSelectedOrder(order)} className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1">
                  <Palette size={13} /> View Brief
                </button>
                {!order.mockupUploaded && (
                  <button className="btn-secondary py-2 px-3 text-xs flex items-center gap-1">
                    <Upload size={13} /> Upload
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `${selectedOrder.id} — Design Brief` : ''}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500 text-xs">Customer</p><p className="font-bold">{selectedOrder.customer}</p></div>
              <div><p className="text-gray-500 text-xs">Quantity</p><p className="font-bold">{selectedOrder.qty} pcs</p></div>
              <div><p className="text-gray-500 text-xs">Deadline</p><p className="font-bold text-red-600">{selectedOrder.deadline}</p></div>
              <div><p className="text-gray-500 text-xs">Priority</p><span className={priorityColors[selectedOrder.priority] || 'badge-neutral'}>{selectedOrder.priority}</span></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Design Notes</p>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 rounded-xl p-4 leading-relaxed">{selectedOrder.notes || 'No additional notes provided.'}</p>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload size={16} /> Upload Mockup
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
