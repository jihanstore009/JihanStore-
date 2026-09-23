import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Package, 
  Layers, 
  MessageSquare, 
  Users, 
  Settings, 
  Activity, 
  LogOut, 
  Store, 
  ExternalLink, 
  Menu, 
  X, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Product, Order, ChatConversation } from '../types';
import { subscribeToOrders, subscribeToProducts, subscribeToConversations } from '../services/storeService';
import { AdminLogin } from './AdminLogin';
import { OrdersManager } from './OrdersManager';
import { ProductsManager } from './ProductsManager';
import { CategoriesBannersManager } from './CategoriesBannersManager';
import { SupportDesk } from './SupportDesk';
import { CustomersManager } from './CustomersManager';
import { SettingsManager } from './SettingsManager';
import { SyncDiagnostics } from './SyncDiagnostics';
import { AdsManager } from './AdsManager';

interface AdminAppProps {
  onSwitchToCustomer?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onSwitchToCustomer }) => {
  const { isAdmin, logout, userProfile, currentUser } = useAuth();
  const { settings, categories, banners, ads } = useSettings();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'categories' | 'ads' | 'support' | 'customers' | 'settings' | 'diagnostics'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Shared Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Update document title for standalone admin feel
  useEffect(() => {
    document.title = 'Jihan Store Admin - কেন্দ্রীয় নিয়ন্ত্রণ ড্যাশবোর্ড';
  }, []);

  // Subscribe to live Orders, Products, Conversations
  useEffect(() => {
    const unsubOrders = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    const unsubProducts = subscribeToProducts((newProds) => {
      setProducts(newProds);
    });
    const unsubConversations = subscribeToConversations((convs) => {
      setConversations(convs);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubConversations();
    };
  }, []);

  // If not authenticated as admin, show secure login
  if (!isAdmin) {
    return <AdminLogin />;
  }

  // Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending');
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered');
  const lowStockProducts = products.filter(p => p.stock < 5);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: TrendingUp },
    { id: 'orders', label: 'অর্ডারসমূহ', icon: ShoppingBag, badge: pendingOrders.length > 0 ? pendingOrders.length : undefined },
    { id: 'products', label: 'প্রোডাক্ট ও স্টক', icon: Package },
    { id: 'categories', label: 'ব্যানার ও ক্যাটাগরি', icon: Layers },
    { id: 'ads', label: 'বিজ্ঞাপন ও স্পন্সর', icon: Sparkles, badge: (ads || []).filter(a => a.active).length > 0 ? (ads || []).filter(a => a.active).length : undefined },
    { id: 'support', label: 'কাস্টমার লাইভ চ্যাট', icon: MessageSquare, badge: conversations.length > 0 ? conversations.length : undefined },
    { id: 'customers', label: 'গ্রাহক তালিকা', icon: Users },
    { id: 'settings', label: 'স্টোর সেটিংস', icon: Settings },
    { id: 'diagnostics', label: 'কানেকশন টেস্ট', icon: Activity },
  ];

  const handleOpenCustomerWebsite = () => {
    if (onSwitchToCustomer) {
      onSwitchToCustomer();
    } else {
      window.location.href = window.location.origin + '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* TOP HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base tracking-tight text-white leading-none">
                    JIHAN STORE ADMIN
                  </h1>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                  পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম • শেয়ার্ড ফায়ারবেস ব্যাকএন্ড
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live indicator, Customer website link, User Profile, Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live DB connection pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ডাটাবেজ লাইভ সিঙ্ক</span>
            </div>

            {/* View Customer Website button */}
            <button
              onClick={handleOpenCustomerWebsite}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Customer Website খুলুন"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">কাস্টমার ওয়েবসাইট</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ম্যানেজমেন্ট মেনু
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/60 flex">
            <div className="w-72 bg-white h-full p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900">মেনু নির্বাচন করুন</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT VIEW AREA */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">মোট আয় (রেভিনিউ)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ৳
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    ৳{totalRevenue.toLocaleString('bn-BD')}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">সফল ও চলমান অর্ডার থেকে</div>
                </div>

                {/* Orders Pending */}
                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">অপেক্ষারত অর্ডার</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                    {pendingOrders.length} টি
                  </div>
                  <div className="text-[11px] text-slate-400">কনফার্মেশনের অপেক্ষায়</div>
                </div>

                {/* Total Products */}
                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">মোট প্রোডাক্ট</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {products.length} টি
                  </div>
                  <div className="text-[11px] text-slate-400">লাইভ ক্যাটালগে প্রদর্শিত</div>
                </div>

                {/* Total Customers */}
                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-pointer hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">মোট গ্রাহক</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {new Set(orders.map(o => o.customerPhone)).size} জন
                  </div>
                  <div className="text-[11px] text-slate-400">নিবন্ধিত ও ক্রেতা তালিকা</div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight">জিহান স্টোর কন্ট্রোল হাব</h3>
                  <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                    এখানে যেকোনো পণ্য, দাম, স্টক, ব্যানার বা সেটিংস পরিবর্তন করলে Customer Website-এ স্বয়ংক্রিয়ভাবে সাথে সাথে প্রতিফলিত হবে।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 bg-white text-blue-800 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>প্রোডাক্ট ম্যানেজ</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors border border-blue-400/30 flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>অর্ডারসমূহ</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('support')}
                    className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors border border-blue-400/30 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>লাইভ চ্যাট</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span>সর্বশেষ অর্ডারসমূহ (সাম্প্রতিক)</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <span>সকল অর্ডার দেখুন</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">এখনো কোনো অর্ডার আসেনি।</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-blue-600">{ord.orderNumber}</div>
                          <div className="text-slate-600 font-medium">{ord.customerName} • {ord.customerPhone}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">৳{ord.totalAmount}</div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            ord.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGER */}
          {activeTab === 'orders' && <OrdersManager orders={orders} />}

          {/* TAB 3: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <ProductsManager products={products} categories={categories} />
          )}

          {/* TAB 4: CATEGORIES & BANNERS */}
          {activeTab === 'categories' && (
            <CategoriesBannersManager categories={categories} banners={banners} />
          )}

          {/* TAB: ADVERTISEMENTS & SPONSORS */}
          {activeTab === 'ads' && <AdsManager ads={ads} />}

          {/* TAB 5: SUPPORT CHAT DESK */}
          {activeTab === 'support' && <SupportDesk />}

          {/* TAB 6: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && <CustomersManager orders={orders} />}

          {/* TAB 7: STORE SETTINGS */}
          {activeTab === 'settings' && <SettingsManager />}

          {/* TAB 8: SYNC DIAGNOSTICS */}
          {activeTab === 'diagnostics' && <SyncDiagnostics />}
        </main>
      </div>
    </div>
  );
};
