import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onOpenPolicy: (policyType: 'privacy' | 'terms' | 'return' | 'about') => void;
  onOpenSupport: () => void;
  onOpenTracking: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onOpenSupport,
  onOpenTracking,
  onSelectCategory,
}) => {
  const { settings, categories } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-16 sm:pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top 4 Value Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">সন্দ্বীপে ফ্রি ডেলিভারি</h4>
              <p className="text-[11px] text-slate-400">পোস্টকোড ৪৩০১ এ দ্রুত ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">১০০% আসল প্রোডাক্ট</h4>
              <p className="text-[11px] text-slate-400">কোয়ালিটি ও ব্র্যান্ড বিশ্বস্ততা</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">সহজ রিটার্ন পলিসি</h4>
              <p className="text-[11px] text-slate-400">ত্রুটিযুক্ত পণ্যে সহজ এক্সচেঞ্জ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">লাইভ চ্যাট সাপোর্ট</h4>
              <p className="text-[11px] text-slate-400">টেক্সট ও অডিও মেসেজ সুবিধা</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          
          {/* Column 1: Store Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.businessName}
                  className="h-9 w-auto object-contain rounded-md"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-400/30">
                  JS
                </div>
              )}
              <div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  {settings.name || 'JIHAN STORE'}
                </span>
                <span className="block text-[11px] font-bold text-amber-400">
                  {settings.businessName || 'জিহান স্টোর'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.tagline}। সন্দ্বীপ এবং সমগ্র বাংলাদেশের কাস্টমারদের জন্য স্মার্টওয়াচ, ইয়ারবাডস, গ্যাজেট ও লাইফস্টাইল পণ্যের নির্ভরযোগ্য অনলাইন শপ।
            </p>

            {/* Social Media Links */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                সোশ্যাল মিডিয়ায় যুক্ত থাকুন:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {settings.socialLinks && settings.socialLinks.length > 0 ? (
                  settings.socialLinks.filter(s => s.enabled && s.url).map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
                    >
                      <span>{s.platformName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                    </a>
                  ))
                ) : (
                  <>
                    {settings.socialFacebook && (
                      <a 
                        href={settings.socialFacebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600 text-white transition-colors flex items-center gap-1"
                      >
                        <span>ফেসবুক</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {settings.socialInstagram && (
                      <a 
                        href={settings.socialInstagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-pink-600 text-white transition-colors flex items-center gap-1"
                      >
                        <span>ইনস্টাগ্রাম</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {settings.socialTiktok && (
                      <a 
                        href={settings.socialTiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1"
                      >
                        <span>টিকটক</span>
                      </a>
                    )}
                    {settings.socialTelegram && (
                      <a 
                        href={settings.socialTelegram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-sky-600 text-white transition-colors flex items-center gap-1"
                      >
                        <span>টেলিগ্রাম</span>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">জনপ্রিয় ক্যাটাগরি</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">কাস্টমার কেয়ার</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenTracking} className="hover:text-amber-400 transition-colors">
                  অর্ডার ট্র্যাকিং
                </button>
              </li>
              <li>
                <button onClick={onOpenSupport} className="hover:text-amber-400 transition-colors">
                  লাইভ চ্যাট ও সাপোর্ট
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('return')} className="hover:text-amber-400 transition-colors">
                  রিটার্ন ও এক্সচেঞ্জ পলিসি
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-amber-400 transition-colors">
                  শর্তাবলী (Terms & Conditions)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-amber-400 transition-colors">
                  প্রাইভেসি পলিসি (Privacy Policy)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-amber-400 transition-colors">
                  আমাদের সম্পর্কে (About Us)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">যোগাযোগ</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white font-semibold">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={`https://wa.me/${settings.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 font-semibold"
                >
                  হোয়াটসঅ্যাপ: {settings.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </div>

              {/* Extra configured addresses/contacts */}
              {settings.additionalContacts && settings.additionalContacts.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  {settings.additionalContacts.map((contact) => (
                    <p key={contact.id} className="text-[11px] text-slate-400">
                      <span className="text-slate-300 font-medium">{contact.label}:</span> {contact.value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.businessName}। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>ডিজাইন ও প্রযুক্তি:</span>
            <span className="text-amber-400 font-semibold">Production Ready Firebase & Netlify Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
