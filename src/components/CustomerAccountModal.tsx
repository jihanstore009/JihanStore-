import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  LogOut, 
  Edit3, 
  Check, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToOrders } from '../services/storeService';
import { Order, OrderStatus } from '../types';

export interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'orders';
  onTrackOrder?: (orderNumber: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  onTrackOrder
}) => {
  const { currentUser, userProfile, updateUserProfileData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_sandwip' | 'outside_sandwip'>('inside_sandwip');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Sync profile data to edit fields
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setAddress(userProfile.address || '');
      setDeliveryArea(userProfile.deliveryArea || 'inside_sandwip');
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsEditing(false);
      setErrorMessage('');
      setSaveSuccess(false);
    }
  }, [isOpen, initialTab]);

  // Subscribe to live orders for this customer
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    setLoadingOrders(true);
    // Subscribe using UID, phone, or email
    const unsubscribe = subscribeToOrders((allOrders) => {
      // Filter orders belonging to this user
      const userOrders = allOrders.filter(o => 
        (o.customerId && o.customerId === currentUser.uid) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
        (userProfile?.phoneNumber && o.customerPhone === userProfile.phoneNumber)
      );

      setOrders(userOrders);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser, userProfile?.phoneNumber]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!displayName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম দিন।');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      await updateUserProfileData({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        deliveryArea
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
      await logout();
      onClose();
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">অপেক্ষমাণ (Pending)</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">নিশ্চিত (Confirmed)</span>;
      case 'Processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">প্রক্রিয়াধীন (Processing)</span>;
      case 'Shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">ডেলিভারিতে আছে (Shipped)</span>;
      case 'Delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">ডেলিভারি সম্পন্ন (Delivered)</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">বাতিল (Cancelled)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="customer-account-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header with profile banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg border-2 border-white/20">
                {(userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl leading-tight">
                  {userProfile?.displayName || 'সম্মানিত কাস্টমার'}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5 font-medium">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-600/60 text-blue-100 px-2.5 py-0.5 rounded-md border border-blue-400/30">
                    <User className="w-3 h-3 text-amber-300" />
                    <span>কাস্টমার অ্যাকাউন্ট</span>
                  </span>
                  {userProfile?.deliveryArea === 'inside_sandwip' && (
                    <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-semibold">
                      সন্দ্বীপ লোকাল
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="account-modal-logout-btn"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-200 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
                title="লগআউট করুন"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
              <button
                id="account-modal-close-btn"
                onClick={onClose}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 gap-4 shrink-0">
          <button
            type="button"
            id="tab-account-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>প্রোফাইল ও ডেলিভারি তথ্য</span>
          </button>
          <button
            type="button"
            id="tab-account-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আমার অর্ডার সমূহ</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Feedback alerts */}
        {(errorMessage || saveSuccess) && (
          <div className="px-5 pt-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    ব্যক্তিগত ও ডেলিভারি বিবরণ
                  </h4>
                  <p className="text-xs text-slate-500">
                    চেকআউটের সময় এই তথ্যগুলো স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে।
                  </p>
                </div>
                {!isEditing && (
                  <button
                    id="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors border border-blue-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>পরিবর্তন করুন</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="০১XXXXXXXXX"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ডেলিভারি এলাকা
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryArea('inside_sandwip')}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          deliveryArea === 'inside_sandwip'
                            ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        সন্দ্বীপের ভিতরে (ফ্রি ডেলিভারি)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryArea('outside_sandwip')}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          deliveryArea === 'outside_sandwip'
                            ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        সন্দ্বীপের বাইরে (কুরিয়ার)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ডেলিভারি ঠিকানা
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="গ্রাম/রোড, পোস্ট অফিস, থানা/উপজেলা, জেলা"
                      rows={2}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>পরিবর্তন সংরক্ষণ করুন</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">নাম</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {userProfile?.displayName || 'নির্দিষ্ট করা নেই'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700 shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">ইমেইল</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-100/70 text-amber-700 shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">মোবাইল নম্বর</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {userProfile?.phoneNumber || 'যুক্ত করা হয়নি'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700 shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">ডেলিভারি জোন</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {userProfile?.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে (ফ্রি)' : 'সন্দ্বীপের বাইরে (কুরিয়ার)'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 sm:col-span-2">
                    <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400">ডেলিভারি ঠিকানা</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        {userProfile?.address || 'কোনো ঠিকানা সেভ করা নেই। পরিবর্তন বাটনে ক্লিক করে যোগ করুন।'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    পূর্ববর্তী অর্ডার ইতিহাস
                  </h4>
                  <p className="text-xs text-slate-500">
                    আপনার অ্যাকাউন্টের মাধ্যমে সম্পন্ন হওয়া সকল অর্ডারের তালিকা
                  </p>
                </div>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">অর্ডার লোড হচ্ছে...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-700">এখনো কোনো অর্ডার করেননি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    জিহান স্টোর থেকে আপনার পছন্দের পণ্যগুলো ব্রাউজ করে অর্ডার করুন।
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    শপিং শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id} 
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          {getStatusBadge(ord.orderStatus)}
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-lg bg-white" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="pr-1 text-left">
                              <p className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[120px]">{item.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{item.quantity}টি × ৳{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary & Track Action */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            মোট: <strong className="text-slate-900 font-black">৳{ord.totalAmount}</strong>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium capitalize">
                            পদ্ধতি: {ord.paymentMethod.toUpperCase()}
                          </span>
                        </div>

                        {onTrackOrder && (
                          <button
                            type="button"
                            onClick={() => {
                              onTrackOrder(ord.orderNumber);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors border border-blue-200/80 cursor-pointer"
                          >
                            <span>লাইভ ট্র্যাক করুন</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
