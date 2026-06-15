import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Upload, CheckCircle2, Clock, RefreshCw, AlertCircle, X,
  User, Layers, FileText, Image as ImageIcon, PenTool, Clipboard, ImagePlus
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { orderService, OrderResponse } from '@/services/orderService';
import apiClient from '@/services/apiClient';
import toast from 'react-hot-toast';

interface DesignBrief {
  id: string; // orderNumber
  dbId: string; // UUID
  customer: string;
  qty: number;
  deadline: string;
  status: string;
  priority: string;
  notes: string;
  mockupUploaded: boolean;
}

interface DesignerStats {
  assignedOrders: number;
  mockupsPending: number;
  approvedThisMonth: number;
  avgTurnaround: string;
  orders: DesignBrief[];
}

export default function DesignerOrders() {
  const [data, setData] = useState<DesignerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DesignBrief | null>(null);
  const [detailedOrder, setDetailedOrder] = useState<OrderResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/v1/dashboard/designer');
      setData(res.data?.data ?? res.data);
    } catch (err: any) {
      setError('Could not load assigned design tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewBrief = async (brief: DesignBrief) => {
    setSelectedOrder(brief);
    setLoadingDetails(true);
    setDetailedOrder(null);
    try {
      const details = await orderService.getOrderById(brief.dbId);
      setDetailedOrder(details);
    } catch (err: any) {
      toast.error('Failed to load order design details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUploadMockup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOrder || !e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const toastId = toast.loading('Uploading mockups...');
    try {
      const files = Array.from(e.target.files);
      const updated = await orderService.uploadMockups(selectedOrder.dbId, files);
      setDetailedOrder(updated);
      toast.success('Mockups uploaded successfully', { id: toastId });
      // Refresh list
      const res = await apiClient.get('/v1/dashboard/designer');
      setData(res.data?.data ?? res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload mockups', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-gray-500 text-sm">{error || 'No data available'}</p>
        <button onClick={loadData} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const stats = [
    { title: 'Total Assigned', value: data.assignedOrders, icon: Palette, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Mockups Pending', value: data.mockupsPending, icon: Upload, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'Approved This Month', value: data.approvedThisMonth, icon: CheckCircle2, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Avg. Turnaround', value: data.avgTurnaround, icon: Clock, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Assigned Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and upload mockups for your delegated graphic design tasks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.title} {...s} index={i} />
        ))}
      </div>

      {/* Task List */}
      {data.orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-card">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🎨</div>
          <p className="text-gray-500 font-medium">No design tasks assigned to you currently</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.orders.map((brief, i) => (
            <motion.div
              key={brief.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-400">{brief.id}</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{brief.customer}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${brief.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20' : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20'}`}>
                    {brief.priority} Priority
                  </span>
                </div>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between"><span className="text-gray-400">Total Quantity:</span><span className="text-gray-900 dark:text-white">{brief.qty} pcs</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Deadline:</span><span className="text-red-500">{brief.deadline}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400">Current Phase:</span><OrderStatusBadge status={brief.status} /></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mockup Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${brief.mockupUploaded ? 'bg-green-100 text-green-700 dark:bg-green-950/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'}`}>
                      {brief.mockupUploaded ? '✓ Uploaded' : 'Pending Upload'}
                    </span>
                  </div>
                </div>
                {brief.notes && (
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 italic max-h-16 overflow-y-auto">
                    {brief.notes}
                  </div>
                )}
              </div>
              <div className="px-5 pb-5 pt-2 flex gap-2">
                <button
                  onClick={() => handleViewBrief(brief)}
                  className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Palette size={13} />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Brief Detail & Mockup Uploader Dialog */}
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
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div>
                  <p className="text-xs text-gray-400 font-mono">Delegated Design Brief</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-2">
                    <span>{selectedOrder.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedOrder.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {selectedOrder.priority} Priority
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
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading brief specs...</p>
                  </div>
                ) : detailedOrder ? (
                  <>
                    {/* General Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                      <div><p className="text-gray-400">Customer</p><p className="font-bold text-sm text-gray-900 dark:text-white">{detailedOrder.customer?.name}</p></div>
                      <div><p className="text-gray-400">Total Quantity</p><p className="font-bold text-sm text-gray-900 dark:text-white">{selectedOrder.qty} pcs</p></div>
                      <div><p className="text-gray-400">Deadline</p><p className="font-bold text-sm text-red-500">{selectedOrder.deadline}</p></div>
                      <div><p className="text-gray-400">Status</p><div className="mt-1"><OrderStatusBadge status={detailedOrder.status} /></div></div>
                    </div>

                    {/* Order Items description */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText size={13} /> Item Details
                      </h3>
                      <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                              <th className="px-4 py-2.5">Product Name</th>
                              <th className="px-4 py-2.5">Color</th>
                              <th className="px-4 py-2.5">Print Decoration</th>
                              <th className="px-4 py-2.5 text-right">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                            {detailedOrder.items?.map(item => (
                              <tr key={item.id}>
                                <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">{item.productName} ({item.productCode})</td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: item.colorHex }} />
                                    <span>{item.colorName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">{item.printType}</td>
                                <td className="px-4 py-2.5 text-right font-bold">{item.totalQuantity} pcs</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Client Uploaded Logos & References */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ImageIcon size={13} /> Client Logo & References
                      </h3>
                      {[...(detailedOrder.customerLogoUrls || []), ...(detailedOrder.referenceFileUrls || [])].length > 0 ? (
                        <div className="flex flex-wrap gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                          {[...(detailedOrder.customerLogoUrls || []), ...(detailedOrder.referenceFileUrls || [])].map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform shrink-0 shadow-sm">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No reference images uploaded by customer.</p>
                      )}
                    </div>

                    {/* Designer Mockups Upload & Management */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <PenTool size={13} /> Design Mockups
                      </h3>
                      
                      <div className="flex flex-wrap gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                        {/* Drag and Drop Upload Button */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-500 transition-all shrink-0 cursor-pointer"
                          title="Upload mockups"
                        >
                          <ImagePlus size={18} />
                          <span className="text-[9px] font-bold">Add file</span>
                        </button>

                        {/* Existing Mockups */}
                        {detailedOrder.mockupFileUrls?.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform shrink-0 shadow-sm">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadMockup}
                      />
                    </div>

                    {/* Brief Note */}
                    {detailedOrder.customerNotes && (
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Brief Instructions</h3>
                        <div className="p-4 bg-yellow-50/50 dark:bg-amber-900/10 border border-yellow-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed italic">
                          {detailedOrder.customerNotes}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-center text-red-500 py-10">Could not retrieve brief details.</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary px-5"
                >
                  Close Brief
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
