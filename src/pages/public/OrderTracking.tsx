import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Clipboard, Calendar, Clock, CheckCircle2, AlertCircle,
  Package, FileText, ShoppingBag, MapPin, Sparkles
} from 'lucide-react';
import { orderService, OrderResponse } from '@/services/orderService';
import toast from 'react-hot-toast';

// Define status groups for tracking timeline
const steps = [
  {
    key: 'PLACED',
    label: 'Order Placed',
    description: 'We have received your order details and items specification.',
    statuses: ['PENDING']
  },
  {
    key: 'PAYMENT',
    label: 'Advance Verified',
    description: '70% advance payment has been received and verified.',
    statuses: ['PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'DESIGN_IN_PROGRESS']
  },
  {
    key: 'DESIGN',
    label: 'Design & Mockups',
    description: 'Your graphic design mockups are approved for production.',
    statuses: ['DESIGN_APPROVED', 'PRODUCTION']
  },
  {
    key: 'PRODUCTION',
    label: 'In Production',
    description: 'Manufacturing of your shirts is underway in the factories.',
    statuses: ['QUALITY_CHECK', 'DISPATCH_READY']
  },
  {
    key: 'SHIPPED',
    label: 'Dispatched',
    description: 'Your items are shipped and tracking details are active.',
    statuses: ['DISPATCHED']
  },
  {
    key: 'DELIVERED',
    label: 'Completed & Delivered',
    description: 'Order delivered. Balance 30% payment verified.',
    statuses: ['COMPLETED']
  }
];

const allStatusesInOrder = [
  'PENDING',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFIED',
  'DESIGN_IN_PROGRESS',
  'DESIGN_APPROVED',
  'PRODUCTION',
  'QUALITY_CHECK',
  'DISPATCH_READY',
  'DISPATCHED',
  'COMPLETED'
];

export default function OrderTracking() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [inputToken, setInputToken] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handlePayment = async (paymentType: 'ADVANCE' | 'BALANCE') => {
    if (!order) return;
    setProcessingPayment(true);
    const loadingToast = toast.loading('Initializing checkout gateway...');
    try {
      const data = await orderService.createPaymentOrder(order.id, paymentType);
      const { razorpayOrderId, amount, currency, keyId } = data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'PK Corporate erp',
        description: `${paymentType === 'ADVANCE' ? '70% Advance' : '30% Balance'} Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          toast.dismiss(loadingToast);
          const verifyToast = toast.loading('Verifying transaction security...');
          try {
            await orderService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order.id,
              paymentType: paymentType
            });
            toast.dismiss(verifyToast);
            toast.success('Payment verified successfully! Proceeding with design.');
            fetchTrackingInfo(token!);
          } catch (err: any) {
            toast.dismiss(verifyToast);
            toast.error(err?.response?.data?.message || err?.message || 'Payment verification failed.');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: order.customer?.name || '',
          email: order.customer?.email || '',
          contact: order.customer?.phone || ''
        },
        theme: {
          color: '#E10600',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast.dismiss(loadingToast);
            toast.error('Payment checkout dismissed by user.');
          }
        }
      };

      toast.dismiss(loadingToast);
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setProcessingPayment(false);
        toast.error(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();

    } catch (err: any) {
      setProcessingPayment(false);
      toast.dismiss(loadingToast);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to initialize Razorpay checkout.');
    }
  };

  const fetchTrackingInfo = async (trackToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.trackOrder(trackToken);
      setOrder(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid or expired tracking token.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTrackingInfo(token);
    } else {
      setOrder(null);
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      navigate(`/track/${inputToken.trim()}`);
    }
  };

  const getStepState = (stepIndex: number, currentStatus: string) => {
    // Cancelled status check
    if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') {
      return 'error';
    }

    const currentStatusIndex = allStatusesInOrder.indexOf(currentStatus);
    
    // Find the latest status index that belongs to the current step
    const stepStatuses = steps[stepIndex].statuses;
    let stepMaxIndex = -1;
    stepStatuses.forEach(s => {
      const idx = allStatusesInOrder.indexOf(s);
      if (idx > stepMaxIndex) stepMaxIndex = idx;
    });

    // Check if the current status index is past this step
    const isCompleted = currentStatusIndex > stepMaxIndex || currentStatus === 'COMPLETED';
    const isActive = stepStatuses.includes(currentStatus) || 
      (stepIndex === 0 && currentStatusIndex >= 0) || 
      (stepIndex > 0 && currentStatusIndex > allStatusesInOrder.indexOf(steps[stepIndex-1].statuses[steps[stepIndex-1].statuses.length-1]) && currentStatusIndex <= stepMaxIndex);

    if (isCompleted) return 'completed';
    if (isActive) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6 text-gray-900 dark:text-gray-100">
      
      {/* Background visual flourishes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-6 z-10">
        {/* App Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm text-xs font-semibold">
            <Sparkles size={12} className="text-primary-500" />
            <span>Public Tracking Portal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-primary-500 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
            PK Corporate erp
          </h1>
          <p className="text-gray-500 text-sm">Real-time production and delivery timeline tracking</p>
        </div>

        {/* Input Card — show when no token or on error */}
        {(!token || error) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-extrabold">Track Your Order Status</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Enter the unique tracking token provided in your order confirmation email or invoice to check real-time status.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={inputToken}
                  onChange={e => setInputToken(e.target.value)}
                  className="input-field pl-11 py-3"
                  required
                />
              </div>
              <button type="submit" className="btn-primary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2">
                <span>Track Status</span>
              </button>
            </form>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5 max-w-xl mx-auto">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Retrieving order timeline...</p>
          </div>
        )}

        {/* Detailed Timeline Card */}
        {order && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header info */}
            <div className="bg-gradient-to-r from-gray-950 to-gray-900 dark:from-gray-900 dark:to-gray-850 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 font-mono">Real-Time Order Tracking</p>
                <h2 className="text-2xl font-black text-primary-500 mt-1">{order.orderNumber}</h2>
                <p className="text-xs text-gray-300 mt-1">Client: <strong>{order.customer?.company || order.customer?.name}</strong></p>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5 text-xs text-gray-300">
                <span className="bg-primary-500/25 border border-primary-500/40 px-3 py-1 rounded-full text-primary-400 font-black">
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1.5 mt-1">
                  <Calendar size={13} />
                  <span>Est: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</span>
                </span>
              </div>
            </div>

            {/* Payment Alert Banner */}
            {order.paymentStatus === 'PENDING' && (
              <div className="mx-6 sm:mx-8 mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100/80 dark:border-amber-900/30 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500 animate-pulse" size={16} />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Action Required</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Pay Advance to Start Production</h3>
                  <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                    A 70% advance payment of <strong className="text-gray-900 dark:text-white">₹{order.advanceAmount.toLocaleString()}</strong> is required to proceed. Secure online payment is powered by Razorpay.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={() => handlePayment('ADVANCE')}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto justify-center"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      Pay Advance Now (₹{order.advanceAmount.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Steps Timeline */}
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-850">
              <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-6">Production Tracker</h3>
              
              <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                {steps.map((step, idx) => {
                  const state = getStepState(idx, order.status);
                  
                  return (
                    <div key={step.key} className="flex gap-4 relative">
                      {/* Timeline icon indicator */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors duration-300 ${
                        state === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white'
                          : state === 'active'
                          ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : state === 'error'
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                      }`}>
                        {state === 'completed' ? (
                          <CheckCircle2 size={16} />
                        ) : state === 'active' ? (
                          <Clock size={14} className="animate-spin-slow" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Timeline text */}
                      <div className="space-y-1.5 pt-0.5">
                        <h4 className={`text-base font-bold ${
                          state === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : state === 'active'
                            ? 'text-primary-500 font-extrabold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-gray-400 max-w-xl leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Brief items */}
            <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-900/30 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText size={13} /> Items Breakdown
                </h3>
                <div className="space-y-3">
                  {order.items?.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{item.productName}</p>
                        <p className="text-gray-500 mt-0.5">{item.printType} · Color: {item.colorName}</p>
                      </div>
                      <span className="font-black text-sm text-primary-500">{item.totalQuantity} pcs</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package size={13} /> Shipping Summary
                </h3>
                <div className="bg-white dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Order Placed:</span><span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Advance (70%):</span><span className={`font-semibold ${order.paymentStatus === 'PENDING' ? 'text-amber-500' : 'text-green-500'}`}>{order.paymentStatus === 'PENDING' ? 'Pending' : 'Verified'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Balance (30%):</span><span className={`font-semibold ${order.paymentStatus === 'FULLY_PAID' ? 'text-green-500' : 'text-amber-500'}`}>{order.paymentStatus === 'FULLY_PAID' ? 'Paid' : 'Due at delivery'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery Address:</span><span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1"><MapPin size={11} /> Factory Direct</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
