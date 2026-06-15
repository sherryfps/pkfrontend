import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ShoppingCart, X, Eye, Plus, Minus, Trash2,
  ImagePlus, CheckCircle2, User, Banknote, Smartphone,
  AlertCircle, Package, ChevronLeft, ChevronRight, Images,
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { orderService } from '@/services/orderService';
import apiClient from '@/services/apiClient';
import toast from 'react-hot-toast';
import { productService, TShirtProduct as ApiProduct } from '@/services/productService';




// ─── Types ───────────────────────────────────────────────────
interface ProductImageResponse {
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  colorHex?: string;
}

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  fabric: string;
  gsm: string;
  neckType: string;
  sleeveType: string;
  basePrice: number;
  discountPrice?: number;
  effectivePrice: number;
  minimumOrderQuantity: number;
  stockQuantity: number;
  availableColors: string[];
  availableSizes: string[];
  printTypes: string[];
  active: boolean;
  images: ProductImageResponse[];
}

interface SizeQty { size: string; qty: number; }


interface CartItem {
  product: Product;
  color: string;
  sizeQtys: SizeQty[];
  printType: string;
  uploadedPhotos: File[];
  notes: string;
}

// ─── Constants ───────────────────────────────────────────────
const SIZES_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const FABRIC_TYPES = ['All', 'Cotton', 'Polyester', 'Cotton-Poly Blend', 'Pique', 'Fleece'];
const CATEGORIES   = ['All', 'Round Neck', 'Polo', 'Collar', 'Hoodie', 'Henley', 'V-Neck', 'Oversized'];
const GSM_OPTIONS  = ['All', '140 GSM', '160 GSM', '180 GSM', '200 GSM', '220 GSM', '240 GSM', '260 GSM', '320 GSM'];



// ─── Helpers ─────────────────────────────────────────────────
const totalQty = (sqs: SizeQty[]) => sqs.reduce((s, sq) => s + sq.qty, 0);
const itemTotal = (item: CartItem) => item.product.effectivePrice * totalQty(item.sizeQtys);

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// ─── ImageGallery ─────────────────────────────────────────────
/**
 * Full-featured image gallery with:
 * - Large main viewer with fade transition
 * - Thumbnail strip (clickable)
 * - Prev / Next arrow buttons
 * - Keyboard ← → navigation
 * - Image counter badge (e.g. "2 / 4")
 */
