import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Calendar,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { subscribeToOrders } from '../services/storeService';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = ''
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load locally placed orders for quick click
    try {
      const saved = JSON.parse(localStorage.getItem('jihan_customer_orders') || '[]');
      setMyOrders(saved);
      if (initialOrderNumber) {
        setSearchInput(initialOrderNumber);
        searchForOrder(initialOrderNumber);
      } else if (saved.length > 0 && !trackedOrder) {
        setTrackedOrder(saved[0]);
      }
    } catch {
      // Ignore
    }
  }, [isOpen, initialOrderNumber]);

  const searchForOrder = (queryText: string) => {
    const q = queryText.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);
  };

  // Live real-time sync with database orders when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const q = searchInput.trim().toLowerCase();
    if (!q) return;

    const unsubscribe = subscribeToOrders((orders) => {
      const match = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === q ||
          o.id.toLowerCase() === q ||
          o.customerPhone.includes(q)
      );
      if (match) {
        setTrackedOrder(match);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchForOrder(searchInput);
  };

  if (!isOpen) return null;

  const STATUS_STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIndex = trackedOrder ? getStepIndex(trackedOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="order-tracking-modal"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">অর্ডার ট্র্যাকিং</h3>
              <p className="text-xs text-slate-400">আপনার অর্ডারের রিয়েল-টাইম ডেলিভারি স্ট্যাটাস দেখুন</p>
            </div>
          </div>
          <button
            id="tracking-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="tracking-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="অর্ডার নম্বর (যেমন: JS-4821) বা মোবাইল নম্বর লিখুন..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              id="tracking-search-btn"
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {/* Recently placed orders quick pills */}
          {myOrders.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-slate-500 shrink-0">আপনার অর্ডার:</span>
              {myOrders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSearchInput(o.orderNumber);
                    setTrackedOrder(o);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-blue-700 hover:bg-blue-50 shrink-0 transition-colors"
                >
                  #{o.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {trackedOrder ? (
            <>
              {/* Order Meta Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">অর্ডার নম্বর:</span>
                    <span className="text-base font-black text-blue-800">#{trackedOrder.orderNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(trackedOrder.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                    trackedOrder.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trackedOrder.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {trackedOrder.orderStatus === 'Pending' && 'পেন্ডিং (অপেক্ষমান)'}
                    {trackedOrder.orderStatus === 'Confirmed' && 'কনফার্ম হয়েছে'}
                    {trackedOrder.orderStatus === 'Processing' && 'প্যাকেজিং হচ্ছে'}
                    {trackedOrder.orderStatus === 'Shipped' && 'ডেলিভারিতে রয়েছে'}
                    {trackedOrder.orderStatus === 'Delivered' && 'ডেলিভারি সম্পন্ন'}
                    {trackedOrder.orderStatus === 'Cancelled' && 'বাতিল করা হয়েছে'}
                  </span>
                </div>
              </div>

              {/* Status Stepper Timeline */}
              {trackedOrder.orderStatus !== 'Cancelled' ? (
                <div className="py-2">
                  <div className="relative flex justify-between">
                    {/* Background Progress Bar */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-0" />
                    <div 
                      className="absolute top-4 left-4 h-1 bg-blue-700 transition-all duration-500 -z-0"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%` 
                      }} 
                    />

                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 scale-110 shadow-sm'
                              : isCompleted
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-semibold mt-1.5 text-center ${
                            isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                          }`}>
                            {step === 'Pending' && 'পেন্ডিং'}
                            {step === 'Confirmed' && 'কনফার্মড'}
                            {step === 'Processing' && 'প্রসেসিং'}
                            {step === 'Shipped' && 'শিপড'}
                            {step === 'Delivered' && 'ডেলিভার্ড'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে সাপোর্টে কথা বলুন।</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">অর্ডারকৃত পণ্যসমূহ:</h4>
                <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-2xl p-2 border border-slate-100">
                  {trackedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 px-1">
                      <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{it.name}</p>
                        <p className="text-[11px] text-slate-500">পরিমাণ: {it.quantity} টি</p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">৳{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    <span>ডেলিভারি ঠিকানা</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{trackedOrder.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{trackedOrder.customerPhone}</span>
                  </p>
                  <p className="text-slate-500 mt-1">{trackedOrder.shippingAddress}</p>
                  <p className="text-[11px] text-blue-700 font-medium mt-1">
                    {trackedOrder.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে' : 'সন্দ্বীপের বাইরে'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                    <span>পেমেন্ট তথ্য</span>
                  </div>
                  <p className="text-slate-700">
                    মেথড: <span className="font-bold uppercase">{trackedOrder.paymentMethod}</span>
                  </p>
                  {trackedOrder.trxId && (
                    <p className="text-slate-700">
                      TrxID: <span className="font-mono font-bold text-blue-700">{trackedOrder.trxId}</span>
                    </p>
                  )}
                  <div className="pt-2 border-t border-slate-200 space-y-0.5">
                    <div className="flex justify-between text-slate-600">
                      <span>সাবটোটাল:</span>
                      <span>৳{trackedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span>৳{trackedOrder.deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between font-black text-blue-900 pt-1 border-t border-slate-200">
                      <span>সর্বমোট:</span>
                      <span className="text-sm">৳{trackedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              {hasSearched ? (
                <>
                  <p className="text-sm font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-500 mt-1">অনুগ্রহ করে সঠিক অর্ডার নম্বর বা মোবাইল নম্বর দিয়ে পুনরায় চেষ্টা করুন।</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-700">অর্ডার ট্র্যাক করতে নম্বর দিন</p>
                  <p className="text-xs text-slate-500 mt-1">আপনার অর্ডার সম্পন্ন করার পর পাওয়া অর্ডার নম্বরটি (যেমন: JS-4821) সার্চ করুন।</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
