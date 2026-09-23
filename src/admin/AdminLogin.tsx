import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, Store, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { adminLogin, login } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'passcode' | 'email'>('passcode');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('দয়া করে অ্যাডমিন পাসকোড বা পিন প্রবেশ করান।');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const ok = await adminLogin(passcode.trim());
      if (ok) {
        onSuccess?.();
      } else {
        setError('ভুল পাসকোড! সঠিক অ্যাডমিন সিকিউরিটি কী ব্যবহার করুন।');
      }
    } catch {
      setError('লগইন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('ইমেইল ও পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">JIHAN STORE ADMIN</h1>
          <p className="text-sm text-slate-400 mt-1">কেন্দ্রীয় প্রশাসন ও ডাটাবেজ ম্যানেজমেন্ট পোর্টাল</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সিকিউর ফায়ারবেস অথেন্টিকেশন অ্যাক্টিভ</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl mb-6 border border-slate-700">
          <button
            type="button"
            onClick={() => { setLoginMode('passcode'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMode === 'passcode'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            অ্যাডমিন পাসকোড / পিন
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('email'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMode === 'email'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ইমেইল ও পাসওয়ার্ড
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        {loginMode === 'passcode' ? (
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                মাস্টার অ্যাডমিন পাসকোড
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="পাসকোড লিখুন (যেমন: jihan2026)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                ডিফল্ট অনুমোদিত পাসকোড: <code className="text-slate-400">jihan2026</code> অথবা <code className="text-slate-400">sandwip4301</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                অ্যাডমিন ইমেইল
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jihanstore009@gmail.com"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ইমেইল দিয়ে লগইন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info & link to customer website */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center flex flex-col items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = window.location.origin + '/';
            }}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>কাস্টমার ওয়েবসাইট দেখুন</span>
          </a>
          <p className="text-[11px] text-slate-500">
            Jihan Store • Sandwip, Chittagong • Shared Production Database
          </p>
        </div>
      </div>
    </div>
  );
};
