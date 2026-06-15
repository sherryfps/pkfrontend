import { motion } from 'framer-motion'
import { IndianRupee, CheckCircle2, Clock, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PaymentStatusBadge } from '@/components/ui/Badge'

const paymentData = [
  { month: 'Jul', advance: 320000, balance: 180000 },
  { month: 'Aug', advance: 480000, balance: 220000 },
  { month: 'Sep', advance: 560000, balance: 310000 },
  { month: 'Oct', advance: 420000, balance: 280000 },
  { month: 'Nov', advance: 680000, balance: 380000 },
  { month: 'Dec', advance: 820000, balance: 450000 },
]

const pendingPayments = [
  { id: 'ORD-1042', customer: 'TechCorp India', advance: 175000, balance: 75000, due: '20 Dec', status: 'ADVANCE_PAID' },
  { id: 'ORD-1041', customer: 'Pune College', advance: 59500, balance: 25500, due: '22 Dec', status: 'ADVANCE_PAID' },
  { id: 'ORD-1038', customer: 'Mumbai FC', advance: 78750, balance: 33750, due: '18 Dec', status: 'ADVANCE_PAID' },
  { id: 'ORD-1037', customer: 'TATA Motors', advance: 280000, balance: 120000, due: '25 Dec', status: 'PARTIAL' },
]

export default function AccountantDashboard() {
  const stats = [
    { title: 'Total Collected (Month)', value: '13,20,000', prefix: '₹', change: 14.2, icon: IndianRupee, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Advance Received', value: '8,20,000', prefix: '₹', icon: TrendingUp, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Balance Pending', value: '4,50,000', prefix: '₹', icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Invoices Generated', value: 28, change: 8.3, icon: FileText, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Accountant Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Financial overview & payment management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="section-title">Payment Collection</h2>
            <p className="text-sm text-gray-500">Advance vs balance payments (₹)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
              <Tooltip formatter={(v, n) => [`₹${Number(v).toLocaleString()}`, n === 'advance' ? '70% Advance' : '30% Balance']} />
              <Bar dataKey="advance" fill="#E10600" radius={[4, 4, 0, 0]} name="advance" />
              <Bar dataKey="balance" fill="#FFB3B3" radius={[4, 4, 0, 0]} name="balance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
          <h2 className="section-title mb-4">Actions</h2>
          {[
            { label: 'Verify Payments', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', count: 5 },
            { label: 'Pending Approvals', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', count: 3 },
            { label: 'Generate Invoice', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', count: null },
            { label: 'Overdue Alerts', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', count: 2 },
          ].map((action) => (
            <button key={action.label} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${action.bg} rounded-xl flex items-center justify-center`}>
                  <action.icon size={18} className={action.color} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
              </div>
              {action.count && <span className="badge badge-error">{action.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="section-title">Pending Balance Collection</h2>
          <span className="badge badge-warning">{pendingPayments.length} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {['Order', 'Customer', 'Advance Paid', 'Balance Due', 'Due Date', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {pendingPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono font-bold text-primary-600">{p.id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{p.customer}</td>
                  <td className="px-5 py-3.5 text-sm text-green-600 font-semibold">₹{p.advance.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-amber-600 font-bold">₹{p.balance.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{p.due}</td>
                  <td className="px-5 py-3.5"><PaymentStatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs btn-primary py-1.5 px-3">Verify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
