import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/storeService';
import { uploadMedia } from '../firebase/config';
import { Order, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onRequestLogin?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onRequestLogin,
}) => {
  const { cart, subtotal, deliveryArea, selectedZoneId, setDeliveryArea, setSelectedZoneId, getDeliveryCharge, clearCart } = useCart();
  const { settings } = useSettings();
  const { currentUser, userProfile, updateUserProfileData } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');

  // Screenshot upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Auto pre-fill from customer profile when logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      if (userProfile?.displayName) {
        setCustomerName(prev => prev || userProfile.displayName);
      } else if (currentUser.displayName) {
        setCustomerName(prev => prev || currentUser.displayName || '');
      }
      if (userProfile?.phoneNumber) {
        setCustomerPhone(prev => prev || userProfile.phoneNumber || '');
      }
      if (userProfile?.address) {
        setShippingAddress(prev => prev || userProfile.address || '');
      }
      if (userProfile?.deliveryArea) {
        setDeliveryArea(userProfile.deliveryArea);
      }
    }
  }, [isOpen, currentUser, userProfile]);

  if (!isOpen) return null;

  const deliveryCharge = getDeliveryCharge(settings.deliveryInsideSandwip, settings.deliveryOutsideSandwip, settings.deliveryZones);
  const totalAmount = subtotal + deliveryCharge;

  const rocketAccount = settings.paymentAccounts?.find(p => p.method === 'rocket' && p.enabled);
  const bankAccount = settings.paymentAccounts?.find(p => p.method === 'bank' && p.enabled);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Duplicate submission protection!

    if (!currentUser) {
      setErrorMessage('অর্ডার করতে অনুগ্রহ করে লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।');
      onRequestLogin?.();
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('অনুগ্রহ করে নাম, সচল মোবাইল নম্বর এবং পূর্ণাঙ্গ ঠিকানা প্রদান করুন।');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim() && !screenshotFile) {
      setErrorMessage('বিকাশ বা নগদ পেমেন্টের জন্য ট্রানজেকশন আইডি (TrxID) অথবা পেমেন্ট স্ক্রিনশট প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadMedia(screenshotFile, `orders/payments/${Date.now()}`);
      }

      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      }));

      const newOrder = await placeOrder({
        customerId: currentUser.uid,
        customerEmail: currentUser.email || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryArea,
        shippingAddress: shippingAddress.trim(),
        notes: orderNotes.trim() || undefined,
        items: orderItems,
        subtotal,
        deliveryCharge,
        totalAmount,
        paymentMethod,
        trxId: trxId.trim() || undefined,
        paymentScreenshot: screenshotUrl || undefined,
      });

      // Update customer profile with phone or address if not already saved
      if (currentUser && (!userProfile?.address || !userProfile?.phoneNumber)) {
        try {
          await updateUserProfileData({
            phoneNumber: userProfile?.phoneNumber || customerPhone.trim(),
            address: userProfile?.address || shippingAddress.trim(),
            deliveryArea
          });
        } catch {
          // Non-blocking
        }
      }

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore in strict contexts
      }

      clearCart();
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorMessage('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        id="checkout-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">অর্ডার চেকআউট</h2>
              <p className="text-xs text-blue-200">নিরাপদে ও দ্রুত আপনার অর্ডার কনফার্ম করুন</p>
            </div>
          </div>
          <button
            id="checkout-close-btn"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Authentication State Banner */}
          {!currentUser ? (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">
                    অর্ডার করতে অনুগ্রহ করে লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    অর্ডার করার জন্য কাস্টমার অ্যাকাউন্ট আবশ্যক। আপনার কার্টের আইটেমগুলো অক্ষুণ্ণ থাকবে।
                  </p>
                </div>
              </div>
              {onRequestLogin && (
                <button
                  type="button"
                  id="checkout-login-prompt-btn"
                  onClick={onRequestLogin}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  লগইন / সাইন আপ
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  লগইন আছেন: <strong className="font-bold text-slate-800">{userProfile?.displayName || currentUser.email}</strong>
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-100/60 px-2 py-0.5 rounded-lg hidden sm:inline">
                ভেরিফাইড অ্যাকাউন্ট
              </span>
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-700" />
              <span>১. কাস্টমার ও ডেলিভারি তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-name-input"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  id="checkout-phone-input"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="০১XXXXXXXXX"
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Delivery Location & Upazila Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  ডেলিভারি এরিয়া / উপজেলা নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  deliveryCharge === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {deliveryCharge === 0 ? '✓ ফ্রি ডেলিভারি (৳০)' : `ডেলিভারি চার্জ: ৳${deliveryCharge}`}
                </span>
              </div>

              {/* Informative Rate Explanation */}
              <div className="p-2.5 mb-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
                <span>
                  <strong>ডেলিভারি রেট:</strong> সন্দ্বীপের ভিতরে ফ্রি (৳০), সন্দ্বীপের বাইরে ১৩০ টাকা
                </span>
                <span className="font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                  পোস্টকোড ৪৩০১
                </span>
              </div>

              {/* Primary Sandwip vs Outside Sandwip options */}
              <div className="grid grid-cols-2 gap-3 mb-2.5">
                <button
                  type="button"
                  id="checkout-inside-sandwip-btn"
                  onClick={() => {
                    setDeliveryArea('inside_sandwip');
                    setSelectedZoneId(undefined);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryArea === 'inside_sandwip' && !selectedZoneId
                      ? 'border-blue-700 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">সন্দ্বীপের ভিতরে</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                      {settings.deliveryInsideSandwip === 0 ? 'ফ্রি' : `৳${settings.deliveryInsideSandwip}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {settings.deliveryInsideSandwip === 0 ? 'চার্জ সম্পূর্ণ ফ্রি (৳০)' : `চার্জ ৳${settings.deliveryInsideSandwip}`} (পোস্টকোড ৪৩০১)
                  </p>
                </button>

                <button
                  type="button"
                  id="checkout-outside-sandwip-btn"
                  onClick={() => {
                    setDeliveryArea('outside_sandwip');
                    setSelectedZoneId(undefined);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryArea === 'outside_sandwip' && !selectedZoneId
                      ? 'border-blue-700 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">সন্দ্বীপের বাইরে</span>
                    <span className="text-xs font-bold text-blue-700">
                      ৳{settings.deliveryOutsideSandwip}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">সারাদেশে কুরিয়ারে হোম ডেলিভারি</p>
                </button>
              </div>

              {/* Dynamic Upazilas / Custom Delivery Zones (Configured by Admin) */}
              {settings.deliveryZones && settings.deliveryZones.filter(z => z.enabled).length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      উপজেলা অনুযায়ী নির্ধারিত ডেলিভারি চার্জ:
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      এডমিন নিয়ন্ত্রিত তালিকা
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {settings.deliveryZones.filter(z => z.enabled).map((zone) => {
                      const isSelected = selectedZoneId === zone.id;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => {
                            setSelectedZoneId(zone.id);
                            setDeliveryArea(zone.isInsideSandwip ? 'inside_sandwip' : 'outside_sandwip');
                          }}
                          className={`p-2 rounded-xl text-left border text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-100/70 border-blue-600 text-blue-950 font-bold ring-1 ring-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate pr-2 font-medium">{zone.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                            zone.charge === 0 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {zone.charge === 0 ? 'ফ্রি' : `৳${zone.charge}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পূর্ণাঙ্গ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
              </label>
              <textarea
                id="checkout-address-input"
                required
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="গ্রাম/রোড, ইউনিয়ন/উপজেলা, জেলা ইত্যাদি..."
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="যেমন: বিকেলে ডেলিভারি করবেন বা নির্দিষ্ট কালার"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>২. পেমেন্ট মেথড নির্বাচন করুন</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Cash on Delivery */}
              <button
                type="button"
                id="payment-method-cod"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-700 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs mb-1">
                  ৳
                </div>
                <span className="text-xs font-bold">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[10px] text-slate-500">পণ্য পেয়ে মূল্য দিন</span>
              </button>

              {/* bKash */}
              <button
                type="button"
                id="payment-method-bkash"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-600 bg-pink-50/80 text-pink-900 font-bold ring-2 ring-pink-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs mb-1">
                  bK
                </div>
                <span className="text-xs font-bold text-pink-700">বিকাশ (bKash)</span>
                <span className="text-[10px] text-slate-500">{settings.bkashType}</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                id="payment-method-nagad"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-600 bg-orange-50/80 text-orange-900 font-bold ring-2 ring-orange-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs mb-1">
                  ন
                </div>
                <span className="text-xs font-bold text-orange-700">নগদ (Nagad)</span>
                <span className="text-[10px] text-slate-500">{settings.nagadType}</span>
              </button>

              {/* Rocket (if configured & enabled) */}
              {rocketAccount && rocketAccount.enabled && (
                <button
                  type="button"
                  id="payment-method-rocket"
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    paymentMethod === 'rocket'
                      ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold ring-2 ring-purple-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs mb-1">
                    র
                  </div>
                  <span className="text-xs font-bold text-purple-700">রকেট (Rocket)</span>
                  <span className="text-[10px] text-slate-500">{rocketAccount.accountType}</span>
                </button>
              )}

              {/* Bank Account (if configured & enabled) */}
              {bankAccount && bankAccount.enabled && (
                <button
                  type="button"
                  id="payment-method-bank"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs mb-1">
                    🏦
                  </div>
                  <span className="text-xs font-bold text-blue-700">ব্যাংক ট্রান্সফার</span>
                  <span className="text-[10px] text-slate-500">{bankAccount.bankName || 'সঞ্চয়ী'}</span>
                </button>
              )}
            </div>

            {/* bKash Payment Details Box */}
            {paymentMethod === 'bkash' && (
              <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-900">
                    বিকাশ নম্বর ({settings.bkashType}):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(settings.bkashNumber)}
                    className="flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded-lg border border-pink-200 hover:bg-pink-100"
                  >
                    {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{settings.bkashNumber}</span>
                  </button>
                </div>

                <p className="text-[11px] text-pink-800 leading-relaxed">
                  {settings.bkashInstruction}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-pink-900 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      id="checkout-trxid-input"
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="যেমন: BL9X928H1"
                      className="w-full p-2 text-xs bg-white border border-pink-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-pink-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-pink-900 mb-1">
                      পেমেন্ট স্ক্রিনশট (যদি থাকে)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                    />
                  </div>
                </div>

                {screenshotPreview && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={screenshotPreview} alt="Screenshot" className="w-12 h-12 object-cover rounded-lg border border-pink-300" />
                    <span className="text-[11px] text-pink-800 font-semibold">স্ক্রিনশট সিলেক্ট করা হয়েছে</span>
                  </div>
                )}
              </div>
            )}

            {/* Nagad Payment Details Box */}
            {paymentMethod === 'nagad' && (
              <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-900">
                    নগদ নম্বর ({settings.nagadType}):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(settings.nagadNumber)}
                    className="flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-lg border border-orange-200 hover:bg-orange-100"
                  >
                    {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{settings.nagadNumber}</span>
                  </button>
                </div>

                <p className="text-[11px] text-orange-800 leading-relaxed">
                  {settings.nagadInstruction}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-orange-900 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="যেমন: 78B928H1"
                      className="w-full p-2 text-xs bg-white border border-orange-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-orange-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-orange-900 mb-1">
                      পেমেন্ট স্ক্রিনশট (যদি থাকে)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                    />
                  </div>
                </div>

                {screenshotPreview && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={screenshotPreview} alt="Screenshot" className="w-12 h-12 object-cover rounded-lg border border-orange-300" />
                    <span className="text-[11px] text-orange-800 font-semibold">স্ক্রিনশট সিলেক্ট করা হয়েছে</span>
                  </div>
                )}
              </div>
            )}

            {/* Rocket Payment Details Box */}
            {paymentMethod === 'rocket' && rocketAccount && (
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">
                    রকেট নম্বর ({rocketAccount.accountType}):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(rocketAccount.accountNumber)}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200 hover:bg-purple-100"
                  >
                    {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{rocketAccount.accountNumber}</span>
                  </button>
                </div>

                {rocketAccount.instruction && (
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    {rocketAccount.instruction}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="১২ ডিজিটের TrxID"
                      className="w-full p-2 text-xs bg-white border border-purple-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      পেমেন্ট স্ক্রিনশট (যদি থাকে)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                  </div>
                </div>

                {screenshotPreview && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={screenshotPreview} alt="Screenshot" className="w-12 h-12 object-cover rounded-lg border border-purple-300" />
                    <span className="text-[11px] text-purple-800 font-semibold">স্ক্রিনশট সিলেক্ট করা হয়েছে</span>
                  </div>
                )}
              </div>
            )}

            {/* Bank Payment Details Box */}
            {paymentMethod === 'bank' && bankAccount && (
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-950">
                      {bankAccount.bankName || bankAccount.methodName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(bankAccount.accountNumber)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200 hover:bg-blue-100"
                    >
                      {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>কপি করুন</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 font-mono bg-white p-2 rounded-lg border border-blue-100 space-y-0.5">
                    <p><span className="text-slate-500">হিসাব নম্বর:</span> <strong>{bankAccount.accountNumber}</strong></p>
                    {bankAccount.accountHolderName && <p><span className="text-slate-500">হোল্ডার:</span> <strong>{bankAccount.accountHolderName}</strong></p>}
                    {bankAccount.branchName && <p><span className="text-slate-500">শাখা:</span> {bankAccount.branchName}</p>}
                    {bankAccount.routingNumber && <p><span className="text-slate-500">রাউটিং:</span> {bankAccount.routingNumber}</p>}
                  </div>
                </div>

                {bankAccount.instruction && (
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {bankAccount.instruction}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">
                      ডিপোজিট স্লিপ / রেফারেন্স নম্বর
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="রেফারেন্স নম্বর বা ট্রানজেকশন আইডি"
                      className="w-full p-2 text-xs bg-white border border-blue-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">
                      ডিপোজিট স্লিপের ছবি
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                  </div>
                </div>

                {screenshotPreview && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={screenshotPreview} alt="Screenshot" className="w-12 h-12 object-cover rounded-lg border border-blue-300" />
                    <span className="text-[11px] text-blue-800 font-semibold">স্লিপের ছবি আপলোড করা হয়েছে</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Order Summary Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">অর্ডার সারাংশ ({cart.length} টি আইটেম):</h4>
            
            <div className="max-h-28 overflow-y-auto divide-y divide-slate-200 text-xs">
              {cart.map((item) => (
                <div key={item.product.id} className="py-1.5 flex justify-between items-center">
                  <span className="truncate max-w-[240px] text-slate-800 font-medium">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900">৳{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>প্রোডাক্ট সাবটোটাল:</span>
                <span className="font-bold text-slate-800">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-slate-800">৳{deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-blue-900 pt-1.5 border-t border-slate-200">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-blue-700">৳{totalAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Submit Button with Duplicate Protection */}
          <div className="pt-1">
            <button
              id="checkout-submit-order-btn"
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-sm sm:text-base flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>অর্ডার প্রসেসিং হচ্ছে... অপেক্ষা করুন</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার কনফার্ম করুন (৳{totalAmount.toLocaleString('bn-BD')})</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500 mt-2">
              অর্ডারের পর আমাদের সাপোর্ট টিম থেকে আপনার ঠিকানায় সরাসরি যোগাযোগ করা হবে।
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
