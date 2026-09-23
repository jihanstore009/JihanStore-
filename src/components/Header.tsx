import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  MapPin, 
  Heart, 
  Clock, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenSupport: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (categoryName: string) => void;
  onSelectProduct: (product: Product) => void;
  onGoHome: () => void;
  products: Product[];
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenTracking,
  onOpenSupport,
  onOpenAdmin,
  onSelectCategory,
  onSelectProduct,
  onGoHome,
  products,
  currentView
}) => {
  const { settings, categories } = useSettings();
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search filtered items
  const searchResults = searchQuery.trim().length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {settings.tagline || 'বিশ্বাসের সাথে অনলাইন শপিং'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {settings.address || 'সন্দ্বীপ, চট্টগ্রাম'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`tel:${settings.phone}`} 
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{settings.phone}</span>
            </a>
            <button 
              id="header-track-btn"
              onClick={onOpenTracking}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>অর্ডার ট্র্যাক</span>
            </button>
            <button
              id="header-admin-link"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${
                isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdmin ? 'অ্যাডমিন প্যানেল' : 'অ্যাডমিন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={onGoHome}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          >
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.businessName} 
                className="h-10 w-auto object-contain rounded-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 flex items-center justify-center text-amber-400 font-bold shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform border border-amber-400/30">
                <span className="text-xl tracking-tighter font-black">JS</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                {settings.name || 'JIHAN STORE'}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 tracking-wide leading-none">
                {settings.businessName || 'জিহান স্টোর'}
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop & Tablet) */}
          <div className="relative flex-1 max-w-xl hidden sm:block">
            <div className="relative">
              <input
                id="search-input-desktop"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট বা ক্যাটাগরি সার্চ করুন..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      setSearchQuery('');
                    }}
                    className="p-2.5 flex items-center gap-3 hover:bg-blue-50/60 cursor-pointer transition-colors"
                  >
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-700">৳{item.price}</p>
                      {item.previousPrice && (
                        <p className="text-[10px] text-slate-400 line-through">৳{item.previousPrice}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Support Chat Button */}
            <button
              id="header-support-btn"
              onClick={onOpenSupport}
              className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1.5"
              title="কাস্টমার সাপোর্ট চ্যাট"
            >
              <MessageSquare className="w-5 h-5 text-blue-700" />
              <span className="hidden lg:inline text-xs font-semibold">সাপোর্ট</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 animate-pulse" />
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">কার্ট</span>
              <span className="bg-amber-400 text-slate-900 text-[11px] font-black rounded-full px-1.5 py-0.2 min-w-[20px] text-center">
                {totalItems}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 sm:hidden relative">
          <input
            id="search-input-mobile"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রোডাক্ট বা ক্যাটাগরি সার্চ করুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProduct(item);
                    setSearchQuery('');
                  }}
                  className="p-2 flex items-center gap-2.5 hover:bg-blue-50/60 cursor-pointer"
                >
                  <img src={item.images[0]} alt={item.name} className="w-8 h-8 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-blue-700 font-bold">৳{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Pills Bar (Horizontal Scroll) */}
      <div className="border-t border-slate-100 bg-slate-50/80 px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium text-slate-600 whitespace-nowrap">
          <button
            id="cat-pill-all"
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'home' 
                ? 'bg-blue-700 text-white font-semibold shadow-xs' 
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/70'
            }`}
          >
            সব প্রোডাক্ট
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-pill-${cat.slug}`}
              onClick={() => onSelectCategory(cat.name)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/70 transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-in slide-in-from-top duration-150">
          <div className="space-y-1">
            <button
              onClick={() => { onGoHome(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              হোম পেজ
            </button>
            <button
              onClick={() => { onOpenTracking(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>অর্ডার ট্র্যাকিং</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => { onOpenSupport(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-lg flex items-center justify-between"
            >
              <span>লাইভ কাস্টমার চ্যাট</span>
              <MessageSquare className="w-4 h-4 text-blue-700" />
            </button>
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center justify-between"
            >
              <span>{isAdmin ? 'অ্যাডমিন ড্যাশবোর্ড' : 'অ্যাডমিন লগইন'}</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">{settings.businessName}</p>
            <p className="mt-0.5">{settings.address}</p>
            <p className="mt-0.5">হেল্পলাইন: {settings.phone}</p>
          </div>
        </div>
      )}
    </header>
  );
};
