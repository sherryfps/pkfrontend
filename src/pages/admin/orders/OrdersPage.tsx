import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Eye, ChevronLeft, ChevronRight, X, User,
  Calendar, CreditCard, Layers, Tag, HelpCircle, AlertCircle, CheckCircle2,
  FileText, Image, PenTool, Clipboard
} from 'lucide-react';
import { orderService, OrderResponse, PageableResponse } from '@/services/orderService';
import { userService, UserResponse } from '@/services/userService';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  PAYMENT_VERIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DESIGN_IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DESIGN_APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PRODUCTION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  QUALITY_CHECK: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  DISPATCH_READY: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  DISPATCHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending Approval',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_VERIFIED: 'Payment Verified',
  DESIGN_IN_PROGRESS: 'Design In Progress',
  DESIGN_APPROVED: 'Design Approved',
  PRODUCTION: 'In Production',
  QUALITY_CHECK: 'Quality Check',
  DISPATCH_READY: 'Ready to Dispatch',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [designers, setDesigners] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders(page, 15);
      setOrders(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDesigners = async () => {
    try {
      const data = await userService.getUsers('DESIGNER');
      setDesigners(data);
    } catch (err: any) {
      console.error('Failed to fetch designers', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    fetchDesigners();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const updated = await orderService.updateStatus(orderId, status);
      toast.success(`Order status updated to ${statusLabels[status]}`);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update order status');
    }
  };

  const handleAssignDesigner = async (orderId: string, designerId: string) => {
    try {
      const updated = await orderService.assignDesigner(orderId, designerId);
      toast.success('Designer assigned successfully');
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign designer');
    }
  };

  const copyTrackingLink = (token: string) => {
    const link = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Public tracking link copied to clipboard!');
  };

  // Local filtering & searching based on page-loaded orders (for quick responsiveness)
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer.company && o.customer.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Manage Orders</h1>
        <p className="text-gray-500 text-sm mt-1">View statuses, delegate to designers, and manage textile operations.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, number, client name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(statusLabels).map(k => (
                <option key={k} value={k}>{statusLabels[k]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📦</div>
            <p className="text-gray-500 font-medium">No orders found matching the query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Client / Company</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Total Amount</th>
                  <th className="px-5 py-4">Designer</th>
                  <th className="px-5 py-4">Expected Delivery</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-primary-500">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{o.customer?.name}</p>
                        <p className="text-xs text-gray-400">{o.customer?.company || 'Individual'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold ${o.paymentStatus === 'PAID' ? 'text-green-500' : 'text-amber-500'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black">
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      {o.designer ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold">
                            {o.designer.name[0]}
                          </div>
                          <span className="font-medium text-xs">{o.designer.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-gray-500">
                      {o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary-500 hover:text-white rounded-xl transition-all inline-flex items-center justify-center"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div>
                  <p className="text-xs text-gray-400 font-mono">Order Details</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                    <span className="text-primary-500">{selectedOrder.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {/* Status Update & Designer Assignment Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Transition Status
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-none text-gray-900 dark:text-gray-100"
                    >
                      {Object.keys(statusLabels).map(k => (
                        <option key={k} value={k}>{statusLabels[k]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Assign Graphic Designer
                    </label>
                    <select
                      value={selectedOrder.designer?.id || ''}
                      onChange={e => handleAssignDesigner(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:outline-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="">-- Assign Designer --</option>
                      {designers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Client / Agent info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <User size={13} /> Customer Details
                    </h3>
                    <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{selectedOrder.customer?.name}</p>
                      <p><span className="text-gray-400">Email:</span> {selectedOrder.customer?.email}</p>
                      <p><span className="text-gray-400">Phone:</span> {selectedOrder.customer?.phone}</p>
                      <p><span className="text-gray-400">Company:</span> {selectedOrder.customer?.company || 'N/A'}</p>
                      <p><span className="text-gray-400">GSTIN:</span> {selectedOrder.customer?.gstin || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers size={13} /> Sales Representative
                    </h3>
                    <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{selectedOrder.agent?.name}</p>
                      <p><span className="text-gray-400">Email:</span> {selectedOrder.agent?.email}</p>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => copyTrackingLink(selectedOrder.trackingToken)}
                          className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-500 font-bold border border-primary-100 dark:border-primary-800/50 rounded-lg flex items-center gap-1 hover:bg-primary-500 hover:text-white transition-colors"
                        >
                          <Clipboard size={10} /> Copy Tracking URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items detail list */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FileText size={13} /> Order Items
                  </h3>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 uppercase font-bold border-b border-gray-100 dark:border-gray-800">
                          <th className="px-4 py-3">Product Description</th>
                          <th className="px-4 py-3">Color</th>
                          <th className="px-4 py-3">Print Type</th>
                          <th className="px-4 py-3">Sizes (Pcs)</th>
                          <th className="px-4 py-3">Total Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                        {selectedOrder.items?.map(item => {
                          let parsedSizes: { size: string; quantity: number }[] = [];
                          try {
                            parsedSizes = JSON.parse(item.sizeQuantities);
                          } catch (e) {
                            console.error('Failed to parse sizes', e);
                          }
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                {item.productName} ({item.productCode})
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <div className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ background: item.colorHex }} />
                                  <span>{item.colorName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">{item.printType}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {parsedSizes.map(ps => (
                                    <span key={ps.size} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-medium">
                                      {ps.size}: {ps.quantity}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-bold">{item.totalQuantity} pcs</td>
                              <td className="px-4 py-3 text-right font-black">₹{item.totalPrice.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Uploaded Designs & Mockups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Image size={13} /> Client Logo & References
                    </h3>
                    {selectedOrder.referenceFileUrls?.length > 0 || selectedOrder.customerLogoUrls?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                        {[...(selectedOrder.customerLogoUrls || []), ...(selectedOrder.referenceFileUrls || [])].map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No assets uploaded by client.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <PenTool size={13} /> Designer Mockups
                    </h3>
                    {selectedOrder.mockupFileUrls?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                        {selectedOrder.mockupFileUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform shrink-0">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No mockups submitted yet.</p>
                    )}
                  </div>
                </div>

                {/* Pricing Breakdown & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedOrder.customerNotes && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Customer Instructions
                      </h3>
                      <div className="p-3.5 bg-yellow-50/50 dark:bg-amber-900/10 border border-yellow-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 italic leading-relaxed">
                        {selectedOrder.customerNotes}
                      </div>
                    </div>
                  )}
                  <div className="ml-auto w-full max-w-sm space-y-2 text-xs">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Pricing Summary
                    </h3>
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">GST (18% HSN-6109)</span><span className="font-semibold">₹{selectedOrder.gstAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2"><span className="font-bold text-gray-900 dark:text-white">Grand Total</span><span className="font-black text-primary-500 text-sm">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-green-600"><span className="font-medium">Advance Paid (70%)</span><span className="font-bold">₹{selectedOrder.advanceAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-amber-600"><span className="font-medium">Balance Due (30%)</span><span className="font-bold">₹{selectedOrder.balanceAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary px-5"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
