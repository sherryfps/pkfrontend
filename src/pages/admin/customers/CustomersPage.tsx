import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShieldAlert, RefreshCw, SlidersHorizontal,
  ChevronLeft, ChevronRight, User, Building, MapPin, Phone, Mail
} from 'lucide-react'
import { customerService, CustomerResponse } from '@/services/customerService'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await customerService.getCustomers(searchQuery, page, pageSize)
      setCustomers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch customers database')
    } finally {
      setLoading(false)
    }
  }

  // Reload when page or search query changes
  useEffect(() => {
    loadCustomers()
  }, [page])

  // Trigger search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0) // reset to first page on search
    loadCustomers()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Directory of all client companies and order contacts</p>
        </div>
        <div className="text-xs font-semibold bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl px-3.5 py-2">
          Total: {totalElements} Customers
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, company, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setPage(0)
                // We must clear state and reload
                setTimeout(() => loadCustomers(), 0)
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold rounded-xl transition-all flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={loadCustomers}
              disabled={loading}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors flex items-center justify-center"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading customers directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-16">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={22} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Customers Registered</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No customers match your search criteria.' : 'No customers have been registered yet by agents.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                    <th className="px-6 py-4 text-left table-header">Customer</th>
                    <th className="px-6 py-4 text-left table-header">Company Details</th>
                    <th className="px-6 py-4 text-left table-header">Address</th>
                    <th className="px-6 py-4 text-left table-header">Registered By</th>
                    <th className="px-6 py-4 text-left table-header">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  <AnimatePresence>
                    {customers.map((cust) => (
                      <motion.tr
                        key={cust.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors"
                      >
                        {/* Name / Avatar / Phone */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 border border-primary-100/30 dark:border-primary-800/30">
                              {getInitials(cust.name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{cust.name}</p>
                              <div className="flex flex-col gap-0.5 mt-1">
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={11} />{cust.email}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{cust.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company Details */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              <Building size={13} className="text-gray-400" />
                              {cust.company || 'Individual Client'}
                            </p>
                            {cust.gstin && (
                              <p className="text-xs text-gray-400">
                                GSTIN: <span className="font-mono font-medium">{cust.gstin}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4">
                          {cust.address ? (
                            <div className="space-y-0.5 max-w-xs">
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{cust.address}</p>
                              <p className="text-xs text-gray-400">
                                {cust.city && `${cust.city}, `}
                                {cust.state && `${cust.state} `}
                                {cust.pincode && `(${cust.pincode})`}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No Address Configured</span>
                          )}
                        </td>

                        {/* Assigned Agent */}
                        <td className="px-6 py-4">
                          {cust.agentName ? (
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-blue-500" />
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cust.agentName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                          {formatDate(cust.createdAt)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/20 dark:bg-gray-800/5">
                <span className="text-xs text-gray-400 font-medium">
                  Showing Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
