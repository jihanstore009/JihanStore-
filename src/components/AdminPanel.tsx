import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Settings, 
  MessageSquare, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  DollarSign, 
  Users, 
  TrendingUp,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  Product, 
  Order, 
  OrderStatus, 
  ChatConversation, 
  Banner, 
  Category 
} from '../types';
import { 
  subscribeToOrders, 
  updateOrderStatus, 
  deleteOrder, 
  saveProduct, 
  deleteProduct, 
  subscribeToConversations,
  addCategory,
  deleteCategory,
  addBanner,
  deleteBanner
} from '../services/storeService';
import { uploadMedia } from '../firebase/config';
import { SupportChat } from './SupportChat';
import { AdsManager } from '../admin/AdsManager';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenStandaloneApp?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  onOpenStandaloneApp
}) => {
  const { isAdmin, adminLogin, logout } = useAuth();
  const { settings, updateSettings, categories, banners, ads } = useSettings();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'chat' | 'settings' | 'banners' | 'ads'>('dashboard');

  // Auth form
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: 0,
    previousPrice: 0,
    stock: 10,
    inStock: true,
    featured: false,
    description: '',
    details: '',
    deliveryInfo: '',
    images: ['']
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  // Chat Conversations State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChatConversation, setActiveChatConversation] = useState<ChatConversation | null>(null);

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Store Settings Form
  const [tempSettings, setTempSettings] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubOrders = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });

    const unsubConvs = subscribeToConversations((newConvs) => {
      setConversations(newConvs);
    });

    return () => {
      unsubOrders();
      unsubConvs();
    };
  }, [isAdmin]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const ok = await adminLogin(adminPass);
      if (!ok) {
        setAuthError('ভুল অ্যাডমিন পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন (jihan2026)।');
      }
    } catch {
      setAuthError('লগইন ব্যর্থ হয়েছে।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  // Unauthenticated Admin Screen
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">জিহান স্টোর অ্যাডমিন</h3>
                <p className="text-xs text-slate-500">প্রশাসনিক প্যানেল অ্যাক্সেস</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অ্যাডমিন সিক্রেট পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন (যেমন: jihan2026)"
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ডিফল্ট অ্যাডমিন পাসকী: <span className="font-mono text-blue-700 font-bold">jihan2026</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus.toLowerCase() === orderFilter.toLowerCase());

  // Statistics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalAmount : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      previousPrice: prod.previousPrice || 0,
      stock: prod.stock,
      inStock: prod.inStock,
      featured: prod.featured || false,
      description: prod.description,
      details: prod.details || '',
      deliveryInfo: prod.deliveryInfo || '',
      images: prod.images.length > 0 ? prod.images : ['']
    });
    setProductImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.name || 'স্মার্টওয়াচ',
      price: 1000,
      previousPrice: 1200,
      stock: 10,
      inStock: true,
      featured: false,
      description: '',
      details: '',
      deliveryInfo: '',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80']
    });
    setProductImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingProduct(true);
    try {
      let finalImages = [...productForm.images];
      if (productImageFile) {
        const uploadedUrl = await uploadMedia(productImageFile, `products/${Date.now()}`);
        finalImages = [uploadedUrl, ...finalImages.filter(img => img && !img.includes('blob'))];
      }

      const discountPercent = productForm.previousPrice > productForm.price
        ? Math.round(((productForm.previousPrice - productForm.price) / productForm.previousPrice) * 100)
        : 0;

      await saveProduct({
        id: editingProduct ? editingProduct.id : undefined,
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        previousPrice: Number(productForm.previousPrice) || undefined,
        discount: discountPercent || undefined,
        stock: Number(productForm.stock),
        inStock: productForm.inStock && Number(productForm.stock) > 0,
        featured: productForm.featured,
        description: productForm.description,
        details: productForm.details,
        deliveryInfo: productForm.deliveryInfo,
        images: finalImages.filter(Boolean),
        rating: editingProduct?.rating || 5.0,
        reviewCount: editingProduct?.reviewCount || 1,
      });

      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('প্রোডাক্ট সংরক্ষণে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" প্রোডাক্টটি ডিলিট করতে চান?`)) {
      await deleteProduct(id);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(tempSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({
      name: newCategoryName.trim(),
      slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: 'Tag'
    });
    setNewCategoryName('');
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImg = bannerImageUrl;
      if (bannerFile) {
        finalImg = await uploadMedia(bannerFile, `banners/${Date.now()}`);
      }
      if (!finalImg) {
        alert('ব্যানার ছবি প্রদান করুন');
        return;
      }
      await addBanner({
        title: bannerTitle || 'জিহান স্টোর স্পেশাল অফার',
        subtitle: bannerSubtitle || 'সরাসরি হোম ডেলিভারি',
        image: finalImg,
        imageUrl: finalImg,
        link: 'all',
        active: true,
        order: banners.length + 1
      });
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerImageUrl('');
      setBannerFile(null);
    } catch (err) {
      console.error('Add banner failed:', err);
    }
  };

  // Export orders to CSV
  const handleExportOrders = () => {
    const headers = ['OrderNumber', 'CustomerName', 'Phone', 'Address', 'Area', 'PaymentMethod', 'TrxID', 'TotalAmount', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.orderNumber,
      `"${o.customerName}"`,
      o.customerPhone,
      `"${o.shippingAddress}"`,
      o.deliveryArea,
      o.paymentMethod,
      o.trxId || '',
      o.totalAmount,
      o.orderStatus,
      new Date(o.createdAt).toLocaleString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jihan_store_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="admin-dashboard-container"
        className="w-full h-full sm:max-w-6xl sm:h-[94vh] bg-white rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Top Bar */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base leading-tight">JIHAN STORE ADMIN</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  লাইভ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">সম্পূর্ণ প্রশাসনিক নিয়ন্ত্রণ কেন্দ্র</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenStandaloneApp && (
              <button
                onClick={() => {
                  onClose();
                  onOpenStandaloneApp();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
                title="আলাদা ফুলস্ক্রিন অ্যাডমিন অ্যাপে যান"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ফুলস্ক্রিন অ্যাপ</span>
              </button>
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 border-b border-slate-200 bg-slate-50/80 overflow-x-auto no-scrollbar text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dashboard' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ড</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'orders' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>অর্ডারসমূহ</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'products' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ম্যানেজমেন্ট ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chat' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>সাপোর্ট ইনবক্স ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'banners' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ব্যানার ও ক্যাটাগরি</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ads' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>বিজ্ঞাপন ও স্পন্সর</span>
            {(ads || []).filter(a => a.active).length > 0 && (
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {(ads || []).filter(a => a.active).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>স্টোর সেটিংস ও পেমেন্ট</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">মোট অর্ডার</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">{orders.length}</h3>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">মোট বিক্রয় রেভিনিউ</p>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-700">৳{totalRevenue.toLocaleString('bn-BD')}</h3>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">মোট প্রোডাক্ট সংখ্যা</p>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">{products.length}</h3>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">লাইভ চ্যাট গ্রাহক</p>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-700">{conversations.length}</h3>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-sm text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h4>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>সবগুলো দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">এখনো কোনো অর্ডার আসেনি।</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-800">#{order.orderNumber} - {order.customerName}</p>
                            <p className="text-[11px] text-slate-500">{order.customerPhone} • {order.items.length} টি আইটেম</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-blue-700">৳{order.totalAmount}</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Store Status Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">স্টোর ইনফরমেশন</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p><strong>ব্যবসা:</strong> {settings.businessName}</p>
                    <p><strong>ঠিকানা:</strong> {settings.address}</p>
                    <p><strong>মোবাইল:</strong> {settings.phone}</p>
                    <p><strong>হোয়াটসঅ্যাপ:</strong> {settings.whatsapp}</p>
                    <p><strong>সন্দ্বীপ ডেলিভারি চার্জ:</strong> ৳{settings.deliveryInsideSandwip}</p>
                    <p><strong>বাইরে ডেলিভারি চার্জ:</strong> ৳{settings.deliveryOutsideSandwip}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    সেটিংস পরিবর্তন করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold no-scrollbar">
                  {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-xl transition-colors ${
                        orderFilter.toLowerCase() === st.toLowerCase()
                          ? 'bg-blue-700 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'all' ? 'সব অর্ডার' : st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportOrders}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>এক্সপোর্ট (CSV)</span>
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {filteredOrders.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-400">কোনো অর্ডার পাওয়া যায়নি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">অর্ডার ID</th>
                          <th className="p-3">কাস্টমার</th>
                          <th className="p-3">ঠিকানা / এরিয়া</th>
                          <th className="p-3">পেমেন্ট</th>
                          <th className="p-3">মূল্য</th>
                          <th className="p-3">স্ট্যাটাস</th>
                          <th className="p-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-blue-700">
                              #{ord.orderNumber}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-900">{ord.customerName}</p>
                              <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                            </td>
                            <td className="p-3 max-w-[180px] truncate">
                              <p className="truncate">{ord.shippingAddress}</p>
                              <span className="text-[10px] text-blue-600 font-medium">
                                {ord.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপ' : 'বাইরে'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold uppercase">{ord.paymentMethod}</span>
                              {ord.trxId && (
                                <p className="text-[10px] text-slate-500 font-mono">Trx: {ord.trxId}</p>
                              )}
                            </td>
                            <td className="p-3 font-extrabold text-blue-800">
                              ৳{ord.totalAmount}
                            </td>
                            <td className="p-3">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="p-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => setSelectedOrderDetails(ord)}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="ডিটেইলস দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('অর্ডারটি ডিলিট করতে চান?')) {
                                    deleteOrder(ord.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT (CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">স্টোরের সমস্ত প্রোডাক্ট ({products.length})</h4>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div key={prod.id} className="p-3 bg-white rounded-2xl border border-slate-200 flex gap-3 shadow-xs">
                    <img src={prod.images[0]} alt={prod.name} className="w-20 h-20 object-cover rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-700 uppercase">{prod.category}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${prod.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {prod.inStock ? `স্টকে (${prod.stock})` : 'স্টক শেষ'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 truncate mt-0.5">{prod.name}</h4>
                        <p className="text-xs font-black text-blue-800 mt-1">৳{prod.price}</p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="flex-1 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT CHAT INBOX */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
              {/* Conversations List */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-y-auto divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 sticky top-0">
                  গ্রাহক ইনবক্স তালিকা
                </div>
                {conversations.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">এখনো কোনো কাস্টমার মেসেজ দেয়নি।</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setActiveChatConversation(conv)}
                      className={`p-3 cursor-pointer hover:bg-blue-50/60 transition-colors ${
                        activeChatConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">{conv.customerName}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageAt || conv.lastMessageTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage || 'ছবি/ভয়েস মেসেজ'}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat View (Right 2 columns) */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-center items-center">
                {activeChatConversation ? (
                  <div className="w-full h-full relative">
                    <SupportChat
                      isOpen={true}
                      onClose={() => setActiveChatConversation(null)}
                      customerName={activeChatConversation.customerName}
                      customerPhone={activeChatConversation.customerPhone}
                      adminModeConversationId={activeChatConversation.id}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">একটি কনভারসেশন নির্বাচন করুন</p>
                    <p className="text-xs text-slate-500 mt-1">কাস্টমারকে লাইভ রিপ্লাই, অডিও ভয়েস মেসেজ বা ফটো পাঠাতে পারবেন।</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BANNERS & CATEGORIES */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              {/* Banners Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900">হোম পেজ স্লাইডার ব্যানার</h4>

                {/* Existing Banners */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b.id} className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                      <img src={b.imageUrl || b.image} alt={b.title} className="w-full h-36 object-cover" />
                      <div className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-slate-900">{b.title}</p>
                          <p className="text-[11px] text-slate-500">{b.subtitle}</p>
                        </div>
                        <button
                          onClick={() => deleteBanner(b.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Banner Form */}
                <form onSubmit={handleAddBannerSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800">নতুন ব্যানার যোগ করুন:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ব্যানার টাইটেল"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="ব্যানার সাব-টাইটেল"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      className="p-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ব্যানার ছবি আপলোড বা URL</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
                  >
                    ব্যানার সেভ করুন
                  </button>
                </form>
              </div>

              {/* Categories Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900">ক্যাটাগরি ম্যানেজমেন্ট</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">
                      <span>{cat.name}</span>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddCategorySubmit} className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    required
                    placeholder="নতুন ক্যাটাগরির নাম"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    যোগ করুন
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & PAYMENT CONFIGURATION */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">দোকানের তথ্য ও পেমেন্ট সেটিংস</h4>
                  <p className="text-xs text-slate-500">বিকাশ, নগদ, ডেলিভারি চার্জ এবং যোগাযোগের নম্বরসমূহ কনফিগার করুন</p>
                </div>
                {settingsSaved && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                    <Check className="w-4 h-4" /> সংরক্ষিত হয়েছে!
                  </span>
                )}
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ব্যবসার নাম</label>
                  <input
                    type="text"
                    value={tempSettings.businessName}
                    onChange={(e) => setTempSettings({ ...tempSettings, businessName: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={tempSettings.tagline}
                    onChange={(e) => setTempSettings({ ...tempSettings, tagline: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ফোন নম্বর</label>
                  <input
                    type="text"
                    value={tempSettings.phone}
                    onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={tempSettings.whatsapp}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণাঙ্গ ঠিকানা</label>
                  <input
                    type="text"
                    value={tempSettings.address}
                    onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900 uppercase">ডেলিভারি চার্জ রেট:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">সন্দ্বীপের ভিতরে চার্জ (টাকা)</label>
                    <input
                      type="number"
                      value={tempSettings.deliveryInsideSandwip}
                      onChange={(e) => setTempSettings({ ...tempSettings, deliveryInsideSandwip: Number(e.target.value) })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">সন্দ্বীপের বাইরে সারাদেশে চার্জ (টাকা)</label>
                    <input
                      type="number"
                      value={tempSettings.deliveryOutsideSandwip}
                      onChange={(e) => setTempSettings({ ...tempSettings, deliveryOutsideSandwip: Number(e.target.value) })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* bKash & Nagad Gateways */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h5 className="font-bold text-xs text-slate-900 uppercase">মোবাইল ব্যাংকিং পেমেন্ট একাউন্ট:</h5>
                
                {/* bKash */}
                <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-200 space-y-2">
                  <span className="font-bold text-xs text-pink-700">বিকাশ (bKash) সেটিংস:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="বিকাশ নম্বর"
                      value={tempSettings.bkashNumber}
                      onChange={(e) => setTempSettings({ ...tempSettings, bkashNumber: e.target.value })}
                      className="p-2 text-xs bg-white border border-pink-200 rounded-xl"
                    />
                    <select
                      value={tempSettings.bkashType}
                      onChange={(e) => setTempSettings({ ...tempSettings, bkashType: e.target.value as any })}
                      className="p-2 text-xs bg-white border border-pink-200 rounded-xl"
                    >
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="পেমেন্ট নির্দেশনা"
                    value={tempSettings.bkashInstruction}
                    onChange={(e) => setTempSettings({ ...tempSettings, bkashInstruction: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-pink-200 rounded-xl"
                  />
                </div>

                {/* Nagad */}
                <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-2">
                  <span className="font-bold text-xs text-orange-700">নগদ (Nagad) সেটিংস:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="নগদ নম্বর"
                      value={tempSettings.nagadNumber}
                      onChange={(e) => setTempSettings({ ...tempSettings, nagadNumber: e.target.value })}
                      className="p-2 text-xs bg-white border border-orange-200 rounded-xl"
                    />
                    <select
                      value={tempSettings.nagadType}
                      onChange={(e) => setTempSettings({ ...tempSettings, nagadType: e.target.value as any })}
                      className="p-2 text-xs bg-white border border-orange-200 rounded-xl"
                    >
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="পেমেন্ট নির্দেশনা"
                    value={tempSettings.nagadInstruction}
                    onChange={(e) => setTempSettings({ ...tempSettings, nagadInstruction: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-orange-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-md"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </form>
          )}

          {/* TAB 7: ADVERTISEMENTS MANAGER */}
          {activeTab === 'ads' && (
            <div className="py-2">
              <AdsManager ads={ads || []} />
            </div>
          )}

        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[85vh] space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-base text-slate-900">অর্ডার ডিটেইলস: #{selectedOrderDetails.orderNumber}</h3>
                <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs space-y-2">
                <p><strong>কাস্টমার:</strong> {selectedOrderDetails.customerName} ({selectedOrderDetails.customerPhone})</p>
                <p><strong>ঠিকানা:</strong> {selectedOrderDetails.shippingAddress}</p>
                <p><strong>এরিয়া:</strong> {selectedOrderDetails.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে' : 'সন্দ্বীপের বাইরে'}</p>
                <p><strong>পেমেন্ট মেথড:</strong> <span className="uppercase font-bold">{selectedOrderDetails.paymentMethod}</span></p>
                {selectedOrderDetails.trxId && (
                  <p><strong>TrxID:</strong> <span className="font-mono font-bold text-blue-700">{selectedOrderDetails.trxId}</span></p>
                )}
                {selectedOrderDetails.notes && (
                  <p><strong>কাস্টমার নোট:</strong> {selectedOrderDetails.notes}</p>
                )}

                {/* Screenshot if available */}
                {selectedOrderDetails.paymentScreenshot && (
                  <div className="pt-2">
                    <p className="font-bold text-slate-700 mb-1">পেমেন্ট স্ক্রিনশট:</p>
                    <img 
                      src={selectedOrderDetails.paymentScreenshot} 
                      alt="Payment proof" 
                      className="max-h-48 rounded-xl border border-slate-200 cursor-pointer"
                      onClick={() => window.open(selectedOrderDetails.paymentScreenshot, '_blank')}
                    />
                  </div>
                )}

                {/* Items */}
                <div className="pt-3 border-t">
                  <p className="font-bold mb-2">অর্ডারকৃত আইটেম:</p>
                  <div className="space-y-2">
                    {selectedOrderDetails.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <img src={it.image} alt={it.name} className="w-8 h-8 object-cover rounded-lg" />
                          <span>{it.name} × {it.quantity}</span>
                        </div>
                        <span className="font-bold">৳{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between font-black text-sm text-blue-900">
                  <span>সর্বমোট পরিশোধিত/পরিশোধযোগ্য:</span>
                  <span>৳{selectedOrderDetails.totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT ADD/EDIT MODAL */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[88vh]">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-black text-base text-slate-900">
                  {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">প্রোডাক্টের নাম *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="যেমন: T800 Ultra Smartwatch"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মূল্য (টাকা) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পূর্বের মূল্য (টাকা)</label>
                    <input
                      type="number"
                      value={productForm.previousPrice}
                      onChange={(e) => setProductForm({ ...productForm, previousPrice: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">স্টক পরিমাণ</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="inStockCheck"
                      checked={productForm.inStock}
                      onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-700"
                    />
                    <label htmlFor="inStockCheck" className="font-bold text-slate-700">স্টকে উপলব্ধ (In Stock)</label>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="featuredCheck"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <label htmlFor="featuredCheck" className="font-bold text-slate-700">ফিচার্ড প্রোডাক্ট</label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ছবি আপলোড বা ইমেজ URL</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700"
                  />
                  <input
                    type="text"
                    value={productForm.images[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    placeholder="বা ছবির ডিরেক্ট ওয়েব URL পেস্ট করুন"
                    className="w-full mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">স্পেসিফিকেশন ও বিস্তারিত</label>
                  <textarea
                    rows={2}
                    value={productForm.details}
                    onChange={(e) => setProductForm({ ...productForm, details: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingProduct}
                    className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                  >
                    {isUploadingProduct ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
