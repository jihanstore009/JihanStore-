import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Truck, 
  CreditCard, 
  Phone, 
  Mail, 
  Globe, 
  Check, 
  Upload, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  Palette, 
  Eye, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Copy, 
  Star,
  Info,
  Radio,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { 
  StoreSettings, 
  StoreAddress,
  StorePhoneContact, 
  StoreEmailContact, 
  StoreSocialLink, 
  StorePaymentAccount, 
  StoreDeliveryZone,
  StoreBrandColors 
} from '../types';
import { uploadMedia } from '../firebase/config';

type SettingsTab = 'general' | 'addresses' | 'phones' | 'emails' | 'socials' | 'payments' | 'delivery' | 'logo_branding';

// BD Phone regex
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;
// Standard Email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// URL validator
const isValidUrl = (url: string) => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Preset brand colors for Jihan Store (Royal Blue & Gold theme)
const BRAND_PRESET_PRIMARIES = [
  { label: 'Royal Blue (ডিফল্ট)', value: '#1e3a8a' },
  { label: 'Navy Deep Blue', value: '#0f172a' },
  { label: 'Classic Cobalt', value: '#1d4ed8' },
  { label: 'Modern Indigo', value: '#4338ca' },
];

const BRAND_PRESET_SECONDARIES = [
  { label: 'Warm Gold (ডিফল্ট)', value: '#d97706' },
  { label: 'Bright Amber', value: '#f59e0b' },
  { label: 'Bronze Gold', value: '#b45309' },
  { label: 'Rich Emerald', value: '#059669' },
];

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  // Local form state
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreviewBg, setLogoPreviewBg] = useState<'checker' | 'light' | 'dark'>('checker');

  // Modal / Item Editor state
  const [editingAddress, setEditingAddress] = useState<{ isOpen: boolean; isNew: boolean; data: StoreAddress } | null>(null);
  const [editingPhone, setEditingPhone] = useState<{ isOpen: boolean; isNew: boolean; data: StorePhoneContact } | null>(null);
  const [editingEmail, setEditingEmail] = useState<{ isOpen: boolean; isNew: boolean; data: StoreEmailContact } | null>(null);
  const [editingSocial, setEditingSocial] = useState<{ isOpen: boolean; isNew: boolean; data: StoreSocialLink } | null>(null);
  const [editingPayment, setEditingPayment] = useState<{ isOpen: boolean; isNew: boolean; data: StorePaymentAccount } | null>(null);
  const [editingZone, setEditingZone] = useState<{ isOpen: boolean; isNew: boolean; data: StoreDeliveryZone } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with context whenever settings update from database
  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  // Validation helper
  const validateForm = (): boolean => {
    setErrorMessage('');

    if (!form.name.trim()) {
      setErrorMessage('দোকানের নাম (Store Name) পূরণ করা আবশ্যক।');
      setActiveTab('general');
      return false;
    }

    if (!form.phone.trim()) {
      setErrorMessage('প্রধান ফোন নম্বর প্রদান করা আবশ্যক।');
      setActiveTab('phones');
      return false;
    }

    // Check phone formats
    const phones = form.phoneNumbers || [];
    for (const p of phones) {
      const cleanNum = p.number.replace(/\s+/g, '');
      if (cleanNum && !BD_PHONE_REGEX.test(cleanNum)) {
        setErrorMessage(`ফোন নম্বর "${p.number}" সঠিক নয়। সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01867841638)।`);
        setActiveTab('phones');
        return false;
      }
    }

    // Check emails
    const emails = form.emailAddresses || [];
    for (const e of emails) {
      if (e.email && !EMAIL_REGEX.test(e.email)) {
        setErrorMessage(`ইমেইল "${e.email}" সঠিক ফরম্যাটে নেই।`);
        setActiveTab('emails');
        return false;
      }
    }

    // Check social URLs
    const socials = form.socialLinks || [];
    for (const s of socials) {
      if (s.enabled && s.url && !isValidUrl(s.url)) {
        setErrorMessage(`সোশ্যাল মিডিয়া "${s.platformName}"-এর URL সঠিক নয় (https:// সহ দিন)।`);
        setActiveTab('socials');
        return false;
      }
    }

    return true;
  };

  // Main Save Handler
  const handleSave = async (customMessage?: string) => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      // Ensure sync between structured lists and top-level fields
      const updated = await updateSettings(form);
      setForm({ ...updated });
      setSaveSuccess(true);
      setSuccessMessage(customMessage || 'দোকানের সকল তথ্য ও সেটিংস সফলভাবে ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4500);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMessage(err?.message || 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== LOGO MANAGEMENT ====================
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('শুধুমাত্র JPG, PNG, WEBP অথবা SVG ফরম্যাটের ইমেজ ফাইল আপলোড করুন।');
      return;
    }

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ইমেজ ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
      return;
    }

    setIsUploadingLogo(true);
    setErrorMessage('');
    try {
      const url = await uploadMedia(file, `store/logo_${Date.now()}`);
      const updatedForm = { ...form, logoUrl: url };
      setForm(updatedForm);
      await updateSettings(updatedForm);
      setSaveSuccess(true);
      setSuccessMessage('লোগো সফলভাবে আপলোড ও ডাটাবেজে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to upload logo:', err);
      setErrorMessage('লোগো আপলোড ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('আপনি কি স্টোর লোগো মুছে ফেলতে চান? ডিফল্ট JS মনোগ্রাম ব্যাজ প্রদর্শিত হবে।')) return;
    const updatedForm = { ...form, logoUrl: '' };
    setForm(updatedForm);
    await updateSettings(updatedForm);
    setSaveSuccess(true);
    setSuccessMessage('লোগো সরানো হয়েছে। ডিফল্ট মনোগ্রাম সক্রিয় করা হয়েছে।');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // ==================== STORE ADDRESSES MANAGEMENT ====================
  const openAddAddress = () => {
    setEditingAddress({
      isOpen: true,
      isNew: true,
      data: {
        id: `addr-${Date.now()}`,
        title: 'নতুন শাখা / পিকআপ হাব',
        address: '',
        phone: form.phone || '01867841638',
        isPrimary: false,
        notes: ''
      }
    });
  };

  const handleSaveAddress = (item: StoreAddress) => {
    if (!item.address.trim()) {
      setErrorMessage('ঠিকানা খালি রাখা যাবে না।');
      return;
    }
    if (!item.title.trim()) {
      setErrorMessage('ঠিকানা বা শাখার নাম প্রদান করুন।');
      return;
    }

    let list = [...(form.addresses || [])];
    if (item.isPrimary) {
      list = list.map(a => ({ ...a, isPrimary: false }));
    }

    if (editingAddress?.isNew) {
      list.push(item);
    } else {
      list = list.map(a => a.id === item.id ? item : a);
    }

    if (!list.some(a => a.isPrimary) && list.length > 0) {
      list[0].isPrimary = true;
    }

    const primaryAddr = list.find(a => a.isPrimary) || list[0];
    setForm({
      ...form,
      addresses: list,
      address: primaryAddr.address
    });
    setEditingAddress(null);
    setErrorMessage('');
  };

  const handleDeleteAddress = (id: string) => {
    const list = (form.addresses || []).filter(a => a.id !== id);
    if (list.length === 0) {
      alert('দোকানের কমপক্ষে একটি ঠিকানা থাকা আবশ্যক।');
      return;
    }
    if (!list.some(a => a.isPrimary)) {
      list[0].isPrimary = true;
    }
    const primaryAddr = list.find(a => a.isPrimary) || list[0];
    setForm({
      ...form,
      addresses: list,
      address: primaryAddr.address
    });
  };

  const handleSetPrimaryAddress = (id: string) => {
    const list = (form.addresses || []).map(a => ({
      ...a,
      isPrimary: a.id === id
    }));
    const primaryAddr = list.find(a => a.id === id);
    setForm({
      ...form,
      addresses: list,
      address: primaryAddr ? primaryAddr.address : form.address
    });
  };

  // ==================== PHONE CONTACTS MANAGEMENT ====================
  const openAddPhone = () => {
    setEditingPhone({
      isOpen: true,
      isNew: true,
      data: {
        id: `phone-${Date.now()}`,
        number: '',
        label: 'সাপোর্ট হটলাইন',
        type: 'secondary',
        isPrimary: false,
        notes: ''
      }
    });
  };

  const handleSavePhone = (item: StorePhoneContact) => {
    if (!item.number.trim()) {
      setErrorMessage('ফোন নম্বর খালি রাখা যাবে না।');
      return;
    }
    const cleanNum = item.number.replace(/\s+/g, '');
    if (!BD_PHONE_REGEX.test(cleanNum)) {
      setErrorMessage('সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01867841638)।');
      return;
    }

    let list = [...(form.phoneNumbers || [])];

    // Check duplicate
    const duplicate = list.find(p => p.id !== item.id && p.number.replace(/\s+/g, '') === cleanNum);
    if (duplicate) {
      setErrorMessage('এই ফোন নম্বরটি ইতিমধ্যে তালিকায় রয়েছে।');
      return;
    }

    if (item.isPrimary) {
      // Unmark any other primary
      list = list.map(p => ({ ...p, isPrimary: false }));
    }

    if (editingPhone?.isNew) {
      list.push(item);
    } else {
      list = list.map(p => p.id === item.id ? item : p);
    }

    // Ensure at least one primary exists
    if (!list.some(p => p.isPrimary) && list.length > 0) {
      list[0].isPrimary = true;
    }

    const primaryOne = list.find(p => p.isPrimary) || list[0];
    const waOne = list.find(p => p.type === 'whatsapp') || primaryOne;

    const updated = {
      ...form,
      phoneNumbers: list,
      phone: primaryOne ? primaryOne.number : form.phone,
      whatsapp: waOne ? waOne.number : form.whatsapp
    };

    setForm(updated);
    setEditingPhone(null);
    setErrorMessage('');
  };

  const handleDeletePhone = (id: string) => {
    const list = (form.phoneNumbers || []).filter(p => p.id !== id);
    if (list.length === 0) {
      alert('কমপক্ষে একটি ফোন নম্বর থাকা আবশ্যক।');
      return;
    }
    if (!list.some(p => p.isPrimary)) {
      list[0].isPrimary = true;
    }
    const primaryOne = list.find(p => p.isPrimary) || list[0];
    setForm({
      ...form,
      phoneNumbers: list,
      phone: primaryOne.number
    });
  };

  const handleSetPrimaryPhone = (id: string) => {
    const list = (form.phoneNumbers || []).map(p => ({
      ...p,
      isPrimary: p.id === id
    }));
    const primaryOne = list.find(p => p.id === id);
    setForm({
      ...form,
      phoneNumbers: list,
      phone: primaryOne ? primaryOne.number : form.phone
    });
  };

  // ==================== EMAIL MANAGEMENT ====================
  const openAddEmail = () => {
    setEditingEmail({
      isOpen: true,
      isNew: true,
      data: {
        id: `email-${Date.now()}`,
        email: '',
        label: 'অফিসিয়াল সাপোর্ট',
        isPrimary: false
      }
    });
  };

  const handleSaveEmail = (item: StoreEmailContact) => {
    if (!item.email.trim()) {
      setErrorMessage('ইমেইল খালি রাখা যাবে না।');
      return;
    }
    if (!EMAIL_REGEX.test(item.email)) {
      setErrorMessage('সঠিক ইমেইল ফরম্যাট দিন (যেমন: support@jihanstore.com)।');
      return;
    }

    let list = [...(form.emailAddresses || [])];

    // Check duplicate
    const duplicate = list.find(e => e.id !== item.id && e.email.toLowerCase() === item.email.toLowerCase());
    if (duplicate) {
      setErrorMessage('এই ইমেইলটি ইতিমধ্যে তালিকায় রয়েছে।');
      return;
    }

    if (item.isPrimary) {
      list = list.map(e => ({ ...e, isPrimary: false }));
    }

    if (editingEmail?.isNew) {
      list.push(item);
    } else {
      list = list.map(e => e.id === item.id ? item : e);
    }

    if (!list.some(e => e.isPrimary) && list.length > 0) {
      list[0].isPrimary = true;
    }

    const primaryEmail = list.find(e => e.isPrimary) || list[0];
    setForm({
      ...form,
      emailAddresses: list,
      email: primaryEmail.email
    });
    setEditingEmail(null);
    setErrorMessage('');
  };

  const handleDeleteEmail = (id: string) => {
    const list = (form.emailAddresses || []).filter(e => e.id !== id);
    if (list.length === 0) {
      alert('কমপক্ষে একটি সাপোর্ট ইমেইল থাকা প্রয়োজন।');
      return;
    }
    if (!list.some(e => e.isPrimary)) {
      list[0].isPrimary = true;
    }
    const primaryEmail = list.find(e => e.isPrimary) || list[0];
    setForm({
      ...form,
      emailAddresses: list,
      email: primaryEmail.email
    });
  };

  const handleSetPrimaryEmail = (id: string) => {
    const list = (form.emailAddresses || []).map(e => ({
      ...e,
      isPrimary: e.id === id
    }));
    const primary = list.find(e => e.id === id);
    setForm({
      ...form,
      emailAddresses: list,
      email: primary ? primary.email : form.email
    });
  };

  // ==================== SOCIAL LINKS MANAGEMENT ====================
  const openAddSocial = () => {
    setEditingSocial({
      isOpen: true,
      isNew: true,
      data: {
        id: `soc-${Date.now()}`,
        platform: 'other',
        platformName: '',
        url: 'https://',
        enabled: true
      }
    });
  };

  const handleSaveSocial = (item: StoreSocialLink) => {
    if (!item.platformName.trim()) {
      setErrorMessage('প্ল্যাটফর্মের নাম লিখুন।');
      return;
    }
    if (item.url && !isValidUrl(item.url)) {
      setErrorMessage('সঠিক URL প্রদান করুন (যেমন: https://facebook.com/yourpage)।');
      return;
    }

    let list = [...(form.socialLinks || [])];
    if (editingSocial?.isNew) {
      list.push(item);
    } else {
      list = list.map(s => s.id === item.id ? item : s);
    }

    setForm({ ...form, socialLinks: list });
    setEditingSocial(null);
    setErrorMessage('');
  };

  const handleDeleteSocial = (id: string) => {
    const list = (form.socialLinks || []).filter(s => s.id !== id);
    setForm({ ...form, socialLinks: list });
  };

  const handleToggleSocial = (id: string) => {
    const list = (form.socialLinks || []).map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setForm({ ...form, socialLinks: list });
  };

  // ==================== PAYMENT ACCOUNTS MANAGEMENT ====================
  const openAddPayment = () => {
    setEditingPayment({
      isOpen: true,
      isNew: true,
      data: {
        id: `pay-${Date.now()}`,
        method: 'bkash',
        methodName: 'বিকাশ (bKash)',
        accountNumber: '',
        accountType: 'Personal',
        accountHolderName: 'JIHAN STORE',
        instruction: 'অ্যাপ অথবা ডায়াল করে Send Money করুন এবং TrxID দিন।',
        enabled: true,
        isDefault: false
      }
    });
  };

  const handleSavePayment = (item: StorePaymentAccount) => {
    if (!item.accountNumber.trim()) {
      setErrorMessage('অ্যাকাউন্ট নম্বর প্রদান করা আবশ্যক।');
      return;
    }

    let list = [...(form.paymentAccounts || [])];
    if (item.isDefault) {
      list = list.map(p => p.method === item.method ? { ...p, isDefault: false } : p);
    }

    if (editingPayment?.isNew) {
      list.push(item);
    } else {
      list = list.map(p => p.id === item.id ? item : p);
    }

    // Sync legacy scalar fields
    const bkash = list.find(p => p.method === 'bkash' && p.enabled) || list.find(p => p.method === 'bkash');
    const nagad = list.find(p => p.method === 'nagad' && p.enabled) || list.find(p => p.method === 'nagad');

    setForm({
      ...form,
      paymentAccounts: list,
      bkashNumber: bkash ? bkash.accountNumber : form.bkashNumber,
      bkashType: bkash ? (bkash.accountType as any) : form.bkashType,
      bkashInstruction: bkash?.instruction || form.bkashInstruction,
      nagadNumber: nagad ? nagad.accountNumber : form.nagadNumber,
      nagadType: nagad ? (nagad.accountType as any) : form.nagadType,
      nagadInstruction: nagad?.instruction || form.nagadInstruction
    });

    setEditingPayment(null);
    setErrorMessage('');
  };

  const handleDeletePayment = (id: string) => {
    const list = (form.paymentAccounts || []).filter(p => p.id !== id);
    setForm({ ...form, paymentAccounts: list });
  };

  const handleTogglePayment = (id: string) => {
    const list = (form.paymentAccounts || []).map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    setForm({ ...form, paymentAccounts: list });
  };

  // ==================== DELIVERY ZONES MANAGEMENT ====================
  const openAddZone = () => {
    setEditingZone({
      isOpen: true,
      isNew: true,
      data: {
        id: `zone-${Date.now()}`,
        name: '',
        charge: 100,
        estimatedTime: '২-৩ দিন',
        enabled: true,
        isInsideSandwip: false
      }
    });
  };

  const handleSaveZone = (item: StoreDeliveryZone) => {
    if (!item.name.trim()) {
      setErrorMessage('ডেলিভারি জোনের নাম আবশ্যক।');
      return;
    }

    let list = [...(form.deliveryZones || [])];
    if (editingZone?.isNew) {
      list.push(item);
    } else {
      list = list.map(z => z.id === item.id ? item : z);
    }

    const insideZone = list.find(z => z.isInsideSandwip);
    const outsideZone = list.find(z => !z.isInsideSandwip);

    setForm({
      ...form,
      deliveryZones: list,
      deliveryInsideSandwip: insideZone ? insideZone.charge : form.deliveryInsideSandwip,
      deliveryOutsideSandwip: outsideZone ? outsideZone.charge : form.deliveryOutsideSandwip
    });

    setEditingZone(null);
    setErrorMessage('');
  };

  const handleDeleteZone = (id: string) => {
    const list = (form.deliveryZones || []).filter(z => z.id !== id);
    setForm({ ...form, deliveryZones: list });
  };

  const handleToggleZone = (id: string) => {
    const list = (form.deliveryZones || []).map(z => z.id === id ? { ...z, enabled: !z.enabled } : z);
    setForm({ ...form, deliveryZones: list });
  };

  // Current brand colors
  const primaryColor = form.brandColors?.primary || '#1e3a8a';
  const secondaryColor = form.brandColors?.secondary || '#d97706';

  return (
    <div className="space-y-6 max-w-5xl pb-16 font-sans">
      
      {/* Top Header & Sticky Save Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-2 z-20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                দোকানের তথ্য ও পেমেন্ট সেটিংস
              </h2>
              <p className="text-xs text-slate-500">
                Jihan Store-এর যাবতীয় তথ্য, লোগো, ফোন, ইমেইল, সোশ্যাল লিঙ্ক ও পেমেন্ট গেটওয়ে পরিচালনা করুন
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-800/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>সকল সেটিংস সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs sm:text-sm font-bold shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSaveSuccess(false)}
            className="p-1 text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-900 text-xs sm:text-sm font-bold shadow-xs animate-in shake duration-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage('')}
            className="p-1 text-rose-700 hover:text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'general', label: '১. সাধারণ তথ্য', icon: Store, count: null },
          { id: 'addresses', label: '২. ঠিকানা ও শাখা', icon: MapPin, count: form.addresses?.length || 1 },
          { id: 'phones', label: '৩. ফোন নম্বরসমূহ', icon: Phone, count: form.phoneNumbers?.length || 0 },
          { id: 'emails', label: '৪. ইমেইল ঠিকানা', icon: Mail, count: form.emailAddresses?.length || 0 },
          { id: 'socials', label: '৫. সোশ্যাল মিডিয়া', icon: Globe, count: form.socialLinks?.filter(s => s.enabled).length || 0 },
          { id: 'payments', label: '৬. পেমেন্ট মেথড', icon: CreditCard, count: form.paymentAccounts?.filter(p => p.enabled).length || 0 },
          { id: 'delivery', label: '৭. ডেলিভারি চার্জ', icon: Truck, count: form.deliveryZones?.length || 0 },
          { id: 'logo_branding', label: '৮. লোগো ও ব্র্যান্ডিং', icon: ImageIcon, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: GENERAL STORE INFO ==================== */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  দোকানের মৌলিক পরিচয় ও ঠিকানা
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">সবগুলো ফিল্ড সরাসরি এডিটযোগ্য</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্যবসার নাম (Business Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.businessName || ''}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="যেমন: Jihan Store – জিহান স্টোর"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">ইনভয়েস ও লিগ্যাল ডকুমেন্টে প্রদর্শিত হবে</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্টোর/ওয়েবসাইটের নাম (Display Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="যেমন: Jihan Store"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">হেডার এবং ব্রাউজার টাইটেলে প্রদর্শিত হবে</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ট্যাগলাইন বা স্লোগান (Tagline)
              </label>
              <input
                type="text"
                value={form.tagline || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="যেমন: বিশ্বাসের সাথে অনলাইন শপিং"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">হেডারের নোটিশ বার ও ব্যানারে প্রদর্শিত হবে</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                দোকানের পূর্ণ ঠিকানা (Full Address) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম, বাংলাদেশ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 leading-relaxed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">ফুটার এবং ডেলিভারি স্লিপে দেখানো হবে</span>
            </div>

            {/* Quick Contact Summary */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">প্রধান ফোন</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">{form.phone || 'নির্ধারিত হয়নি'}</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('phones')}
                    className="text-[10px] text-blue-600 hover:underline block mt-1 font-semibold"
                  >
                    নম্বর পরিবর্তন ও যোগ করুন →
                  </button>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">হোয়াটসঅ্যাপ</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">{form.whatsapp || 'নির্ধারিত হয়নি'}</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('phones')}
                    className="text-[10px] text-emerald-600 hover:underline block mt-1 font-semibold"
                  >
                    হোয়াটসঅ্যাপ পরিবর্তন করুন →
                  </button>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">প্রধান সাপোর্ট ইমেইল</span>
                  <span className="font-mono font-bold text-xs text-slate-900 truncate block">{form.email || 'নির্ধারিত হয়নি'}</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('emails')}
                    className="text-[10px] text-indigo-600 hover:underline block mt-1 font-semibold"
                  >
                    ইমেইল পরিচালনা করুন →
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('দোকানের সাধারণ তথ্য সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>সাধারণ তথ্য সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: STORE ADDRESSES ==================== */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    দোকানের পূর্ণ ঠিকানা ও শাখা কার্যালয় ব্যবস্থাপনা
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রধান কার্যালয়ের ঠিকানা পরিবর্তন করুন, নতুন শাখা অফিস বা পিকআপ হাব যোগ করুন অথবা রিমুভ করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddAddress}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ নতুন ঠিকানা যোগ করুন</span>
              </button>
            </div>

            {/* List of Addresses */}
            <div className="space-y-3">
              {(form.addresses || []).map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-all ${
                    addr.isPrimary
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      addr.isPrimary ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{addr.title}</span>
                        {addr.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            প্রধান ঠিকানা (Primary)
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {addr.address}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                        {addr.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {addr.phone}
                          </span>
                        )}
                        {addr.notes && <span>• {addr.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!addr.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryAddress(addr.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 text-xs font-bold rounded-lg transition"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingAddress({ isOpen: true, isNew: false, data: { ...addr } })}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {(form.addresses || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('ঠিকানা তালিকা সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ঠিকানা তালিকা সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB: STORE LOGO & BRANDING ==================== */}
      {activeTab === 'logo_branding' && (
        <div className="space-y-6">
          
          {/* Logo Management Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  স্টোর লোগো ব্যবস্থাপনা (Store Logo)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">JPG, PNG, WEBP ও SVG সাপোর্টেড</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Live Logo Previews */}
              <div className="md:col-span-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700">লাইভ লোগো প্রিভিউ</label>
                
                {/* Background Selector for PNG Transparency Testing */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLogoPreviewBg('checker')}
                    className={`flex-1 py-1 rounded transition ${logoPreviewBg === 'checker' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                  >
                    ট্রান্সপারেন্ট গ্রিড
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoPreviewBg('light')}
                    className={`flex-1 py-1 rounded transition ${logoPreviewBg === 'light' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
                  >
                    লাইট ব্যাকগ্রাউন্ড
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoPreviewBg('dark')}
                    className={`flex-1 py-1 rounded transition ${logoPreviewBg === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    ডার্ক ব্যাকগ্রাউন্ড
                  </button>
                </div>

                {/* Preview Box */}
                <div className={`h-48 rounded-2xl border flex items-center justify-center p-4 relative overflow-hidden transition-all ${
                  logoPreviewBg === 'dark'
                    ? 'bg-slate-950 border-slate-800'
                    : logoPreviewBg === 'light'
                    ? 'bg-white border-slate-200'
                    : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 border-slate-300'
                }`}>
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Store Logo Preview"
                      className="max-h-36 max-w-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 flex items-center justify-center text-amber-400 font-black text-2xl shadow-md border border-amber-400/30">
                        JS
                      </div>
                      <span className="text-xs font-bold mt-2 text-slate-500">কোনো লোগো আপলোড করা হয়নি</span>
                      <span className="text-[10px] text-slate-400">ডিফল্ট JS মনোগ্রাম ব্যাজ ব্যবহৃত হচ্ছে</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  💡 <strong>টিপস:</strong> ট্রান্সপারেন্ট ব্যাকগ্রাউন্ডযুক্ত লোগো (PNG বা SVG) আপলোড করলে হেডারের লাইট এবং ডার্ক উভয় অংশে চমৎকারভাবে মানিয়ে যাবে।
                </div>
              </div>

              {/* Right Column: Actions & URL input */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ডিভাইস থেকে সরাসরি লোগো আপলোড
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-file-input"
                    />
                    <label
                      htmlFor="logo-file-input"
                      className="cursor-pointer px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs border border-blue-200 flex items-center gap-2 transition-all active:scale-95 shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>{isUploadingLogo ? 'আপলোড হচ্ছে...' : 'লোগো ফাইল নির্বাচন করুন'}</span>
                    </label>

                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>লোগো মুছে ফেলুন</span>
                      </button>
                    )}
                  </div>
                  {isUploadingLogo && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 font-semibold animate-pulse">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>ছবি প্রক্রিয়াকরণ ও ডাটাবেজে সংরক্ষণ করা হচ্ছে...</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অথবা অনলাইন ইমেজ URL ব্যবহার করুন
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.logoUrl || ''}
                      onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    যেকোনো অনলাইন হোস্টেড ছবির ডিরেক্ট URL পেস্ট করতে পারেন
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>লোগো ব্যবহারের স্থানসমূহ:</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-relaxed">
                    লোগো সেভ করার পর তা স্বয়ংক্রিয়ভাবে কাস্টমার ওয়েবসাইটের টপ হেডার বার, ফুটার সেকশন, অ্যাডমিন প্যানেল এবং ইনভয়েস স্লিপে ব্যবহৃত হবে।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Branding & Theme Colors Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  ব্র্যান্ড কালার ও থিম প্রিভিউ (Royal Blue + Gold)
                </h3>
              </div>
              <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Jihan Signature Theme
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ১. প্রাইমারি ব্র্যান্ড কালার (Primary Brand Color)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setForm({
                      ...form,
                      brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), primary: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setForm({
                        ...form,
                        brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), primary: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">হেডার, বাটন ও প্রধান হাইলাইটের জন্য</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BRAND_PRESET_PRIMARIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), primary: p.value }
                      })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition"
                      style={{
                        borderColor: primaryColor === p.value ? p.value : '#e2e8f0',
                        backgroundColor: primaryColor === p.value ? `${p.value}15` : '#ffffff',
                        color: primaryColor === p.value ? p.value : '#475569'
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.value }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ২. সেকেন্ডারি গোল্ড কালার (Secondary / Accent Color)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setForm({
                      ...form,
                      brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), secondary: e.target.value }
                    })}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-300 p-0.5"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setForm({
                        ...form,
                        brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), secondary: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 font-mono text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">গোল্ডেন ব্যাজ, স্টার রেটিং ও ডিসকাউন্ট ট্যাগে ব্যবহৃত</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BRAND_PRESET_SECONDARIES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({
                        ...form,
                        brandColors: { ...(form.brandColors || { primary: '', secondary: '' }), secondary: s.value }
                      })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition"
                      style={{
                        borderColor: secondaryColor === s.value ? s.value : '#e2e8f0',
                        backgroundColor: secondaryColor === s.value ? `${s.value}15` : '#ffffff',
                        color: secondaryColor === s.value ? s.value : '#475569'
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.value }} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Interactive Header Preview Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>লাইভ ব্র্যান্ড প্রিভিউ (কাস্টমার যেভাবে দেখবেন)</span>
              </span>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="h-10 w-auto object-contain rounded-md" />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border"
                      style={{ 
                        backgroundColor: primaryColor, 
                        borderColor: secondaryColor,
                        color: secondaryColor 
                      }}
                    >
                      JS
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-base tracking-tight text-white">{form.name || 'JIHAN STORE'}</h4>
                    <p className="text-xs font-semibold" style={{ color: secondaryColor }}>{form.tagline || 'বিশ্বাসের সাথে অনলাইন শপিং'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs text-slate-950 inline-flex items-center gap-1"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>অফার চলছে</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('লোগো ও ব্র্যান্ড সেটিংস সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>লোগো ও ব্র্যান্ডিং সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PHONE NUMBERS ==================== */}
      {activeTab === 'phones' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    ফোন নম্বর তালিকা ও হটলাইন ব্যবস্থাপনা
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  একাধিক হটলাইন নম্বর, আউটলেট নম্বর ও হোয়াটসঅ্যাপ নম্বর যুক্ত করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddPhone}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Number</span>
              </button>
            </div>

            {/* List of Phone Numbers */}
            <div className="space-y-3">
              {(form.phoneNumbers || []).map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    p.isPrimary
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      p.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900">{p.number}</span>
                        {p.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Primary Hotline
                          </span>
                        )}
                        {p.type === 'whatsapp' && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                            WhatsApp
                          </span>
                        )}
                        {p.type === 'secondary' && !p.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            Secondary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{p.label}</span>
                        {p.notes && <span className="text-slate-400">• {p.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!p.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryPhone(p.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg transition"
                        title="এই নম্বরটিকে প্রধান হটলাইন নির্ধারণ করুন"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingPhone({ isOpen: true, isNew: false, data: { ...p } })}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {(form.phoneNumbers || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhone(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('ফোন নম্বর তালিকা সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ফোন নম্বর তালিকা সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: EMAILS ==================== */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    ইমেইল ঠিকানা তালিকা (Support & Order Emails)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  কাস্টমার ইনকোয়ারি, সাপোর্ট ও অর্ডারের জন্য প্রয়োজনীয় ইমেইল যুক্ত করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddEmail}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Email</span>
              </button>
            </div>

            {/* List of Emails */}
            <div className="space-y-3">
              {(form.emailAddresses || []).map((e) => (
                <div
                  key={e.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    e.isPrimary
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      e.isPrimary ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{e.email}</span>
                        {e.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Primary Email
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 block mt-0.5">{e.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!e.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryEmail(e.id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-xs font-bold rounded-lg transition"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingEmail({ isOpen: true, isNew: false, data: { ...e } })}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {(form.emailAddresses || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEmail(e.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('ইমেইল তালিকা সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ইমেইল তালিকা সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: SOCIAL MEDIA LINKS ==================== */}
      {activeTab === 'socials' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    সোশ্যাল মিডিয়া প্রোফাইল ও লিঙ্কস
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ফেসবুক, ইনস্টাগ্রাম, টিকটক, টেলিগ্রাম ও অন্যান্য চ্যানেলের লিঙ্ক যুক্ত এবং অন/অফ করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddSocial}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Social Link</span>
              </button>
            </div>

            {/* List of Social Media Links */}
            <div className="space-y-3">
              {(form.socialLinks || []).map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    s.enabled
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {s.platform === 'facebook' ? 'FB' :
                       s.platform === 'instagram' ? 'IG' :
                       s.platform === 'tiktok' ? 'TT' :
                       s.platform === 'youtube' ? 'YT' :
                       s.platform === 'telegram' ? 'TG' :
                       s.platform === 'whatsapp' ? 'WA' : 'SOC'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{s.platformName}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          s.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {s.enabled ? 'সক্রিয় (Active)' : 'বন্ধ (Disabled)'}
                        </span>
                      </div>
                      <a
                        href={s.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 truncate max-w-sm mt-0.5"
                      >
                        <span>{s.url || '(লিঙ্ক দেওয়া হয়নি)'}</span>
                        {s.url && <ExternalLink className="w-3 h-3 shrink-0" />}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSocial(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        s.enabled
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.enabled ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingSocial({ isOpen: true, isNew: false, data: { ...s } })}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSocial(s.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('সোশ্যাল মিডিয়া সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>সোশ্যাল মিডিয়া সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: PAYMENT ACCOUNTS ==================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    পেমেন্ট অ্যাকাউন্ট ও গেটওয়ে সেটিংস
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  বিকাশ, নগদ, রকেট, ব্যাংক অ্যাকাউন্ট ও কাস্টম পেমেন্ট মেথড পরিচালনা করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddPayment}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Payment Account</span>
              </button>
            </div>

            {/* List of Payment Accounts */}
            <div className="space-y-4">
              {(form.paymentAccounts || []).map((pay) => (
                <div
                  key={pay.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    pay.enabled
                      ? pay.method === 'bkash' ? 'bg-pink-50/40 border-pink-200' :
                        pay.method === 'nagad' ? 'bg-amber-50/40 border-amber-200' :
                        pay.method === 'rocket' ? 'bg-purple-50/40 border-purple-200' :
                        'bg-blue-50/40 border-blue-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        pay.method === 'bkash' ? 'bg-pink-600 text-white' :
                        pay.method === 'nagad' ? 'bg-amber-600 text-white' :
                        pay.method === 'rocket' ? 'bg-purple-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {pay.method === 'bkash' ? 'bK' :
                         pay.method === 'nagad' ? 'নগদ' :
                         pay.method === 'rocket' ? 'রকেট' : 'Bank'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{pay.methodName}</span>
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                            {pay.accountNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {pay.accountType}
                          </span>
                          {pay.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                              ডিফল্ট
                            </span>
                          )}
                        </div>
                        {pay.accountHolderName && (
                          <span className="text-xs text-slate-600 block mt-0.5">
                            অ্যাকাউন্ট হোল্ডার: <strong>{pay.accountHolderName}</strong>
                          </span>
                        )}
                        {pay.bankName && (
                          <span className="text-[11px] text-slate-500 block">
                            ব্যাংক: {pay.bankName} {pay.branchName && `(${pay.branchName})`} {pay.routingNumber && `| রাউটিং: ${pay.routingNumber}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleTogglePayment(pay.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          pay.enabled
                            ? 'bg-slate-200/70 hover:bg-slate-300 text-slate-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {pay.enabled ? 'বন্ধ রাখুন' : 'সক্রিয় করুন'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingPayment({ isOpen: true, isNew: false, data: { ...pay } })}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePayment(pay.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Instructions Preview */}
                  {pay.instruction && (
                    <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                      <span className="font-bold text-slate-700">কাস্টমারের জন্য নির্দেশনা: </span>
                      <span>{pay.instruction}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('পেমেন্ট অ্যাকাউন্টসমূহ সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>পেমেন্ট সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: DELIVERY CHARGES ==================== */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    ডেলিভারি চার্জ ও জোন কনফিগারেশন
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  সন্দ্বীপের স্থানীয় ফ্রি/পেইড ডেলিভারি ও অন্যান্য এলাকার চার্জ নির্ধারণ করুন
                </p>
              </div>

              <button
                type="button"
                onClick={openAddZone}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Delivery Zone</span>
              </button>
            </div>

            {/* Quick Primary Delivery Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                <label className="block text-xs font-bold text-emerald-950">
                  সন্দ্বীপের ভিতরে ডেলিভারি চার্জ (৳)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={form.deliveryInsideSandwip ?? 0}
                    onChange={(e) => setForm({ ...form, deliveryInsideSandwip: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  {form.deliveryInsideSandwip === 0 ? '✓ ফ্রি হোম ডেলিভারি সক্রিয়' : `৳${form.deliveryInsideSandwip} চার্জ ধার্য`}
                </span>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                <label className="block text-xs font-bold text-blue-950">
                  সন্দ্বীপের বাইরে সমগ্র বাংলাদেশ (৳)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={form.deliveryOutsideSandwip ?? 130}
                    onChange={(e) => setForm({ ...form, deliveryOutsideSandwip: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <span className="text-[11px] font-semibold text-blue-700 block">
                  কুরিয়ার সার্ভিস স্ট্যান্ডার্ড চার্জ
                </span>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                <label className="block text-xs font-bold text-amber-950">
                  ফ্রি ডেলিভারি মিনিমাম অর্ডার (৳)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={form.freeDeliveryThreshold ?? 2000}
                    onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <span className="text-[11px] font-semibold text-amber-700 block">
                  এই মূল্যের অর্ডারে ডেলিভারি ফ্রি হবে
                </span>
              </div>
            </div>

            {/* Custom Delivery Zones List & Upazila Controls */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>উপজেলা অনুযায়ী ডেলিভারি চার্জ ও ফ্রি নিয়ন্ত্রণ</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    সন্দ্বীপের ভিতরে ফ্রি (৳০), সন্দ্বীপের বাহিরে ১৩০ টাকা। যেকোনো উপজেলায় নাম সিলেক্ট করে 'ফ্রি' বা কম চার্জ নির্ধারণ করুন:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddZone}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন উপজেলা / এলাকা যুক্ত করুন</span>
                </button>
              </div>

              {/* Informative Guidance Note */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong>এডমিন কন্ট্রোল:</strong> আপনি যেকোনো উপজেলার জন্য চার্জ পরিবর্তন করতে পারবেন। নিচে প্রতিটি এলাকার নামের পাশে সরাসরি 
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded mx-1">ফ্রি (৳০)</span> 
                  বাটন চেপে চার্জ ফ্রি করে দিতে পারেন অথবা কাস্টম এমাউন্ট সেট করতে পারেন।
                </div>
              </div>

              <div className="space-y-2.5">
                {(form.deliveryZones || []).map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-3.5 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                      zone.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        zone.charge === 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{zone.name}</span>
                          {zone.isInsideSandwip && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              সন্দ্বীপ
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                            zone.charge === 0 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-indigo-100 text-indigo-900'
                          }`}>
                            {zone.charge === 0 ? '✓ ফ্রি ডেলিভারি (৳০)' : `চার্জ: ৳${zone.charge}`}
                          </span>
                        </div>
                        {zone.estimatedTime && (
                          <span className="text-xs text-slate-500 block mt-0.5">
                            ডেলিভারি সময়সীমা: {zone.estimatedTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
                      {/* 1-Click Quick Price Adjuster */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        {zone.charge !== 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (form.deliveryZones || []).map(z => 
                                z.id === zone.id ? { ...z, charge: 0 } : z
                              );
                              setForm({ ...form, deliveryZones: updated });
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition-colors cursor-pointer"
                            title="১-ক্লিকে ফ্রি করে দিন"
                          >
                            ✓ ফ্রি (৳০) করুন
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (form.deliveryZones || []).map(z => 
                                z.id === zone.id ? { ...z, charge: 130 } : z
                              );
                              setForm({ ...form, deliveryZones: updated });
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] transition-colors cursor-pointer"
                            title="চার্জ ১৩০ টাকা করুন"
                          >
                            চার্জ ৳১৩০
                          </button>
                        )}

                        {[50, 70, 100].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              const updated = (form.deliveryZones || []).map(z => 
                                z.id === zone.id ? { ...z, charge: amt } : z
                              );
                              setForm({ ...form, deliveryZones: updated });
                            }}
                            className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              zone.charge === amt
                                ? 'bg-indigo-600 text-white'
                                : 'hover:bg-slate-200 text-slate-700'
                            }`}
                            title={`চার্জ ৳${amt} করুন`}
                          >
                            ৳{amt}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleZone(zone.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          zone.enabled
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {zone.enabled ? 'বন্ধ' : 'সক্রিয়'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingZone({ isOpen: true, isNew: false, data: { ...zone } })}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="সম্পাদনা"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSave('ডেলিভারি চার্জ ও জোন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ডেলিভারি সেটিংস সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS & EDITORS ==================== */}

      {/* 0. EDIT / ADD STORE ADDRESS MODAL */}
      {editingAddress && editingAddress.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>{editingAddress.isNew ? 'নতুন শাখা বা ঠিকানা যোগ করুন' : 'দোকানের ঠিকানা সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  শাখা / টাইটেল <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingAddress.data.title}
                  onChange={(e) => setEditingAddress({
                    ...editingAddress,
                    data: { ...editingAddress.data, title: e.target.value }
                  })}
                  placeholder="যেমন: প্রধান কার্যালয় ও হাব (সন্দ্বীপ)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্ণ ঠিকানা ও পোস্টকোড <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingAddress.data.address}
                  onChange={(e) => setEditingAddress({
                    ...editingAddress,
                    data: { ...editingAddress.data, address: e.target.value }
                  })}
                  placeholder="পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম, বাংলাদেশ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={editingAddress.data.phone || ''}
                    onChange={(e) => setEditingAddress({
                      ...editingAddress,
                      data: { ...editingAddress.data, phone: e.target.value }
                    })}
                    placeholder="01867841638"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিশেষ নোট</label>
                  <input
                    type="text"
                    value={editingAddress.data.notes || ''}
                    onChange={(e) => setEditingAddress({
                      ...editingAddress,
                      data: { ...editingAddress.data, notes: e.target.value }
                    })}
                    placeholder="যেমন: মূল ডেলিভারি সেন্টার"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAddress.data.isPrimary || false}
                    onChange={(e) => setEditingAddress({
                      ...editingAddress,
                      data: { ...editingAddress.data, isPrimary: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    প্রধান কার্যালয় (Primary Address) হিসেবে নির্ধারণ করুন
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSaveAddress(editingAddress.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. EDIT / ADD PHONE MODAL */}
      {editingPhone && editingPhone.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{editingPhone.isNew ? 'নতুন ফোন নম্বর যোগ করুন' : 'ফোন নম্বর সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingPhone(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingPhone.data.number}
                  onChange={(e) => setEditingPhone({
                    ...editingPhone,
                    data: { ...editingPhone.data, number: e.target.value }
                  })}
                  placeholder="01867841638"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  লেবেল / টাইটেল
                </label>
                <input
                  type="text"
                  value={editingPhone.data.label}
                  onChange={(e) => setEditingPhone({
                    ...editingPhone,
                    data: { ...editingPhone.data, label: e.target.value }
                  })}
                  placeholder="যেমন: প্রধান কাস্টমার কেয়ার, সন্দ্বীপ শাখা"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ধরন (Type)</label>
                  <select
                    value={editingPhone.data.type}
                    onChange={(e) => setEditingPhone({
                      ...editingPhone,
                      data: { ...editingPhone.data, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="primary">Primary (প্রধান)</option>
                    <option value="secondary">Secondary (অতিরিক্ত)</option>
                    <option value="whatsapp">WhatsApp (হোয়াটসঅ্যাপ)</option>
                    <option value="support">Support (সাপোর্ট)</option>
                    <option value="other">Other (অন্যান্য)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল সময় / নোট</label>
                  <input
                    type="text"
                    value={editingPhone.data.notes || ''}
                    onChange={(e) => setEditingPhone({
                      ...editingPhone,
                      data: { ...editingPhone.data, notes: e.target.value }
                    })}
                    placeholder="সকাল ৯টা - রাত ১১টা"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPhone.data.isPrimary || false}
                    onChange={(e) => setEditingPhone({
                      ...editingPhone,
                      data: { ...editingPhone.data, isPrimary: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    প্রধান হটলাইন (Primary Phone) হিসেবে নির্ধারণ করুন
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPhone(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSavePhone(editingPhone.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT / ADD EMAIL MODAL */}
      {editingEmail && editingEmail.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>{editingEmail.isNew ? 'নতুন ইমেইল যোগ করুন' : 'ইমেইল সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingEmail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল অ্যাড্রেস <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editingEmail.data.email}
                  onChange={(e) => setEditingEmail({
                    ...editingEmail,
                    data: { ...editingEmail.data, email: e.target.value }
                  })}
                  placeholder="support@jihanstore.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  লেবেল / টাইটেল
                </label>
                <input
                  type="text"
                  value={editingEmail.data.label}
                  onChange={(e) => setEditingEmail({
                    ...editingEmail,
                    data: { ...editingEmail.data, label: e.target.value }
                  })}
                  placeholder="যেমন: অফিসিয়াল কাস্টমার সাপোর্ট, সেলস টিম"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEmail.data.isPrimary || false}
                    onChange={(e) => setEditingEmail({
                      ...editingEmail,
                      data: { ...editingEmail.data, isPrimary: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    প্রধান ইমেইল (Primary Email) হিসেবে নির্ধারণ করুন
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingEmail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSaveEmail(editingEmail.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT / ADD SOCIAL LINK MODAL */}
      {editingSocial && editingSocial.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>{editingSocial.isNew ? 'নতুন সোশ্যাল মিডিয়া যোগ করুন' : 'সোশ্যাল মিডিয়া সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingSocial(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্ল্যাটফর্ম নির্বাচন করুন</label>
                <select
                  value={editingSocial.data.platform}
                  onChange={(e) => {
                    const plat = e.target.value as any;
                    const defaultNames: Record<string, string> = {
                      facebook: 'Facebook Page',
                      instagram: 'Instagram Profile',
                      tiktok: 'TikTok Account',
                      youtube: 'YouTube Channel',
                      telegram: 'Telegram Channel',
                      whatsapp: 'WhatsApp Community',
                      website: 'Official Website',
                      other: 'Custom Platform'
                    };
                    setEditingSocial({
                      ...editingSocial,
                      data: {
                        ...editingSocial.data,
                        platform: plat,
                        platformName: defaultNames[plat] || editingSocial.data.platformName
                      }
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp Community</option>
                  <option value="website">Website</option>
                  <option value="other">Custom (অন্যান্য)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্ল্যাটফর্মের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSocial.data.platformName}
                  onChange={(e) => setEditingSocial({
                    ...editingSocial,
                    data: { ...editingSocial.data, platformName: e.target.value }
                  })}
                  placeholder="যেমন: Facebook Page"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউআরএল (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={editingSocial.data.url}
                  onChange={(e) => setEditingSocial({
                    ...editingSocial,
                    data: { ...editingSocial.data, url: e.target.value }
                  })}
                  placeholder="https://facebook.com/jihanstore009"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSocial.data.enabled}
                    onChange={(e) => setEditingSocial({
                      ...editingSocial,
                      data: { ...editingSocial.data, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    ওয়েবসাইটে লিঙ্কটি দৃশ্যমান (Enable) রাখুন
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSocial(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSaveSocial(editingSocial.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EDIT / ADD PAYMENT ACCOUNT MODAL */}
      {editingPayment && editingPayment.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-600" />
                <span>{editingPayment.isNew ? 'নতুন পেমেন্ট অ্যাকাউন্ট যোগ করুন' : 'পেমেন্ট অ্যাকাউন্ট সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={editingPayment.data.method}
                    onChange={(e) => {
                      const m = e.target.value as any;
                      const names: Record<string, string> = {
                        bkash: 'বিকাশ (bKash)',
                        nagad: 'নগদ (Nagad)',
                        rocket: 'রকেট (Rocket)',
                        bank: 'ব্যাংক ট্রান্সফার (Bank Account)',
                        other: 'অন্যান্য পেমেন্ট মেথড'
                      };
                      setEditingPayment({
                        ...editingPayment,
                        data: {
                          ...editingPayment.data,
                          method: m,
                          methodName: names[m] || editingPayment.data.methodName
                        }
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="bank">ব্যাংক অ্যাকাউন্ট</option>
                    <option value="other">অন্যান্য (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পদ্ধতির প্রদর্শিত নাম</label>
                  <input
                    type="text"
                    value={editingPayment.data.methodName}
                    onChange={(e) => setEditingPayment({
                      ...editingPayment,
                      data: { ...editingPayment.data, methodName: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    অ্যাকাউন্ট / মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPayment.data.accountNumber}
                    onChange={(e) => setEditingPayment({
                      ...editingPayment,
                      data: { ...editingPayment.data, accountNumber: e.target.value }
                    })}
                    placeholder="01867841638"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট টাইপ</label>
                  <input
                    type="text"
                    value={editingPayment.data.accountType}
                    onChange={(e) => setEditingPayment({
                      ...editingPayment,
                      data: { ...editingPayment.data, accountType: e.target.value }
                    })}
                    placeholder="Personal / Merchant / Agent"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট হোল্ডারের নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={editingPayment.data.accountHolderName || ''}
                  onChange={(e) => setEditingPayment({
                    ...editingPayment,
                    data: { ...editingPayment.data, accountHolderName: e.target.value }
                  })}
                  placeholder="JIHAN STORE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* If bank method selected */}
              {editingPayment.data.method === 'bank' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ব্যাংকের নাম</label>
                      <input
                        type="text"
                        value={editingPayment.data.bankName || ''}
                        onChange={(e) => setEditingPayment({
                          ...editingPayment,
                          data: { ...editingPayment.data, bankName: e.target.value }
                        })}
                        placeholder="Islami Bank Bangladesh PLC"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">শাখার নাম (Branch)</label>
                      <input
                        type="text"
                        value={editingPayment.data.branchName || ''}
                        onChange={(e) => setEditingPayment({
                          ...editingPayment,
                          data: { ...editingPayment.data, branchName: e.target.value }
                        })}
                        placeholder="Sandwip Branch"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রাউটিং নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editingPayment.data.routingNumber || ''}
                      onChange={(e) => setEditingPayment({
                        ...editingPayment,
                        data: { ...editingPayment.data, routingNumber: e.target.value }
                      })}
                      placeholder="125150890"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">গ্রাহকের জন্য পেমেন্ট নির্দেশনা</label>
                <textarea
                  rows={2}
                  value={editingPayment.data.instruction || ''}
                  onChange={(e) => setEditingPayment({
                    ...editingPayment,
                    data: { ...editingPayment.data, instruction: e.target.value }
                  })}
                  placeholder="যেমন: সেন্ড মানি করে TrxID দিন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPayment.data.enabled}
                    onChange={(e) => setEditingPayment({
                      ...editingPayment,
                      data: { ...editingPayment.data, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-bold text-slate-800">পেমেন্ট মেথডটি সক্রিয় রাখুন</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPayment(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSavePayment(editingPayment.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. EDIT / ADD DELIVERY ZONE MODAL */}
      {editingZone && editingZone.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>{editingZone.isNew ? 'নতুন ডেলিভারি জোন যোগ করুন' : 'ডেলিভারি জোন সম্পাদনা করুন'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপজেলা বা জোনের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingZone.data.name}
                  onChange={(e) => setEditingZone({
                    ...editingZone,
                    data: { ...editingZone.data, name: e.target.value }
                  })}
                  placeholder="যেমন: সীতাকুণ্ড উপজেলা অথবা চট্টগ্রাম সদর"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                />

                {/* Quick Upazila Presets Selection */}
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    কুইক উপজেলা সিলেক্ট করুন:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {[
                      'সন্দ্বীপ উপজেলা',
                      'চট্টগ্রাম সদর',
                      'সীতাকুণ্ড উপজেলা',
                      'মীরসরাই উপজেলা',
                      'ফটিকছড়ি উপজেলা',
                      'হাটহাজারী উপজেলা',
                      'রাউজান উপজেলা',
                      'রাঙ্গুনিয়া উপজেলা',
                      'পটিয়া উপজেলা',
                      'বোয়ালখালী উপজেলা',
                      'আনোয়ারা উপজেলা',
                      'চন্দনাইশ উপজেলা',
                      'বাঁশখালী উপজেলা',
                      'সাতকানিয়া উপজেলা',
                      'লোহাগাড়া উপজেলা',
                      'কক্সবাজার সদর',
                      'ঢাকা সিটি'
                    ].map((upazila) => (
                      <button
                        key={upazila}
                        type="button"
                        onClick={() => {
                          const isSandwip = upazila.includes('সন্দ্বীপ');
                          setEditingZone({
                            ...editingZone,
                            data: {
                              ...editingZone.data,
                              name: upazila,
                              isInsideSandwip: isSandwip,
                              charge: isSandwip ? 0 : editingZone.data.charge
                            }
                          });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                          editingZone.data.name === upazila
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {upazila}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ডেলিভারি চার্জ (৳) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700">
                    {editingZone.data.charge === 0 ? '✓ ফ্রি ডেলিভারি (৳০)' : `চার্জ: ৳${editingZone.data.charge}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingZone.data.charge}
                    onChange={(e) => setEditingZone({
                      ...editingZone,
                      data: { ...editingZone.data, charge: Number(e.target.value) }
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-900"
                  />

                  <input
                    type="text"
                    value={editingZone.data.estimatedTime || ''}
                    onChange={(e) => setEditingZone({
                      ...editingZone,
                      data: { ...editingZone.data, estimatedTime: e.target.value }
                    })}
                    placeholder="সময় (যেমন: ২৪-৪৮ ঘণ্টা)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                {/* 1-Click Quick Charge Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setEditingZone({
                      ...editingZone,
                      data: { ...editingZone.data, charge: 0 }
                    })}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-[11px] border border-emerald-300 transition-colors"
                  >
                    ✓ ফ্রি ডেলিভারি (৳০)
                  </button>
                  {[50, 80, 100, 130].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setEditingZone({
                        ...editingZone,
                        data: { ...editingZone.data, charge: amt }
                      })}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        editingZone.data.charge === amt
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingZone.data.isInsideSandwip || false}
                    onChange={(e) => setEditingZone({
                      ...editingZone,
                      data: { ...editingZone.data, isInsideSandwip: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    এটি সন্দ্বীপের অভ্যন্তরীণ জোন (Sandwip Local)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingZone.data.enabled}
                    onChange={(e) => setEditingZone({
                      ...editingZone,
                      data: { ...editingZone.data, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    জোনটি সক্রিয় (Enable) রাখুন
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSaveZone(editingZone.data)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
