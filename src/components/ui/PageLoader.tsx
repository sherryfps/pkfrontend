import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-red-glow">
          <span className="text-white font-black text-2xl">PK</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading PK Corporate erp...</p>
      </motion.div>
    </div>
  )
}
