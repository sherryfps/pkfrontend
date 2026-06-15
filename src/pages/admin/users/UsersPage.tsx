import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search, UserPlus, RefreshCw, UserCheck, UserX,
  UserCircle, DollarSign, Palette, ShieldAlert, SlidersHorizontal
} from 'lucide-react'
import { userService, UserResponse } from '@/services/userService'
import toast from 'react-hot-toast'

const roleBadgeStyles: Record<string, string> = {
  ADMIN: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800/30 px-2 py-1 rounded-lg text-xs font-bold',
  AGENT: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 px-2 py-1 rounded-lg text-xs font-bold',
  ACCOUNTANT: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800/30 px-2 py-1 rounded-lg text-xs font-bold',
  DESIGNER: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30 px-2 py-1 rounded-lg text-xs font-bold',
}

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
  AGENT: 'Sales Agent',
  ACCOUNTANT: 'Accountant',
  DESIGNER: 'Graphic Designer',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      // If role filter is selected (and not ALL), use it. Otherwise call without
      const filterRole = roleFilter !== 'ALL' ? roleFilter : undefined
      const data = await userService.getUsers(filterRole)
      setUsers(data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const handleToggleStatus = async (user: UserResponse) => {
    setTogglingId(user.id)
    const isActivating = !user.active
    try {
      if (isActivating) {
        await userService.activateUser(user.id)
        toast.success(`${user.name} activated successfully`)
      } else {
        await userService.deactivateUser(user.id)
        toast.success(`${user.name} deactivated successfully`)
      }
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: isActivating } : u))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to modify user status`)
    } finally {
      setTogglingId(null)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
    
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.active) ||
      (statusFilter === 'INACTIVE' && !u.active)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and provision ERP employee accounts</p>
        </div>
        
        {/* Create ID Links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/createid/agent"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <UserPlus size={14} /> Add Agent ID
          </Link>
          <Link
            to="/admin/createid/accountant"
            className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <UserPlus size={14} /> Add Accountant ID
          </Link>
          <Link
            to="/admin/createid/designer"
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <UserPlus size={14} /> Add Designer ID
          </Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <SlidersHorizontal size={14} />
            Filters:
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="AGENT">Agent</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="DESIGNER">Designer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={loadUsers}
            className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            title="Refresh Users"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading users database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-16">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={22} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Users Found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              No employee matches the search parameters or filter options selected.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                  <th className="px-6 py-4 text-left table-header">Employee</th>
                  <th className="px-6 py-4 text-left table-header">Contact</th>
                  <th className="px-6 py-4 text-left table-header">Role</th>
                  <th className="px-6 py-4 text-left table-header">Status</th>
                  <th className="px-6 py-4 text-right table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="px-6 py-4.5">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user.phone || 'No phone number'}</p>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4.5">
                        <span className={roleBadgeStyles[user.role] || 'badge-neutral'}>
                          {roleLabel[user.role] || user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4.5 text-right">
                        {togglingId === user.id ? (
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-auto" />
                        ) : user.role === 'ADMIN' ? (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              user.active
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/30'
                                : 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950/20 dark:hover:bg-green-900/30'
                            }`}
                          >
                            {user.active ? (
                              <>
                                <UserX size={12} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={12} />
                                Activate
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
