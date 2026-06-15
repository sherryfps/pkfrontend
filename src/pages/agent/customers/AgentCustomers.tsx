import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShieldAlert, RefreshCw, ChevronLeft, ChevronRight,
  Plus, X, User, Building, Phone, Mail, MapPin, FileText, CheckCircle2
} from 'lucide-react'
import { customerService, CustomerResponse, CreateCustomerRequest } from '@/services/customerService'
import toast from 'react-hot-toast'

const initialFormState: CreateCustomerRequest = {
  name: '',
  email: '',
  phone: '',
  company: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  notes: '',
}

export default function MyCustomersPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState<CreateCustomerRequest>(initialFormState)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateCustomerRequest, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  
  const pageSize = 10

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await customerService.getCustomers(searchQuery, page, pageSize)
      setCustomers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load your customers list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadCustomers()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name as keyof CreateCustomerRequest]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const errors: Partial<Record<keyof CreateCustomerRequest, string>> = {}
    if (!formData.name.trim()) errors.name = 'Customer name is required'
    
    if (!formData.email.trim()) errors.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email address'
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'Phone number must be exactly 10 digits'
    
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.trim())) {
      errors.gstin = 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)'
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Pincode must be exactly 6 digits'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const cleanData: CreateCustomerRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company?.trim() || undefined,
        gstin: formData.gstin?.trim().toUpperCase() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        pincode: formData.pincode?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      }
      await customerService.createCustomer(cleanData)
      toast.success('Customer registered successfully!')
      setFormData(initialFormState)
      setIsDrawerOpen(false)
      setPage(0)
      loadCustomers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to register customer')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and register client accounts linked to your orders</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormState)
            setFormErrors({})
            setIsDrawerOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> Register Customer
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, company, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm justify-center flex-1 sm:flex-none"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setPage(0)
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

      {/* Customers List Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading your customers list...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-16">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={22} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Customers Registered</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No customers match your search.' : 'You have not registered any customers yet. Click "Register Customer" to get started.'}
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
                    <th className="px-6 py-4 text-left table-header">GSTIN</th>
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
                        {/* Name and contact */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-800/30 shadow-sm">
                              {getInitials(cust.name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{cust.name}</p>
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={11} />{cust.email}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{cust.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              <Building size={13} className="text-gray-400" />
                              {cust.company || 'Individual Client'}
                            </p>
                            {cust.notes && (
                              <p className="text-xs text-gray-400 italic truncate max-w-xs">{cust.notes}</p>
                            )}
                          </div>
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                          {cust.address ? (
                            <div>
                              <p className="truncate max-w-xs">{cust.address}</p>
                              <p className="text-gray-400 mt-0.5">
                                {cust.city && `${cust.city}, `}
                                {cust.state && `${cust.state} `}
                                {cust.pincode && `(${cust.pincode})`}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No Address Details</span>
                          )}
                        </td>

                        {/* GSTIN */}
                        <td className="px-6 py-4">
                          {cust.gstin ? (
                            <span className="text-xs font-mono font-bold bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg">
                              {cust.gstin}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No GSTIN</span>
                          )}
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

      {/* Slide-out Drawer for customer creation */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Register New Customer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Add a new client profile for orders</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Customer name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Kunal Khetri"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-transparent'
                      }`}
                    />
                  </div>
                  {formErrors.name && <p className="text-xxs text-red-500 mt-1">{formErrors.name}</p>}
                </div>

                {/* Email & Phone side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="client@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-transparent'
                        }`}
                      />
                    </div>
                    {formErrors.email && <p className="text-xxs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          formErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-transparent'
                        }`}
                        maxLength={10}
                      />
                    </div>
                    {formErrors.phone && <p className="text-xxs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                {/* Company & GSTIN side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        placeholder="e.g. Khetri Ltd"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* GSTIN */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      GSTIN
                    </label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="gstin"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={formData.gstin}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          formErrors.gstin ? 'border-red-400 focus:border-red-400' : 'border-transparent'
                        }`}
                      />
                    </div>
                    {formErrors.gstin && <p className="text-xxs text-red-500 mt-1">{formErrors.gstin}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="address"
                      placeholder="Street address, building, floor..."
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                    />
                  </div>
                </div>

                {/* City, State, Pincode in grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xxs font-semibold text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Pune"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-semibold text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. MH"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-semibold text-gray-500 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="411001"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                        formErrors.pincode ? 'border-red-400 focus:border-red-400' : 'border-transparent'
                      }`}
                      maxLength={6}
                    />
                    {formErrors.pincode && <p className="text-[9px] text-red-500 mt-0.5">{formErrors.pincode}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Internal Notes / Comments
                  </label>
                  <textarea
                    name="notes"
                    placeholder="E.g., preferred fabric style, special discounts..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
