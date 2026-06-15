import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Layers, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface DesignBrief {
  id: string; // orderNumber
  dbId: string;
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
  orders: DesignBrief[];
}

interface MockupGalleryItem {
  orderNumber: string;
  customer: string;
  mockupUrl: string;
}

export default function MockupsPage() {
  const [mockups, setMockups] = useState<MockupGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMockups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/v1/dashboard/designer');
      const data: DesignerStats = res.data?.data ?? res.data;
      
      // Fetch full details of orders with mockups in parallel
      const ordersWithMockups = (data.orders || []).filter(o => o.mockupUploaded);
      const detailResults = await Promise.allSettled(
        ordersWithMockups.map(order =>
          apiClient.get(`/v1/orders/${order.dbId}`).then(r => ({
            order,
            detail: r.data?.data ?? r.data
          }))
        )
      );

      const galleryItems: MockupGalleryItem[] = [];
      for (const result of detailResults) {
        if (result.status === 'fulfilled') {
          const { order, detail } = result.value;
          if (detail.mockupFileUrls && detail.mockupFileUrls.length > 0) {
            detail.mockupFileUrls.forEach((url: string) => {
              galleryItems.push({
                orderNumber: order.id,
                customer: order.customer,
                mockupUrl: url
              });
            });
          }
        }
      }
      setMockups(galleryItems);
    } catch (err: any) {
      setError('Failed to load mockups library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMockups();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-gray-500 text-sm">{error}</p>
        <button onClick={loadMockups} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Design Mockups</h1>
        <p className="text-gray-500 text-sm mt-1">A consolidated gallery of all high-resolution mockups you have uploaded for active client orders.</p>
      </div>

      {mockups.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-card">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🖼️</div>
          <p className="text-gray-500 font-medium">No uploaded mockups found</p>
          <p className="text-xs text-gray-400 mt-1">Upload mockups inside your Assigned Orders detail cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockups.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover hover:border-gray-200 dark:hover:border-gray-700 transition-all group"
            >
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-850 flex items-center justify-center overflow-hidden">
                <img src={item.mockupUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <a
                    href={item.mockupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-gray-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Eye size={12} />
                    <span>View Image</span>
                  </a>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-mono text-primary-500 font-bold">{item.orderNumber}</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate mt-0.5">{item.customer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
