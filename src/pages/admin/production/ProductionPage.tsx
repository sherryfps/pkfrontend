import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Factory, CheckCircle2, Clock, Search, ArrowRight } from 'lucide-react'
import { orderService, OrderResponse } from '@/services/orderService'
import toast from 'react-hot-toast'

const stages = [
  { key: 'PRODUCTION', label: 'In Production', color: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10', icon: Factory, iconColor: 'text-purple-600' },
  { key: 'QUALITY_CHECK', label: 'Quality Check', color: 'border-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10', icon: CheckCircle2, iconColor: 'text-indigo-600' },
]

export default function ProductionPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await orderService.getAllOrders(0, 100)
        setOrders(data.content ?? [])
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load production data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdvance = async (orderId: string, nextStatus: string) => {
    try {
      const updated = await orderService.updateStatus(orderId, nextStatus)
      setOrders(orders.map(o => o.id === orderId ? updated : o))
      toast.success('Order advanced to next stage')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  const getStageOrders = (status: string) => orders.filter(o => o.status === status)

  return (
    <div className="space-y-6">
      <h1 className="page-title">Production Pipeline</h1>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-64 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(j => <div key={j} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stages.map((stage) => {
            const stageOrders = getStageOrders(stage.key)
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-900 rounded-2xl border-t-4 ${stage.color} border border-gray-100 dark:border-gray-800 p-6`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${stage.bg} rounded-xl flex items-center justify-center`}>
                    <stage.icon size={20} className={stage.iconColor} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{stage.label}</h2>
                    <p className="text-xs text-gray-500">{stageOrders.length} order(s)</p>
                  </div>
                </div>

                {stageOrders.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">No orders in this stage</div>
                ) : (
                  <div className="space-y-3">
                    {stageOrders.map((order) => (
                      <div key={order.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono font-semibold text-primary-600">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.customer?.name} • {order.items?.reduce((s, i) => s + i.totalQuantity, 0)} pcs</p>
                        </div>
                        <button
                          onClick={() => handleAdvance(order.id, stage.key === 'PRODUCTION' ? 'QUALITY_CHECK' : 'DISPATCH_READY')}
                          className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Next <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
