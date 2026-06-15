import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  prefix?: string
  suffix?: string
  index?: number
}

export default function StatCard({
  title, value, change, changeLabel, icon: Icon,
  iconColor = 'text-primary-500',
  iconBg = 'bg-primary-50 dark:bg-primary-900/20',
  prefix = '', suffix = '', index = 0,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(change)}%
              </div>
              {changeLabel && (
                <span className="text-xs text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </motion.div>
  )
}
