import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Package, CheckCircle2, Search, MapPin } from 'lucide-react'
import { orderService, OrderResponse } from '@/services/orderService'
import toast from 'react-hot-toast'

export default function DispatchPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'DISPATCH_READY' | 'DISPATCHED'>('DISPATCH_READY')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await orderService.getAllOrders(0, 100)
        setOrders(data.content ?? [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load dispatch data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDispatch = async (orderId: string) => {
    try {
      const updated = await orderService.updateStatus(orderId, 'DISPATCHED')
      setOrders(orders.map(o => o.id === orderId ? updated : o))
      toast.success('Order marked as dispatched')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch')
    }
  }

  const handleComplete = async (orderId: string) => {
    try {
      const updated = await orderService.updateStatus(orderId, 'COMPLETED')
      setOrders(orders.map(o => o.id === orderId ? updated : o))
      toast.success('Order marked as completed')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to complete')
    }
  }

  const filtered = orders.filter(o => o.status === tab)
  const readyCount = orders.filter(o => o.status === 'DISPATCH_READY').length
  const dispatchedCount = orders.filter(o => o.status === 'DISPATCHED').length

  return (
    <div className="space-y-6">
      <h1 className="page-title">Dispatch Management</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'DISPATCH_READY' as const, label: 'Ready to Dispatch', count: readyCount, icon: Package },
          { key: 'DISPATCHED' as const, label: 'Dispatched', count: dispatchedCount, icon: Truck },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <t.icon size={16} />
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center animate-pulse">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No orders in this stage</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                    <Package size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-semibold text-primary-600">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.customer?.name} • {order.items?.reduce((s, i) => s + i.totalQuantity, 0)} pcs</p>
                    {order.customer?.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {order.customer?.city || ''} {order.customer?.state || ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{new Intl.NumberFormat('en-IN').format(order.totalAmount || 0)}
                  </span>
                  {tab === 'DISPATCH_READY' ? (
                    <button
                      onClick={() => handleDispatch(order.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors"
                    >
                      <Truck size={14} /> Mark Dispatched
                    </button>
                  ) : (
                    <button
                      onClick={() => handleComplete(order.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
