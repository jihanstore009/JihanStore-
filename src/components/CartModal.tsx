import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    deliveryArea, 
    selectedZoneId,
    setDeliveryArea, 
    setSelectedZoneId,
    getDeliveryCharge 
  } = useCart();
  const { settings } = useSettings();

  if (!isOpen) return null;

  const deliveryCharge = getDeliveryCharge(settings.deliveryInsideSandwip, settings.deliveryOutsideSandwip, settings.deliveryZones);
  const totalAmount = subtotal + deliveryCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div 
        id="cart-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
            <h2 className="font-bold text-base text-slate-800">
              আপনার শপিং কার্ট ({cart.length})
            </h2>
          </div>
          <button
            id="cart-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-700">কার্ট খালি আছে</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                আপনার পছন্দের প্রোডাক্ট যুক্ত করে সহজে অর্ডার সম্পন্ন করুন।
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 rounded-xl bg-blue-700 text-white font-semibold text-xs hover:bg-blue-800 transition-colors"
              >
                শপিং শুরু করুন
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                id={`cart-item-${item.product.id}`}
                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-blue-700 font-bold mt-0.5">
                    ৳{item.product.price.toLocaleString('bn-BD')}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="কমান"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="বাড়ান"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-auto"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delivery Area & Summary Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
            {/* Delivery Area Option */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                ডেলিভারি লোকেশন নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryArea('inside_sandwip');
                    setSelectedZoneId(undefined);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryArea === 'inside_sandwip' && !selectedZoneId
                      ? 'border-blue-700 bg-blue-50/80 text-blue-900 font-bold ring-1 ring-blue-700'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p className="font-semibold text-xs">সন্দ্বীপের ভিতরে</p>
                  <p className="text-[11px] text-emerald-600 font-bold">
                    {settings.deliveryInsideSandwip === 0 ? 'ফ্রি' : `৳${settings.deliveryInsideSandwip}`}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryArea('outside_sandwip');
                    setSelectedZoneId(undefined);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    deliveryArea === 'outside_sandwip' && !selectedZoneId
                      ? 'border-blue-700 bg-blue-50/80 text-blue-900 font-bold ring-1 ring-blue-700'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <p className="font-semibold text-xs">সন্দ্বীপের বাইরে</p>
                  <p className="text-[11px] text-blue-700 font-bold">৳{settings.deliveryOutsideSandwip}</p>
                </button>
              </div>

              {/* Dynamic Upazilas Dropdown / Selection */}
              {settings.deliveryZones && settings.deliveryZones.filter(z => z.enabled).length > 0 && (
                <div className="pt-1">
                  <select
                    value={selectedZoneId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setSelectedZoneId(undefined);
                      } else {
                        setSelectedZoneId(val);
                        const match = settings.deliveryZones?.find(z => z.id === val);
                        if (match) {
                          setDeliveryArea(match.isInsideSandwip ? 'inside_sandwip' : 'outside_sandwip');
                        }
                      }
                    }}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="">-- নির্দিষ্ট উপজেলা বা জোন নির্বাচন করুন --</option>
                    {settings.deliveryZones.filter(z => z.enabled).map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} - {z.charge === 0 ? 'ফ্রি ডেলিভারি' : `৳${z.charge}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 pt-2 border-t border-slate-200/70 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল</span>
                <span className="font-bold text-slate-800">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-bold text-slate-800">৳{deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-blue-900 pt-1 border-t border-slate-200">
                <span>সর্বমোট (Total)</span>
                <span className="text-base text-blue-700">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="cart-checkout-btn"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>চেকআউট করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>১০০% নিরাপদ ও বিশ্বস্ত ডেলিভারি গ্যারান্টি</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
