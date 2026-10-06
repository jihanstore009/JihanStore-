import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';

export interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  redirectReason?: string;
  onSuccess?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectReason,
  onSuccess
}) => {
  const { login, register, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_sandwip' | 'outside_sandwip'>('inside_sandwip');

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await login(email.trim(), password);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সচল ইমেইল অ্যাড্রেস দিন।');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর দিন।');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('উভয় পাসওয়ার্ড হুবহু মিলছে না। অনুগ্রহ করে যাচাই করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await register(
        email.trim(), 
        password, 
        name.trim(), 
        phone.trim(), 
        address.trim(), 
        deliveryArea
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      setErrorMessage('পাসওয়ার্ড রিসেটের জন্য আপনার ইমেইল অ্যাড্রেস প্রদান করুন।');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await sendPasswordReset(email.trim());
      setSuccessMessage('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে সফলভাবে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।');
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="customer-auth-modal"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md border border-amber-300">
              JS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight">
                  {mode === 'login' ? 'কাস্টমার লগইন' : mode === 'register' ? 'নতুন অ্যাকাউন্ট তৈরি' : 'পাসওয়ার্ড রিসেট'}
                </h3>
                <span className="p-0.5 rounded-full bg-amber-400/20 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-blue-200">জিহান স্টোরে আপনাকে স্বাগতম</p>
            </div>
          </div>

          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Redirect Notice Banner (Required When Clicking Buy Now or Checkout) */}
        {redirectReason && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-3 flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-400 text-slate-950 shrink-0 mt-0.5 shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 leading-snug">
                {redirectReason}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                লগইন বা অ্যাকাউন্ট তৈরি সম্পন্ন হলে আপনাকে স্বয়ংক্রিয়ভাবে অর্ডার পেজে নিয়ে যাওয়া হবে। আপনার কার্টের পণ্য সংরক্ষিত থাকবে।
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher (Visible in Login & Register) */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              লগইন করুন
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              নতুন অ্যাকাউন্ট (Sign Up)
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        <div className="p-4 sm:p-5 pb-0">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake mb-3">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 pt-2 max-h-[75vh] overflow-y-auto">
          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="customer-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার ইমেইল দিন (যেমন: customer@gmail.com)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-xs text-blue-700 font-bold hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="customer-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="customer-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 disabled:opacity-60 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>লগইন হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <p className="text-xs text-slate-500">
                  এখনো কোনো অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(''); }}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    নতুন অ্যাকাউন্ট তৈরি করুন
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="customer-reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ইমেইল অ্যাড্রেস"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-reg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১XXXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ডেলিভারি এলাকা
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('inside_sandwip')}
                    className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                      deliveryArea === 'inside_sandwip'
                        ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    সন্দ্বীপের ভিতরে (চার্জ ফ্রি)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside_sandwip')}
                    className={`py-2 px-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                      deliveryArea === 'outside_sandwip'
                        ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                <div className="relative">
                  <input
                    id="customer-reg-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="গ্রাম/রোড, পোস্ট অফিস, থানা/উপজেলা"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কনফার্ম পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="customer-reg-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <button
                id="customer-reg-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 disabled:opacity-60 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>অ্যাকাউন্ট তৈরি সম্পন্ন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    লগইন করুন
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs">
                <KeyRound className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  আপনার নিবন্ধিত ইমেইল অ্যাড্রেসটি প্রদান করুন। আমরা আপনাকে একটি নিরাপদ পাসওয়ার্ড রিসেট লিংক পাঠাব।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার ইমেইল অ্যাড্রেস <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="customer-forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="যেমন: customer@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                id="customer-forgot-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>লিংক পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>রিসেট লিংক পাঠান</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="text-xs text-slate-600 hover:text-blue-700 font-bold"
                >
                  ← লগইন পেজে ফিরে যান
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
