import React from 'react';
import { CheckCircle2, Copy, Clock, MessageSquare, ArrowRight, Home } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onOpenSupport: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  onOpenSupport,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="order-success-modal"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          অভিনন্দন! অর্ডার সফল হয়েছে
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm">
          আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। দ্রুততম সময়ে ডেলিভারি প্রক্রিয়া শুরু হবে।
        </p>

        {/* Order Number Box */}
        <div className="mt-5 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl w-full flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              অর্ডার নম্বর (Order ID)
            </span>
            <p className="text-lg sm:text-xl font-black text-blue-800">
              #{order.orderNumber}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>
        </div>

        {/* Quick Order Breakdown */}
        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-full text-xs space-y-1.5 text-left">
          <div className="flex justify-between text-slate-700">
            <span>কাস্টমার:</span>
            <span className="font-bold">{order.customerName} ({order.customerPhone})</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>ডেলিভারি এরিয়া:</span>
            <span className="font-bold">
              {order.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে' : 'সন্দ্বীপের বাইরে'}
            </span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>পেমেন্ট মেথড:</span>
            <span className="font-bold uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-extrabold pt-1 border-t border-slate-200">
            <span>মোট মূল্য:</span>
            <span className="text-blue-700 text-sm">৳{order.totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full space-y-2">
          <button
            id="success-track-btn"
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>অর্ডারের বর্তমান স্ট্যাটাস দেখুন</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSupport();
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <span>সাপোর্টে কথা বলুন</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>শপিং চালিয়ে যান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
