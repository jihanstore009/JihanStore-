import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Search, 
  Phone, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  SlidersHorizontal, 
  Truck, 
  CheckCircle, 
  Star, 
  ArrowUpDown,
  Home as HomeIcon,
  Tag
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Order } from './types';
import { subscribeToProducts, INITIAL_PRODUCTS } from './services/storeService';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { SupportChat } from './components/SupportChat';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { PolicyModal } from './components/PolicyModal';
import { AdminApp } from './admin/AdminApp';
import { AdBannerArea } from './components/AdBannerArea';

interface StoreAppProps {
  onOpenAdminApp?: () => void;
}

const StoreApp: React.FC<StoreAppProps> = ({ onOpenAdminApp }) => {
  const { settings, categories, banners } = useSettings();
  const { addToCart, totalItems } = useCart();
  const { isAdmin } = useAuth();

  // Products State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Modals & Navigation Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | 'return' | 'about' | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Subscribe to live products from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (onlyInStock && (!p.inStock || p.stock <= 0)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const featuredProducts = products.filter((p) => p.featured);

  // Handlers
  const handleBuyNow = (product: Product, quantity: number = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    try {
      const existing = JSON.parse(localStorage.getItem('jihan_customer_orders') || '[]');
      localStorage.setItem('jihan_customer_orders', JSON.stringify([order, ...existing]));
    } catch {
      // Ignore
    }
  };

  const handleTrackFromSuccess = (orderNumber: string) => {
    setCompletedOrder(null);
    setTrackingOrderNumber(orderNumber);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-amber-400 selection:text-slate-900 pb-16 sm:pb-0">
      
      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onGoHome={() => {
          setSelectedCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        products={products}
        currentView={selectedCategory === 'all' ? 'home' : 'category'}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Banner Slider */}
        <HeroSlider 
          banners={banners} 
          onExplore={(cat) => {
            if (cat && cat !== 'all') setSelectedCategory(cat);
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} 
        />

        {/* Categories Bar Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-blue-700" />
              <span>ক্যাটাগরি সমূহ</span>
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-blue-700 font-bold hover:underline"
              >
                সবগুলো দেখুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>সকল ক্যাটাগরি</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                  selectedCategory === c.name
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Clean, Non-Intrusive Sponsored Advertisement Area */}
        {selectedCategory === 'all' ? (
          <AdBannerArea position="homepage" className="max-w-7xl mx-auto px-3 sm:px-6 pt-5" />
        ) : (
          <AdBannerArea position="category_page" className="max-w-7xl mx-auto px-3 sm:px-6 pt-5" />
        )}

        {/* Featured Products Carousel / Highlight (If in All category) */}
        {selectedCategory === 'all' && featuredProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-100 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  স্পেশাল ফিচার্ড কালেকশন
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onBuyNow={(p) => handleBuyNow(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Products Grid with Filters */}
        <section id="products-section" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
          {/* Header & Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                {selectedCategory === 'all' ? 'সকল প্রোডাক্ট' : selectedCategory}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredProducts.length} টি পণ্য প্রদর্শিত হচ্ছে
              </p>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* In Stock toggle */}
              <button
                type="button"
                onClick={() => setOnlyInStock(!onlyInStock)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  onlyInStock 
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${onlyInStock ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>স্টকে আছে</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-2.5 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  <option value="featured">জনপ্রিয় / ফিচার্ড</option>
                  <option value="price-low">মূল্য: কম থেকে বেশি</option>
                  <option value="price-high">মূল্য: বেশি থেকে কম</option>
                  <option value="rating">সর্বোচ্চ রেটিং</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Non-intrusive in-catalog promotional ad area */}
          <AdBannerArea position="product_list" className="mb-4" />

          {/* Products Grid: 2 Columns on Mobile, 3 on Tablet, 4 on Desktop! */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
              <button
                onClick={() => { setSelectedCategory('all'); setOnlyInStock(false); }}
                className="mt-2 px-4 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                সব দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onBuyNow={(p) => handleBuyNow(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sandwip Fast Delivery Banner Highlight */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-blue-800/40">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-amber-400 text-xs font-black tracking-wider uppercase">
                সন্দ্বীপের স্থানীয় অনলাইন শপ
              </span>
              <h3 className="text-base sm:text-xl font-black">
                সন্দ্বীপের ভিতরে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
              </h3>
              <p className="text-xs text-blue-200 max-w-md">
                পোস্টকোড ৪৩০১, সন্দ্বীপ উপজেলার যে কোনো প্রান্তে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে বিশ্বস্ততার সাথে হোম ডেলিভারি পৌঁছে দেওয়া হয়।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`tel:${settings.phone}`}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>কল করুন ({settings.phone})</span>
              </a>
              <button
                onClick={() => setIsSupportOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>লাইভ চ্যাট</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenPolicy={(policy) => setPolicyType(policy)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating Action Buttons (Support Chat & WhatsApp) */}
      <div className="fixed bottom-18 sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        {/* WhatsApp Direct Action */}
        <a
          href={`https://wa.me/${settings.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title="হোয়াটসঅ্যাপে যোগাযোগ"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* Live Support In-App Chat Action */}
        <button
          onClick={() => setIsSupportOpen(true)}
          className="px-3.5 py-2.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 shadow-xl shadow-blue-700/30 active:scale-95 transition-transform border border-amber-400/40"
          title="লাইভ কাস্টমার সাপোর্ট চ্যাট"
        >
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span className="hidden sm:inline text-xs font-bold">লাইভ সাপোর্ট</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-lg">
        <button
          onClick={() => {
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 py-1 text-blue-700"
        >
          <HomeIcon className="w-5 h-5" />
          <span>হোম</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 py-1 hover:text-blue-700"
        >
          <Tag className="w-5 h-5" />
          <span>ক্যাটাগরি</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-1 hover:text-blue-700"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full px-1 min-w-[16px] text-center">
                {totalItems}
              </span>
            )}
          </div>
          <span>কার্ট</span>
        </button>

        <button
          onClick={() => setIsTrackingOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 hover:text-blue-700"
        >
          <Clock className="w-5 h-5" />
          <span>ট্র্যাক</span>
        </button>

        <button
          onClick={() => setIsSupportOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 hover:text-blue-700"
        >
          <MessageSquare className="w-5 h-5 text-blue-700" />
          <span>চ্যাট</span>
        </button>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={(prod, qty) => handleBuyNow(prod, qty)}
      />

      {/* Cart Drawer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => handleOrderSuccess(order)}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onTrackOrder={(orderNumber) => handleTrackFromSuccess(orderNumber)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrderNumber('');
        }}
        initialOrderNumber={trackingOrderNumber}
      />

      {/* Customer Support Live Chat (Text, Audio Voice, Photo Upload) */}
      <SupportChat
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onOpenStandaloneApp={onOpenAdminApp}
      />

      {/* Store Policies Modal */}
      <PolicyModal
        policyType={policyType}
        onClose={() => setPolicyType(null)}
      />
    </div>
  );
};

export function App() {
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const host = window.location.hostname.toLowerCase();
      if (
        path.startsWith('/admin') ||
        hash.startsWith('#/admin') ||
        hash.startsWith('#admin') ||
        search.get('view') === 'admin' ||
        host.startsWith('admin.')
      ) {
        return 'admin';
      }
    }
    return 'customer';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const host = window.location.hostname.toLowerCase();
      if (
        path.startsWith('/admin') ||
        hash.startsWith('#/admin') ||
        hash.startsWith('#admin') ||
        search.get('view') === 'admin' ||
        host.startsWith('admin.')
      ) {
        setViewMode('admin');
      } else {
        setViewMode('customer');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToAdmin = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = '#/admin';
    }
    setViewMode('admin');
  };

  const navigateToCustomer = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '#/';
    }
    setViewMode('customer');
  };

  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          {viewMode === 'admin' ? (
            <AdminApp onSwitchToCustomer={navigateToCustomer} />
          ) : (
            <StoreApp onOpenAdminApp={navigateToAdmin} />
          )}
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