function ImageGallery({ images, productName }: { images: ProductImageResponse[]; productName: string }) {


  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (idx: number) => {
    setDir(idx > active ? 1 : -1);
    setActive(idx);
  };
  const prev = () => go((active - 1 + images.length) % images.length);
  const next = () => go((active + 1) % images.length);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, images.length]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -32 }),
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <AnimatePresence custom={dir} mode="wait">
            <motion.img

            key={active}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            src={images[active]?.imageUrl}
            alt={`${productName} — view ${active + 1}`}

            className="absolute inset-0 w-full h-full object-contain p-6"
          />
        </AnimatePresence>

        {/* Counter badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full select-none">
          {active + 1} / {images.length}
        </div>

        {/* Arrows — only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:scale-105 transition-all shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:scale-105 transition-all shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (

            <button
                key={i}
                onClick={() => go(i)}

              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === active
                  ? 'border-primary-500 shadow-md scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-contain p-1 bg-gray-50 dark:bg-gray-800" />

            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PhotoUploader ────────────────────────────────────────────
function PhotoUploader({ photos, onChange }: { photos: File[]; onChange: (f: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    onChange([...photos, ...arr].slice(0, 8));
  };
  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i));
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); onFiles(e.dataTransfer.files);
  }, [photos]);

  return (
    <div>
      <p className="label mb-2">Upload Design / Reference Photos <span className="text-gray-400 font-normal">(up to 8)</span></p>
      <div className="flex flex-wrap gap-2">
        {photos.map((f, i) => (
          <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <X size={14} className="text-white" />
            </button>
          </div>
        ))}
        {photos.length < 8 && (
          <div
            onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => ref.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-gray-400 hover:text-primary-500 gap-1"
          >
            <ImagePlus size={18} />
            <span className="text-[10px] font-medium">Add</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
    </div>
  );
}

// ─── SizeQtyPicker ────────────────────────────────────────────
function SizeQtyPicker({ availableSizes, sizeQtys, onChange }: {
  availableSizes: string[]; sizeQtys: SizeQty[]; onChange: (sq: SizeQty[]) => void;
}) {
  const orderedSizes = SIZES_ORDER.filter(s => availableSizes.includes(s));
  const selected = new Set(sizeQtys.map(sq => sq.size));
  const total = totalQty(sizeQtys);

  const toggle = (size: string) => {
    if (selected.has(size)) onChange(sizeQtys.filter(sq => sq.size !== size));
    else onChange([...sizeQtys, { size, qty: 10 }]);
  };
  const setQty = (size: string, qty: number) =>
    onChange(sizeQtys.map(sq => sq.size === size ? { ...sq, qty: Math.max(0, qty) } : sq));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="label mb-0">Sizes & Quantities</p>
        {total > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total >= 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            Total: {total} pcs{total < 10 ? ' (min 10)' : ''}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {orderedSizes.map(size => {
          const isSel = selected.has(size);
          const sq = sizeQtys.find(s => s.size === size);
          return (
            <div key={size} className={`flex items-center gap-3 rounded-xl p-2.5 border transition-all ${isSel ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'}`}>
              <button type="button" onClick={() => toggle(size)}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isSel ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
                {isSel && <CheckCircle2 size={14} />}
              </button>
              <span className={`w-10 text-sm font-bold ${isSel ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>{size}</span>
              {isSel && sq ? (
                <div className="flex items-center gap-2 ml-auto">
                  <button type="button" onClick={() => setQty(size, sq.qty - 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Minus size={12} /></button>
                  <input type="number" min={0} value={sq.qty} onChange={e => setQty(size, parseInt(e.target.value) || 0)}
                    className="w-14 text-center text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  <button type="button" onClick={() => setQty(size, sq.qty + 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus size={12} /></button>
                  <span className="text-xs text-gray-400 w-8">pcs</span>
                </div>
              ) : (
                <span className="ml-auto text-xs text-gray-400">Tap to select</span>
              )}
            </div>
          );
        })}
      </div>
      {total > 0 && total < 10 && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle size={12} /> Add {10 - total} more pieces to meet MOQ of 10.
        </p>
      )}
    </div>
  );
}

// ─── ProductModal ─────────────────────────────────────────────
function ProductModal({ product, onClose, onAddToCart }: {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}) {
  const [color, setColor] = useState(product.availableColors[0] ?? '#000000');

  const [sizeQtys, setSizeQtys] = useState<SizeQty[]>([]);
  const [printType, setPrintType] = useState(product.printTypes[0]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');


  const total = totalQty(sizeQtys);
  const subtotal = product.effectivePrice * total;
  const canAdd = total >= product.minimumOrderQuantity;



  const handleAdd = () => {
    if (!canAdd) return;
    onAddToCart({ product, color, sizeQtys, printType, uploadedPhotos: photos, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <p className="text-xs text-gray-400 font-mono">{product.id}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{product.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">{product.fabric} · {product.gsm} · MOQ: {product.minimumOrderQuantity} pcs</p>

                      <span className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                <Images size={11} /> {product.images.length} photos
              </span>

            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-1 ml-3">
            <X size={18} />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">

            {/* Left: image gallery + desc + color + print */}
            <div className="p-5 space-y-4">
              {/* Multi-image gallery */}
              <ImageGallery images={product.images} productName={product.name} />

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{product.description ?? ''}</p>


              {/* Color */}
              <div>
                <p className="label mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {(product.availableColors ?? []).map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${color === c ? 'border-primary-500 scale-110 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:scale-105'}`}
                      style={{ background: c }} title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Print type */}
              <div>
                <p className="label mb-2">Print / Decoration Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.printTypes.map(pt => (
                    <button key={pt} type="button" onClick={() => setPrintType(pt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${printType === pt ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: sizes, upload, notes, price */}
            <div className="p-5 space-y-5">
              <SizeQtyPicker availableSizes={product.availableSizes ?? []} sizeQtys={sizeQtys} onChange={setSizeQtys} />
              <PhotoUploader photos={photos} onChange={setPhotos} />
              <div>
                <label className="label mb-2">Special Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="e.g. Print on back only, sleeve print required..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none placeholder-gray-400 text-gray-900 dark:text-gray-100" />
              </div>
              {total > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Summary</p>
                  {sizeQtys.map(sq => (
                    <div key={sq.size} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{sq.size} × {sq.qty} pcs</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatINR(sq.qty * product.effectivePrice)}</span>

                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{total} pcs total</span>
                    <span className="font-black text-primary-500 text-lg">{formatINR(subtotal)}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="btn-secondary px-5">Cancel</button>
          <button onClick={handleAdd} disabled={!canAdd}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingCart size={16} />
            {canAdd ? `Add to Cart · ${formatINR(subtotal)}` : `Need ${product.minimumOrderQuantity - total} more pcs (${total}/${product.minimumOrderQuantity})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────
function CartDrawer({ cart, customer, setCustomer, onClose, onRemove, onClearCart, customers }: {
  cart: CartItem[]; customer: string; setCustomer: (s: string) => void;
  onClose: () => void; onRemove: (i: number) => void; onClearCart: () => void;
  customers: any[];
}) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [step, setStep] = useState<'review' | 'confirmed'>('review');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderNum, setPlacedOrderNum] = useState('');
  const grandTotal = cart.reduce((s, item) => s + itemTotal(item), 0);
  const advance = Math.round(grandTotal * 0.7);
  const balance = grandTotal - advance;

  const handleConfirmOrder = async () => {

    if (!customer) {
      toast.error('Please select a registered customer');
      return;
    }
    // Validate all products have a backend UUID before checkout
    const unmatchedItems = cart.filter(item => !item.product?.id);

    if (unmatchedItems.length > 0) {
      toast.error(`${unmatchedItems.length} product(s) not synced with backend. Please refresh the catalog.`);
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading('Submitting your order details...');
    try {
      const payload = {
        customerId: customer,
        items: cart.map(item => ({
          productId: item.product.id,
          colorHex: item.color,
          colorName: item.color,
          printType: item.printType,
          sizeQuantities: item.sizeQtys.map(sq => ({
            size: sq.size,
            quantity: sq.qty
          }))
        }))
      };

      const order = await orderService.createOrder(payload);
      setPlacedOrderNum(order.orderNumber);

      // Collect any uploaded reference photos and submit
      const allFiles = cart.flatMap(item => item.uploadedPhotos);
      if (allFiles.length > 0) {
        toast.loading('Uploading reference design files to Cloudinary...', { id: toastId });
        await orderService.uploadReferences(order.id, allFiles);
      }

      toast.success('Order placed successfully!', { id: toastId });
      setStep('confirmed');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to place order';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustObj = customers.find(c => c.id === customer);

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="relative ml-auto w-full max-w-lg bg-white dark:bg-gray-900 flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Cart</h2>
            <span className="badge badge-error ml-1">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>

        {step === 'confirmed' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 18 }}>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
            </motion.div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Order Confirmed!</h3>
            <p className="text-sm text-gray-500">Order ID: <strong className="font-mono text-primary-500">{placedOrderNum}</strong></p>
            <p className="text-gray-500 text-xs">Customer: <strong>{selectedCustObj?.name || 'Client'}</strong></p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 w-full space-y-2 text-sm mt-2">
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-black text-gray-900 dark:text-white">{formatINR(grandTotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Advance (70%)</span><span className="font-bold text-green-600">{formatINR(advance)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Balance (30%)</span><span className="font-bold text-amber-600">{formatINR(balance)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-semibold">{paymentMethod}</span></div>
            </div>
            <button onClick={() => { onClearCart(); onClose(); }} className="btn-primary w-full mt-4">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
              <div>
                <label className="label mb-2"><User size={13} className="inline mr-1" />Select Customer <span className="text-red-500">*</span></label>
                <select
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Select client profile --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Don't see the customer? Register them first under <a href="/agent/customers" className="text-primary-500 hover:underline">My Customers</a>.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Items</p>
                {cart.map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img src={item.product.images[0]?.imageUrl} alt={item.product.name} className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-gray-700 p-1 border border-gray-100 dark:border-gray-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-3 h-3 rounded-full border border-gray-300" style={{ background: item.color }} />
                          <span className="text-xs text-gray-500">{item.printType}</span>
                        </div>
                      </div>
                      <button onClick={() => onRemove(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.sizeQtys.map(sq => (
                        <span key={sq.size} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-600">
                          <span className="text-gray-500">{sq.size}</span><span className="text-primary-600 dark:text-primary-400">×{sq.qty}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{totalQty(item.sizeQtys)} pcs × {formatINR(item.product.effectivePrice)}</span>
                      <span className="font-black text-gray-900 dark:text-white">{formatINR(itemTotal(item))}</span>
                    </div>
                    {item.uploadedPhotos.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {item.uploadedPhotos.map((f, pi) => (
                          <img key={pi} src={URL.createObjectURL(f)} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                        ))}
                        <span className="text-xs text-gray-400 self-end ml-1">{item.uploadedPhotos.length} ref photo{item.uploadedPhotos.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'CASH', label: 'Cash', icon: Banknote, desc: 'Physical currency' },
                    { id: 'ONLINE', label: 'Online', icon: Smartphone, desc: 'UPI / Bank transfer' },
                  ] as const).map(opt => (
                    <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${paymentMethod === opt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <opt.icon size={20} className={paymentMethod === opt.id ? 'text-primary-500' : 'text-gray-400'} />
                      <p className={`font-bold text-sm mt-2 ${paymentMethod === opt.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                      {paymentMethod === opt.id && <div className="mt-1.5 w-full flex justify-end"><CheckCircle2 size={14} className="text-primary-500" /></div>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 space-y-3 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-300">Payment Breakdown</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Grand Total</span>
                  <span className="font-black text-xl">{formatINR(grandTotal)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-bold text-green-400">Advance — 70%</p><p className="text-xs text-gray-400">Collect at order confirmation</p></div>
                    <span className="font-black text-green-400 text-lg">{formatINR(advance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-bold text-amber-400">Balance — 30%</p><p className="text-xs text-gray-400">Collect after order delivery</p></div>
                    <span className="font-black text-amber-400 text-lg">{formatINR(balance)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3 shrink-0">
              {!customer && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle size={12} /> Choose a customer to confirm order
                </p>
              )}
              <button onClick={handleConfirmOrder} disabled={!customer || cart.length === 0 || submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Confirm Order · {formatINR(grandTotal)}
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                Collecting <strong className="text-green-600">{formatINR(advance)}</strong> advance · {formatINR(balance)} after delivery
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
const [selectedGSM, setSelectedGSM] = useState('All');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // Load products from backend (no dummy/static catalog)
    productService.getProducts()
      .then(res => {
        const list = (res ?? []).map((p: ApiProduct) => ({
          id: String((p as any).id ?? (p as any).productCode ?? ''),
          productCode: p.productCode,
          name: p.name,
          description: p.description,
          brand: p.brand,
          category: p.category,
          fabric: p.fabric,
          gsm: p.gsm,
          neckType: p.neckType,
          sleeveType: p.sleeveType,
          minimumOrderQuantity: p.minimumOrderQuantity,
          basePrice: Number(p.basePrice),
          discountPrice: (p as any).discountPrice ?? null,
          effectivePrice: Number(p.effectivePrice ?? p.basePrice),
          active: p.active,
          stockQuantity: p.stockQuantity,
          availableSizes: p.availableSizes,
          availableColors: p.availableColors,
          printTypes: p.printTypes,
          images: (p.images ?? []).map(img => ({
            id: String(img.id ?? ''),
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        }));
        setCatalogProducts(list);
      })
      .catch(err => {
        console.error('Failed to load products from backend:', err);
        toast.error('Failed to load catalog products');
      });

    // Load customers
    customerService.getCustomers('', 0, 100)
      .then(res => {
        setCustomers(res.content ?? []);
      })
      .catch(err => {
        console.error('Failed to load customers:', err);
      });
  }, []);


  const filtered = catalogProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
      (selectedFabric === 'All' || p.fabric === selectedFabric) &&
      (selectedCategory === 'All' || p.category === selectedCategory) &&
      (selectedGSM === 'All' || String(p.gsm) === selectedGSM)
    );
  });


  const addToCart = (item: CartItem) => setCart(c => [...c, item]);
  const removeFromCart = (i: number) => setCart(c => c.filter((_, idx) => idx !== i));
  const clearCart = () => { setCart([]); setCustomer(''); };
  const activeFilters = [selectedFabric, selectedCategory, selectedGSM].filter(f => f !== 'All').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">T-Shirt Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">{catalogProducts.length} products · MOQ 10 pcs per order</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="btn-primary flex items-center gap-2 relative shrink-0">
          <ShoppingCart size={16} />
          <span className="hidden sm:inline">Cart</span>
          {cart.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
        </button>
      </div>

      {/* MOQ banner */}
      <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0"><Package size={15} className="text-white" /></div>
        <div>
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Minimum Order Quantity: 10 pieces per product</p>
          <p className="text-xs text-primary-600/70 dark:text-primary-400/70 hidden sm:block">Mix sizes freely to meet the minimum. Click any product to view all photos.</p>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, type, ID..." className="input-field pl-10" />
        </div>
        <button onClick={() => setFiltersOpen(!filtersOpen)} className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${filtersOpen ? 'border-primary-300 text-primary-600' : ''}`}>
          <Filter size={16} /> Filters
          {activeFilters > 0 && <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Fabric Type', opts: FABRIC_TYPES, val: selectedFabric, set: setSelectedFabric },
                { label: 'Category', opts: CATEGORIES, val: selectedCategory, set: setSelectedCategory },
                { label: 'GSM Weight', opts: GSM_OPTIONS, val: selectedGSM, set: setSelectedGSM },
              ].map(f => (
                <div key={f.label}>
                  <label className="label">{f.label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {f.opts.map(o => (
                      <button key={o} onClick={() => f.set(o)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${f.val === o ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
        {activeFilters > 0 && (
          <button onClick={() => { setSelectedFabric('All'); setSelectedCategory('All'); setSelectedGSM('All'); }} className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((product, i) => {
          const inCart = cart.some(c => c.product.id === product.id);
          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 group flex flex-col">
              {/* Card image — shows first image; hover reveals "View X photos" button */}
              <div className="relative bg-gray-50 dark:bg-gray-800 aspect-square flex items-center justify-center p-5 overflow-hidden">
                <img src={product.images[0]?.imageUrl} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => setConfigProduct(product)}
                    className="bg-white text-gray-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye size={12} />
                    {product.images.length > 1 ? `View ${product.images.length} photos` : 'Configure'}
                  </button>
                </div>
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span className="badge badge-neutral text-[10px]">{product.category}</span>
                  {inCart && <span className="badge badge-success text-[10px]">In Cart</span>}
                </div>
                {/* Photo count badge — bottom right */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Images size={10} /> {product.images.length}
                  </div>
                )}
              </div>
              <div className="p-3.5 flex flex-col flex-1">
                <p className="text-[10px] text-gray-400 font-mono">{product.id}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 leading-tight mb-2">{product.name}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="badge badge-neutral text-[10px]">{product.fabric}</span>
                  <span className="badge badge-neutral text-[10px]">{product.gsm}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {(product.availableColors ?? []).slice(0, 5).map(c => (
                    <div key={c} className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-gray-700" style={{ background: c }} />
                  ))}
                  {(product.availableColors ?? []).length > 5 && <span className="text-[10px] text-gray-400">+{product.availableColors.length - 5}</span>}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-base font-black text-gray-900 dark:text-white">{formatINR(product.effectivePrice)}</p>
                    <p className="text-[10px] text-gray-400">per piece</p>
                  </div>
                  <button onClick={() => setConfigProduct(product)} className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                    <Plus size={12} /> Select
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">👕</div>
          <p className="text-gray-500 font-medium">No products match your filters</p>
          <button onClick={() => { setSearchQuery(''); setSelectedFabric('All'); setSelectedCategory('All'); setSelectedGSM('All'); }} className="text-primary-500 text-sm mt-2 hover:text-primary-600">Clear all filters</button>
        </div>
      )}

      <AnimatePresence>
        {configProduct && (
          <ProductModal product={configProduct} onClose={() => setConfigProduct(null)} onAddToCart={item => { addToCart(item); setConfigProduct(null); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer cart={cart} customer={customer} setCustomer={setCustomer} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onClearCart={clearCart} customers={customers} />
        )}
      </AnimatePresence>
    </div>
  );
}
