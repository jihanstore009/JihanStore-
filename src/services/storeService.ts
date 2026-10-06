import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment
} from '../firebase/config';
import {
  Product,
  Category,
  Order,
  Review,
  Banner,
  StoreSettings,
  ChatMessage,
  Conversation,
  OrderStatus,
  Advertisement,
  AdPosition
} from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  name: 'Jihan Store – জিহান স্টোর',
  tagline: 'বিশ্বাসের সাথে অনলাইন শপিং',
  businessName: 'Jihan Store – জিহান স্টোর',
  address: 'Postcode 4301, Sandwip, Chittagong, Bangladesh',
  phone: '01867841638',
  whatsapp: '8801867841638',
  email: 'jihanstore009@gmail.com',
  logoUrl: '',
  deliveryInsideSandwip: 0,
  deliveryOutsideSandwip: 130,
  freeDeliveryThreshold: 2000,
  bkashNumber: '01867841638',
  bkashType: 'Personal',
  bkashInstruction: 'বিকাশ অ্যাপ অথবা *247# ডায়াল করে Send Money করুন। রেফারেন্সে আপনার মোবাইল নম্বর দিন এবং ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।',
  nagadNumber: '01867841638',
  nagadType: 'Personal',
  nagadInstruction: 'নগদ অ্যাপ অথবা *167# ডায়াল করে Send Money করুন। সফল লেনদেনের পর TrxID এবং প্রয়োজনে স্ক্রিনশট দিন।',
  socialFacebook: 'https://www.facebook.com/jihanstore009',
  socialInstagram: 'https://www.instagram.com/jihan.store009',
  socialTiktok: 'https://www.tiktok.com/@jihanstore009',
  socialTelegram: 'https://t.me/jihanstorebd009',
  socialWhatsapp: 'https://wa.me/8801867841638',
  additionalContacts: [
    { id: '1', type: 'phone', label: 'কল হটলাইন (Call)', value: '01867841638' },
    { id: '2', type: 'whatsapp', label: 'হোয়াটসঅ্যাপ চ্যাট', value: '8801867841638' },
    { id: '3', type: 'email', label: 'অফিসিয়াল ইমেইল ১', value: 'jihanstore009@gmail.com' },
    { id: '4', type: 'email', label: 'অফিসিয়াল ইমেইল ২', value: 'jihanstoreofficial009@gmail.com' },
    { id: '5', type: 'address', label: 'ঠিকানা ও পোস্টকোড', value: 'পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম, বাংলাদেশ' }
  ],
  addresses: [
    {
      id: 'addr-1',
      title: 'প্রধান শাখা ও ডেলিভারি হাব (Head Office & Hub)',
      address: 'Postcode 4301, Sandwip, Chittagong, Bangladesh (পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম, বাংলাদেশ)',
      phone: '01867841638',
      isPrimary: true,
      notes: 'হেড অফিস ও মূল ডেলিভারি সেন্টার'
    }
  ],
  phoneNumbers: [
    { id: 'phone-1', number: '01867841638', label: 'কল নম্বর (Call Helpline)', type: 'primary', isPrimary: true, notes: 'সকাল ৯টা - রাত ১১টা' },
    { id: 'phone-2', number: '8801867841638', label: 'হোয়াটসঅ্যাপ হেল্পলাইন (WhatsApp)', type: 'whatsapp', isPrimary: false, notes: 'https://wa.me/8801867841638' }
  ],
  emailAddresses: [
    { id: 'email-1', email: 'jihanstore009@gmail.com', label: 'প্রধান ইমেইল (Primary)', isPrimary: true },
    { id: 'email-2', email: 'jihanstoreofficial009@gmail.com', label: 'অফিসিয়াল ইমেইল (Official)', isPrimary: false }
  ],
  socialLinks: [
    { id: 'soc-1', platform: 'facebook', platformName: 'ফেসবুক পেজ', platformNameEn: 'Facebook Page', url: 'https://www.facebook.com/jihanstore009', enabled: true, language: 'both' },
    { id: 'soc-2', platform: 'instagram', platformName: 'ইনস্টাগ্রাম', platformNameEn: 'Instagram Profile', url: 'https://www.instagram.com/jihan.store009', enabled: true, language: 'both' },
    { id: 'soc-3', platform: 'tiktok', platformName: 'টিকটক', platformNameEn: 'TikTok Account', url: 'https://www.tiktok.com/@jihanstore009', enabled: true, language: 'both' },
    { id: 'soc-4', platform: 'telegram', platformName: 'টেলিগ্রাম চ্যানেল', platformNameEn: 'Telegram Channel', url: 'https://t.me/jihanstorebd009', enabled: true, language: 'both' },
    { id: 'soc-5', platform: 'whatsapp', platformName: 'হোয়াটসঅ্যাপ কমিউনিটি', platformNameEn: 'WhatsApp Community', url: 'https://wa.me/8801867841638', enabled: true, language: 'both' }
  ],
  paymentAccounts: [
    {
      id: 'pay-1',
      method: 'bkash',
      methodName: 'বিকাশ (bKash)',
      accountNumber: '01867841638',
      accountType: 'Personal',
      accountHolderName: 'JIHAN STORE',
      instruction: 'বিকাশ অ্যাপ অথবা *247# ডায়াল করে Send Money করুন। রেফারেন্সে আপনার মোবাইল নম্বর দিন এবং ট্রানজেকশন আইডি (TrxID) নিচে প্রদান করুন।',
      enabled: true,
      isDefault: true
    },
    {
      id: 'pay-2',
      method: 'nagad',
      methodName: 'নগদ (Nagad)',
      accountNumber: '01867841638',
      accountType: 'Personal',
      accountHolderName: 'JIHAN STORE',
      instruction: 'নগদ অ্যাপ অথবা *167# ডায়াল করে Send Money করুন। সফল লেনদেনের পর TrxID এবং প্রয়োজনে স্ক্রিনশট দিন।',
      enabled: true,
      isDefault: false
    }
  ],
  deliveryZones: [
    { id: 'zone-1', name: 'সন্দ্বীপ উপজেলা (Sandwip - পোস্টকোড ৪৩০১)', charge: 0, estimatedTime: '২৪-৪৮ ঘণ্টা', enabled: true, isInsideSandwip: true },
    { id: 'zone-2', name: 'সন্দ্বীপের বাইরে সমগ্র বাংলাদেশ', charge: 130, estimatedTime: '২-৪ কার্যদিবস', enabled: true, isInsideSandwip: false },
    { id: 'zone-3', name: 'সীতাকুণ্ড উপজেলা (Sitakunda)', charge: 70, estimatedTime: '২-৩ কার্যদিবস', enabled: true, isInsideSandwip: false },
    { id: 'zone-4', name: 'চট্টগ্রাম সদর (Chittagong Sadar)', charge: 100, estimatedTime: '২-৩ কার্যদিবস', enabled: true, isInsideSandwip: false }
  ],
  brandColors: {
    primary: '#1e3a8a',
    secondary: '#d97706',
    accent: '#2563eb'
  }
};

/**
 * Normalizes StoreSettings ensuring both backward-compatible scalar fields
 * and new rich structured arrays (phones, emails, socials, payments, delivery zones)
 * are always consistently populated.
 */
export function normalizeSettings(data?: Partial<StoreSettings> | null): StoreSettings {
  const base: StoreSettings = { ...DEFAULT_SETTINGS, ...(data || {}) };

  // Guaranteed contact details fallback
  if (!base.address || base.address.length < 5) {
    base.address = 'Postcode 4301, Sandwip, Chittagong, Bangladesh';
  }
  if (!base.phone) base.phone = '01867841638';
  if (!base.whatsapp) base.whatsapp = '8801867841638';
  if (!base.email) base.email = 'jihanstore009@gmail.com';

  // 0. Addresses migration/normalization
  if (!base.addresses || !Array.isArray(base.addresses) || base.addresses.length === 0) {
    base.addresses = [
      {
        id: 'addr-1',
        title: 'প্রধান কার্যালয় ও হাব (Head Office & Hub)',
        address: base.address || 'Postcode 4301, Sandwip, Chittagong, Bangladesh (পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম, বাংলাদেশ)',
        phone: base.phone || '01867841638',
        isPrimary: true,
        notes: 'হেড অফিস ও মূল ডেলিভারি সেন্টার'
      }
    ];
  }

  // 1. Phone numbers migration/normalization
  if (!base.phoneNumbers || !Array.isArray(base.phoneNumbers) || base.phoneNumbers.length === 0) {
    base.phoneNumbers = [
      { id: 'phone-1', number: '01867841638', label: 'কল হটলাইন', type: 'primary', isPrimary: true, notes: 'সকাল ৯টা - রাত ১১টা' },
      { id: 'phone-2', number: '8801867841638', label: 'হোয়াটসঅ্যাপ হেল্পলাইন', type: 'whatsapp', isPrimary: false, notes: 'https://wa.me/8801867841638' }
    ];
  }

  // 2. Email addresses migration/normalization
  if (!base.emailAddresses || !Array.isArray(base.emailAddresses) || base.emailAddresses.length === 0) {
    base.emailAddresses = [
      { id: 'email-1', email: 'jihanstore009@gmail.com', label: 'প্রধান সাপোর্ট ইমেইল', isPrimary: true },
      { id: 'email-2', email: 'jihanstoreofficial009@gmail.com', label: 'অফিসিয়াল ব্যবসায়িক ইমেইল', isPrimary: false }
    ];
  } else if (!base.emailAddresses.some(e => e.email.includes('jihanstoreofficial009@gmail.com'))) {
    base.emailAddresses.push({
      id: 'email-2',
      email: 'jihanstoreofficial009@gmail.com',
      label: 'অফিসিয়াল ব্যবসায়িক ইমেইল',
      isPrimary: false
    });
  }

  // 3. Social links migration/normalization
  if (!base.socialLinks || !Array.isArray(base.socialLinks) || base.socialLinks.length === 0) {
    base.socialLinks = [
      { id: 'soc-1', platform: 'facebook', platformName: 'ফেসবুক পেজ', platformNameEn: 'Facebook Page', url: 'https://www.facebook.com/jihanstore009', enabled: true, language: 'both' },
      { id: 'soc-2', platform: 'instagram', platformName: 'ইনস্টাগ্রাম', platformNameEn: 'Instagram Profile', url: 'https://www.instagram.com/jihan.store009', enabled: true, language: 'both' },
      { id: 'soc-3', platform: 'tiktok', platformName: 'টিকটক', platformNameEn: 'TikTok Account', url: 'https://www.tiktok.com/@jihanstore009', enabled: true, language: 'both' },
      { id: 'soc-4', platform: 'telegram', platformName: 'টেলিগ্রাম চ্যানেল', platformNameEn: 'Telegram Channel', url: 'https://t.me/jihanstorebd009', enabled: true, language: 'both' },
      { id: 'soc-5', platform: 'whatsapp', platformName: 'হোয়াটসঅ্যাপ কমিউনিটি', platformNameEn: 'WhatsApp Community', url: 'https://wa.me/8801867841638', enabled: true, language: 'both' }
    ];
  } else {
    // Populate multilingual names if absent
    base.socialLinks = base.socialLinks.map(s => {
      const bnNames: Record<string, string> = {
        facebook: 'ফেসবুক পেজ',
        instagram: 'ইনস্টাগ্রাম',
        tiktok: 'টিকটক',
        telegram: 'টেলিগ্রাম চ্যানেল',
        whatsapp: 'হোয়াটসঅ্যাপ কমিউনিটি',
        youtube: 'ইউটিউব চ্যানেল',
        website: 'অফিসিয়াল ওয়েবসাইট'
      };
      const enNames: Record<string, string> = {
        facebook: 'Facebook Page',
        instagram: 'Instagram Profile',
        tiktok: 'TikTok Account',
        telegram: 'Telegram Channel',
        whatsapp: 'WhatsApp Community',
        youtube: 'YouTube Channel',
        website: 'Official Website'
      };
      return {
        ...s,
        platformName: s.platformName || bnNames[s.platform] || s.platform,
        platformNameEn: s.platformNameEn || enNames[s.platform] || s.platform,
        language: s.language || 'both'
      };
    });

    // Update links to latest active links
    const tele = base.socialLinks.find(s => s.platform === 'telegram');
    if (tele) {
      tele.url = 'https://t.me/jihanstorebd009';
      base.socialTelegram = 'https://t.me/jihanstorebd009';
    }
    const tt = base.socialLinks.find(s => s.platform === 'tiktok');
    if (tt && (!tt.url || tt.url.includes('example'))) {
      tt.url = 'https://www.tiktok.com/@jihanstore009';
      base.socialTiktok = 'https://www.tiktok.com/@jihanstore009';
    }
    const fb = base.socialLinks.find(s => s.platform === 'facebook');
    if (fb && (!fb.url || fb.url.includes('example'))) {
      fb.url = 'https://www.facebook.com/jihanstore009';
      base.socialFacebook = 'https://www.facebook.com/jihanstore009';
    }
    const ig = base.socialLinks.find(s => s.platform === 'instagram');
    if (ig && (!ig.url || ig.url.includes('example'))) {
      ig.url = 'https://www.instagram.com/jihan.store009';
      base.socialInstagram = 'https://www.instagram.com/jihan.store009';
    }
  }

  // 4. Payment accounts migration/normalization
  if (!base.paymentAccounts || !Array.isArray(base.paymentAccounts) || base.paymentAccounts.length === 0) {
    base.paymentAccounts = [
      {
        id: 'pay-1',
        method: 'bkash',
        methodName: 'বিকাশ (bKash)',
        accountNumber: base.bkashNumber || '01867841638',
        accountType: base.bkashType || 'Personal',
        accountHolderName: 'JIHAN STORE',
        instruction: base.bkashInstruction || 'বিকাশ অ্যাপ অথবা *247# ডায়াল করে Send Money করুন।',
        enabled: true,
        isDefault: true
      },
      {
        id: 'pay-2',
        method: 'nagad',
        methodName: 'নগদ (Nagad)',
        accountNumber: base.nagadNumber || '01867841638',
        accountType: base.nagadType || 'Personal',
        accountHolderName: 'JIHAN STORE',
        instruction: base.nagadInstruction || 'নগদ অ্যাপ অথবা *167# ডায়াল করে Send Money করুন।',
        enabled: true,
        isDefault: false
      }
    ];
  }

  // 5. Delivery zones migration/normalization
  if (!base.deliveryZones || !Array.isArray(base.deliveryZones) || base.deliveryZones.length === 0) {
    base.deliveryZones = [
      { id: 'zone-1', name: 'সন্দ্বীপের ভিতরে (Sandwip Local)', charge: Number(base.deliveryInsideSandwip ?? 0), estimatedTime: '২৪-৪৮ ঘণ্টা', enabled: true, isInsideSandwip: true },
      { id: 'zone-2', name: 'সন্দ্বীপের বাইরে সমগ্র বাংলাদেশ', charge: Number(base.deliveryOutsideSandwip ?? 130), estimatedTime: '২-৪ কার্যদিবস', enabled: true, isInsideSandwip: false }
    ];
  }

  // 6. Brand colors
  if (!base.brandColors) {
    base.brandColors = {
      primary: '#1e3a8a',
      secondary: '#d97706',
      accent: '#2563eb'
    };
  }

  // Sync primary scalars back to ensure 100% backward compatibility
  const primaryPhone = base.phoneNumbers.find(p => p.isPrimary) || base.phoneNumbers[0];
  if (primaryPhone) base.phone = primaryPhone.number;

  const waPhone = base.phoneNumbers.find(p => p.type === 'whatsapp' || p.label.toLowerCase().includes('whatsapp'));
  if (waPhone) base.whatsapp = waPhone.number;

  const primaryEmail = base.emailAddresses.find(e => e.isPrimary) || base.emailAddresses[0];
  if (primaryEmail) base.email = primaryEmail.email;

  const bkashAcc = base.paymentAccounts.find(p => p.method === 'bkash' && p.enabled) || base.paymentAccounts.find(p => p.method === 'bkash');
  if (bkashAcc) {
    base.bkashNumber = bkashAcc.accountNumber;
    base.bkashType = (bkashAcc.accountType as any) || 'Personal';
    if (bkashAcc.instruction) base.bkashInstruction = bkashAcc.instruction;
  }

  const nagadAcc = base.paymentAccounts.find(p => p.method === 'nagad' && p.enabled) || base.paymentAccounts.find(p => p.method === 'nagad');
  if (nagadAcc) {
    base.nagadNumber = nagadAcc.accountNumber;
    base.nagadType = (nagadAcc.accountType as any) || 'Personal';
    if (nagadAcc.instruction) base.nagadInstruction = nagadAcc.instruction;
  }

  const insideZone = base.deliveryZones.find(z => z.isInsideSandwip || z.name.includes('সন্দ্বীপের ভিতরে'));
  if (insideZone) base.deliveryInsideSandwip = insideZone.charge;

  const outsideZone = base.deliveryZones.find(z => !z.isInsideSandwip || z.name.includes('বাইরে'));
  if (outsideZone) base.deliveryOutsideSandwip = outsideZone.charge;

  // Social links sync
  const fb = base.socialLinks.find(s => s.platform === 'facebook');
  if (fb && fb.enabled) base.socialFacebook = fb.url;
  const ig = base.socialLinks.find(s => s.platform === 'instagram');
  if (ig && ig.enabled) base.socialInstagram = ig.url;
  const tt = base.socialLinks.find(s => s.platform === 'tiktok');
  if (tt && tt.enabled) base.socialTiktok = tt.url;
  const tg = base.socialLinks.find(s => s.platform === 'telegram');
  if (tg && tg.enabled) base.socialTelegram = tg.url;
  const waSoc = base.socialLinks.find(s => s.platform === 'whatsapp');
  if (waSoc && waSoc.enabled) base.socialWhatsapp = waSoc.url;

  return base;
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Smart Watch', slug: 'smart-watch', icon: 'Watch', itemCount: 12 },
  { id: 'cat-2', name: 'Earbuds & Audio', slug: 'earbuds', icon: 'Headphones', itemCount: 18 },
  { id: 'cat-3', name: 'Mobile Accessories', slug: 'mobile-accessories', icon: 'Smartphone', itemCount: 24 },
  { id: 'cat-4', name: 'Electronics & Gadgets', slug: 'gadgets', icon: 'Zap', itemCount: 16 },
  { id: 'cat-5', name: 'Bags & Backpacks', slug: 'bags', icon: 'Briefcase', itemCount: 9 },
  { id: 'cat-6', name: 'Water Bottles & Flasks', slug: 'water-bottles', icon: 'Coffee', itemCount: 7 },
  { id: 'cat-7', name: 'Home & Decor', slug: 'home-decor', icon: 'Home', itemCount: 14 },
  { id: 'cat-8', name: 'Fashion & Lifestyle', slug: 'fashion', icon: 'Shirt', itemCount: 15 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'T900 Ultra 2 Big Display Bluetooth Calling Smartwatch',
    category: 'Smart Watch',
    price: 1250,
    previousPrice: 1750,
    discount: 28,
    stock: 25,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'প্রিমিয়াম ২.০৯ ইঞ্চি ফুল টাচ এইচডি ডিসপ্লে। ব্লুটুথ কলিং, হার্ট রেট ও স্লিপ মনিটরিং, ওয়্যারলেস চার্জিং সুবিধা। সন্দ্বীপে ফ্রি হোম ডেলিভারি!',
    details: 'Model: T900 Ultra 2 | Display: 2.09" HD | Battery: 280mAh (3-5 days standby) | Wireless Charging | Water Resistant IP67 | Sports Modes: 100+',
    deliveryInfo: 'সন্দ্বীপের ভিতরে ২৪-৪৮ ঘণ্টার মধ্যে ফ্রি ডেলিভারি। সন্দ্বীপের বাইরে ২-৩ দিনের মধ্যে হোম ডেলিভারি।',
    featured: true,
    popular: true,
    rating: 4.8,
    reviewCount: 34,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'M10 TWS Wireless Earbuds with 2000mAh Power Bank Case',
    category: 'Earbuds & Audio',
    price: 680,
    previousPrice: 950,
    discount: 28,
    stock: 40,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80'
    ],
    description: '৯ডি স্টেরিও হাইফাই বেস সাউন্ড। এলইডি ডিজিটাল ডিসপ্লে ও ইমার্জেন্সি মোবাইল চার্জিং পাওয়ার ব্যাংক কেস। টাচ কন্ট্রোল ও নয়েজ ক্যান্সেলেশন।',
    details: 'Bluetooth 5.3 | Playtime: 5-6 hours | Power Case: 2000mAh | Type-C Fast Charging | Touch Sensor with Voice Assistant Support',
    deliveryInfo: 'ক্যাশ অন ডেলিভারি প্রযোজ্য। পণ্য হাতে পেয়ে চেক করে নেওয়ার সুবিধা।',
    featured: true,
    popular: true,
    rating: 4.7,
    reviewCount: 52,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Premium Insulated Stainless Steel Smart Thermal Flask 500ml',
    category: 'Water Bottles & Flasks',
    price: 790,
    previousPrice: 1100,
    discount: 28,
    stock: 18,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'স্মার্ট এলইডি তাপমাত্রা ইন্ডিকেটর ডিসপ্লে। ২৪ ঘণ্টা ঠাণ্ডা বা ১২ ঘণ্টা গরম রাখার নির্ভরযোগ্য ডাবল ওয়াল ভ্যাকুয়াম ইনসুলেশন।',
    details: 'Capacity: 500ml | 304 Food Grade Stainless Steel | Leak Proof | Touch LED Temperature Screen | BPA Free',
    deliveryInfo: 'সন্দ্বীপ পোস্টকোড ৪৩০১ এ দ্রুততম ডেলিভারি।',
    featured: false,
    popular: true,
    rating: 4.9,
    reviewCount: 19,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Multi-functional Anti-Theft Waterproof Travel Laptop Backpack',
    category: 'Bags & Backpacks',
    price: 1850,
    previousPrice: 2450,
    discount: 24,
    stock: 12,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'ওয়াটারপ্রুফ অক্সফোর্ড ফেব্রিক, ইউএসবি চার্জিং পোর্ট, সিকিউর কম্বিনেশন লক এবং ১৫.৬ ইঞ্চি ল্যাপটপ সেফটি প্যাডেড চেম্বার। অফিস বা ভ্রমণের সেরা সঙ্গী।',
    details: 'Fit: Up to 15.6" Laptop | Water Resistant Material | Built-in USB Port | Multiple Compartments | Ergonomic Breathable Straps',
    deliveryInfo: 'সন্দ্বীপের ভিতরে ফ্রি ডেলিভারি।',
    featured: true,
    popular: true,
    rating: 4.8,
    reviewCount: 27,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Remax 20W PD + QC 3.0 Fast Dual Port Mobile Charger Adapter',
    category: 'Mobile Accessories',
    price: 650,
    previousPrice: 850,
    discount: 23,
    stock: 35,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'আইফোন ও অ্যান্ড্রয়েড ফোনের জন্য সুপার ফাস্ট চার্জিং। ওভার-হিটিং ও ওভার-ভোল্টেজ মাল্টিপল প্রোটেকশন চিপ সহ ১০০% নির্ভরযোগ্য।',
    details: 'Total Output: 20W Max | Ports: Type-C PD + USB-A QC3.0 | Compatible with iPhone 11-16 & Android Fast Charge Devices',
    deliveryInfo: 'সন্দ্বীপে ফ্রি হোম ডেলিভারি ও দ্রুত সার্ভিস।',
    featured: false,
    popular: false,
    rating: 4.6,
    reviewCount: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'RGB Sunset Projection Atmosphere Night Lamp for Room Decor',
    category: 'Home & Decor',
    price: 550,
    previousPrice: 750,
    discount: 26,
    stock: 20,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80'
    ],
    description: '১৬ কালার পরিবর্তনযোগ্য রোমান্টিক সানসেট প্রজেকশন ল্যাম্প। রিমোট কন্ট্রোল এবং ইউএসবি পাওয়ার কেবল সহ। সোশ্যাল মিডিয়া ফটো ও রুমের জন্য চমৎকার।',
    details: '16 RGB Colors | 360 Degree Rotatable Aluminium Head | Remote Control Included | USB Powered 5V',
    deliveryInfo: 'সন্দ্বীপের ভেতরে এবং সারা বাংলাদেশে নিরাপদ প্যাকেজিংসহ ডেলিভারি।',
    featured: true,
    popular: true,
    rating: 4.7,
    reviewCount: 22,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'জিহান স্টোরে স্বাগতম!',
    subtitle: 'সন্দ্বীপে সকল অর্ডারে ফ্রি ডেলিভারি ও সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    badge: 'স্পেশাল অফার',
    active: true,
    order: 1
  },
  {
    id: 'ban-2',
    title: 'লেটেস্ট স্মার্টওয়াচ ও অডিও গ্যাজেটস',
    subtitle: '১০০% আসল প্রোডাক্ট ও ওয়ারেন্টি গ্যারান্টি সহ আকর্ষণীয় মূল্যছাড়',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    badge: 'সেরা ডিল',
    active: true,
    order: 2
  }
];

export const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'সন্দ্বীপ এক্সপ্রেস পার্সেল ও লজিস্টিক সার্ভিস',
    description: 'সন্দ্বীপ থেকে ঢাকা ও চট্টগ্রাম সহ সারা দেশে ২৪ ঘণ্টায় নির্ভরযোগ্য পার্সেল ও কুরিয়ার ডেলিভারি।',
    advertiserName: 'Sandwip Express Logistics',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    targetUrl: 'https://wa.me/8801867841638',
    buttonText: 'পার্সেল বুক করুন',
    position: 'homepage',
    displayOrder: 1,
    active: true,
    openInNewTab: true,
    clicksCount: 42,
    impressionsCount: 520,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-2',
    title: 'BD Gadget Care – অরিজিনাল এক্সেসরিজ পার্টনার',
    description: 'স্মার্টফোন ও স্মার্টওয়াচের প্রিমিয়াম গ্লাস প্রোটেক্টর, চার্জার ও ক্যাবল কিনুন বিশেষ ছাড়ে।',
    advertiserName: 'Gadget Care BD',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    targetUrl: 'https://wa.me/8801867841638',
    buttonText: 'অফারটি দেখুন',
    position: 'product_list',
    displayOrder: 1,
    active: true,
    openInNewTab: true,
    clicksCount: 18,
    impressionsCount: 310,
    createdAt: new Date().toISOString()
  }
];

// In-memory cache for ultra-fast responsive state & fallback
let cachedSettings: StoreSettings = { ...DEFAULT_SETTINGS };
let cachedProducts: Product[] = [...INITIAL_PRODUCTS];
let cachedCategories: Category[] = [...INITIAL_CATEGORIES];
let cachedBanners: Banner[] = [...INITIAL_BANNERS];
let cachedAds: Advertisement[] = [...INITIAL_ADS];
let cachedOrders: Order[] = [];

// Initialize or seed Firestore if empty
export async function initializeStoreData() {
  try {
    // 1. Settings check
    const settingsDocRef = doc(db, 'settings', 'store');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, DEFAULT_SETTINGS);
      cachedSettings = DEFAULT_SETTINGS;
    } else {
      cachedSettings = normalizeSettings(settingsSnap.data() as Partial<StoreSettings>);
    }

    // 2. Categories check
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // 3. Products check
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    // 4. Banners check
    const banSnap = await getDocs(collection(db, 'banners'));
    if (banSnap.empty) {
      for (const ban of INITIAL_BANNERS) {
        await setDoc(doc(db, 'banners', ban.id), ban);
      }
    }

    // 5. Advertisements check
    const adsSnap = await getDocs(collection(db, 'advertisements'));
    if (adsSnap.empty) {
      for (const ad of INITIAL_ADS) {
        await setDoc(doc(db, 'advertisements', ad.id), ad);
      }
    }

    // 6. Reviews check
    const revSnap = await getDocs(collection(db, 'reviews'));
    if (revSnap.empty) {
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }
  } catch (err) {
    console.warn('Firestore initialization notice (will use resilient fallback):', err);
  }
}

// Subscribe to Store Settings
export function subscribeToSettings(callback: (settings: StoreSettings) => void) {
  try {
    const docRef = doc(db, 'settings', 'store');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<StoreSettings>;
        cachedSettings = normalizeSettings(data);
        callback(cachedSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    }, (err) => {
      console.warn('Settings subscription fallback:', err);
      callback(cachedSettings);
    });
  } catch (err) {
    callback(cachedSettings);
    return () => {};
  }
}

// Update Store Settings
export async function updateStoreSettings(newSettings: Partial<StoreSettings>) {
  const merged = normalizeSettings({ ...cachedSettings, ...newSettings });
  cachedSettings = merged;
  try {
    await setDoc(doc(db, 'settings', 'store'), merged, { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
    throw err;
  }
  return merged;
}

// Subscribe to Products
export function subscribeToProducts(callback: (products: Product[]) => void) {
  try {
    const colRef = collection(db, 'products');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        cachedProducts = items;
        callback(items);
      } else {
        callback(cachedProducts);
      }
    }, (err) => {
      console.warn('Products subscription fallback:', err);
      callback(cachedProducts);
    });
  } catch (err) {
    callback(cachedProducts);
    return () => {};
  }
}

// Add Product
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: 'prod-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'products', newProduct.id), newProduct);
  } catch (err) {
    console.warn('Saved product locally due to Firestore network:', err);
  }
  cachedProducts = [newProduct, ...cachedProducts];
  return newProduct;
}

// Update Product
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    await updateDoc(doc(db, 'products', id), updates);
  } catch (err) {
    console.warn('Updated product locally due to Firestore network:', err);
  }
  cachedProducts = cachedProducts.map(p => p.id === id ? { ...p, ...updates } : p);
}

// Delete Product
export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    console.warn('Deleted product locally due to Firestore network:', err);
  }
  cachedProducts = cachedProducts.filter(p => p.id !== id);
}

// Subscribe to Categories
export function subscribeToCategories(callback: (categories: Category[]) => void) {
  try {
    const colRef = collection(db, 'categories');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        cachedCategories = items;
        callback(items);
      } else {
        callback(cachedCategories);
      }
    }, (err) => {
      console.warn('Categories subscription fallback:', err);
      callback(cachedCategories);
    });
  } catch (err) {
    callback(cachedCategories);
    return () => {};
  }
}

// Add Category
export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = {
    ...category,
    id: 'cat-' + Date.now()
  };
  try {
    await setDoc(doc(db, 'categories', newCat.id), newCat);
  } catch (err) {
    console.warn('Saved category locally:', err);
  }
  cachedCategories = [...cachedCategories, newCat];
  return newCat;
}

// Delete Category
export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (err) {
    console.warn('Deleted category locally:', err);
  }
  cachedCategories = cachedCategories.filter(c => c.id !== id);
}

// Subscribe to Banners
export function subscribeToBanners(callback: (banners: Banner[]) => void) {
  try {
    const colRef = collection(db, 'banners');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
        cachedBanners = items.sort((a, b) => a.order - b.order);
        callback(cachedBanners);
      } else {
        callback(cachedBanners);
      }
    }, (err) => {
      console.warn('Banners subscription fallback:', err);
      callback(cachedBanners);
    });
  } catch (err) {
    callback(cachedBanners);
    return () => {};
  }
}

export async function addBanner(banner: Omit<Banner, 'id'>): Promise<Banner> {
  const newBanner: Banner = {
    ...banner,
    id: 'ban-' + Date.now()
  };
  try {
    await setDoc(doc(db, 'banners', newBanner.id), newBanner);
  } catch (err) {
    console.warn('Saved banner locally:', err);
  }
  cachedBanners = [...cachedBanners, newBanner];
  return newBanner;
}

export async function deleteBanner(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'banners', id));
  } catch (err) {
    console.warn('Deleted banner locally:', err);
  }
  cachedBanners = cachedBanners.filter(b => b.id !== id);
}

// ================= Advertisements System =================

// Subscribe to Advertisements
export function subscribeToAds(callback: (ads: Advertisement[]) => void) {
  try {
    const colRef = collection(db, 'advertisements');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Advertisement));
        cachedAds = items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        callback(cachedAds);
      } else {
        callback(cachedAds);
      }
    }, (err) => {
      console.warn('Advertisements subscription fallback:', err);
      callback(cachedAds);
    });
  } catch (err) {
    callback(cachedAds);
    return () => {};
  }
}

// Add New Advertisement
export async function addAd(ad: Omit<Advertisement, 'id' | 'createdAt'>): Promise<Advertisement> {
  const newAd: Advertisement = {
    ...ad,
    id: 'ad-' + Date.now(),
    clicksCount: 0,
    impressionsCount: 0,
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'advertisements', newAd.id), newAd);
  } catch (err) {
    console.warn('Saved advertisement locally:', err);
  }
  cachedAds = [...cachedAds, newAd].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return newAd;
}

// Update Advertisement
export async function updateAd(id: string, updates: Partial<Advertisement>): Promise<void> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  try {
    await updateDoc(doc(db, 'advertisements', id), payload);
  } catch (err) {
    console.warn('Updated advertisement locally:', err);
  }
  cachedAds = cachedAds.map(a => a.id === id ? { ...a, ...payload } : a).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

// Delete Advertisement
export async function deleteAd(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'advertisements', id));
  } catch (err) {
    console.warn('Deleted advertisement locally:', err);
  }
  cachedAds = cachedAds.filter(a => a.id !== id);
}

// Toggle Ad Active/Inactive Status
export async function toggleAdStatus(id: string, active: boolean): Promise<void> {
  await updateAd(id, { active });
}

// Track Ad Click in Firestore database
export async function trackAdClick(id: string): Promise<void> {
  if (!id) return;
  const now = new Date().toISOString();

  // 1. Immediately update in-memory cache for fast UI updates
  cachedAds = cachedAds.map(a => {
    if (a.id === id) {
      const updatedClicks = (a.clicks ?? a.clicksCount ?? 0) + 1;
      return {
        ...a,
        clicks: updatedClicks,
        clicksCount: updatedClicks,
        lastClickedAt: now
      };
    }
    return a;
  });

  // 2. Persist to Firestore: increment 'clicks' (and 'clicksCount') and set 'lastClickedAt'
  try {
    const adRef = doc(db, 'advertisements', id);
    await updateDoc(adRef, {
      clicks: increment(1),
      clicksCount: increment(1),
      lastClickedAt: now
    });
  } catch (err) {
    console.warn('Ad click tracking Firestore update notice (cached locally):', err);
  }
}

// Aliases for explicit imports
export const trackAdClickInFirestore = trackAdClick;
export const recordAdClick = trackAdClick;

// Track Ad Impression safely
export async function trackAdImpression(id: string): Promise<void> {
  if (!id) return;
  try {
    const existing = cachedAds.find(a => a.id === id);
    if (!existing) return;
    const newCount = (existing.impressions ?? existing.impressionsCount ?? 0) + 1;
    cachedAds = cachedAds.map(a => a.id === id ? { ...a, impressions: newCount, impressionsCount: newCount } : a);
    const adRef = doc(db, 'advertisements', id);
    await updateDoc(adRef, {
      impressions: increment(1),
      impressionsCount: increment(1)
    });
  } catch {
    // Non-blocking silent fallback
  }
}

// Orders: Place order with Duplicate Protection & Order Number
export async function placeOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'orderStatus' | 'paymentStatus'>): Promise<Order> {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `JS-${randomSuffix}`;
  const id = `order-${timestamp}`;

  const fullOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    orderStatus: 'Pending',
    paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : (orderData.trxId ? 'pending' : 'pending'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'orders', id), fullOrder);
  } catch (err) {
    console.warn('Order saved locally due to Firestore network:', err);
  }

  // Also save to localStorage for customer easy tracking without login
  try {
    const existing = JSON.parse(localStorage.getItem('jihan_customer_orders') || '[]');
    localStorage.setItem('jihan_customer_orders', JSON.stringify([fullOrder, ...existing]));
  } catch (e) {
    // Ignore storage quota
  }

  cachedOrders = [fullOrder, ...cachedOrders];
  return fullOrder;
}

// Subscribe to Orders (Admin & Customer)
export function subscribeToOrders(callback: (orders: Order[]) => void, customerPhoneOrId?: string) {
  try {
    const colRef = collection(db, 'orders');
    return onSnapshot(colRef, (snapshot) => {
      let items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      if (items.length > 0) {
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        cachedOrders = items;
      } else {
        items = cachedOrders;
      }

      if (customerPhoneOrId) {
        const filtered = items.filter(o => 
          o.customerId === customerPhoneOrId || 
          o.customerPhone === customerPhoneOrId ||
          o.orderNumber.toLowerCase() === customerPhoneOrId.toLowerCase()
        );
        callback(filtered);
      } else {
        callback(items);
      }
    }, (err) => {
      console.warn('Orders subscription fallback:', err);
      callback(cachedOrders);
    });
  } catch (err) {
    callback(cachedOrders);
    return () => {};
  }
}

// Update Order Status
export async function updateOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: 'pending' | 'verified' | 'failed') {
  const updates: Partial<Order> = {
    orderStatus: status,
    updatedAt: new Date().toISOString(),
    ...(paymentStatus ? { paymentStatus } : {})
  };
  try {
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (err) {
    console.warn('Updated order status locally:', err);
  }
  cachedOrders = cachedOrders.map(o => o.id === orderId ? { ...o, ...updates } : o);
}

// Reviews
export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'T900 Ultra 2 Big Display Bluetooth Calling Smartwatch',
    customerName: 'তানভীর আহমেদ (সন্দ্বীপ)',
    rating: 5,
    comment: 'অসাধারণ কোয়ালিটি! সন্দ্বীপে মাত্র ১ দিনে ফ্রি ডেলিভারি পেয়েছি। কলিং এবং ডিসপ্লে অনেক স্মুথ।',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'Pro 2nd Gen Wireless Earbuds with ANC & Spatial Audio',
    customerName: 'মেহেদী হাসান',
    rating: 5,
    comment: 'সাউন্ড বেজ খুব ক্লিয়ার, ব্যাটারি ব্যাকআপ দারুণ। প্যাকেজিং অনেক ভালো ছিল।',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'rev-3',
    productId: 'prod-1',
    productName: 'T900 Ultra 2 Big Display Bluetooth Calling Smartwatch',
    customerName: 'রাকিবুল ইসলাম',
    rating: 4,
    comment: 'ভালো প্রোডাক্ট, দাম অনুযায়ী পারফেক্ট সার্ভিস।',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

export async function addProductReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
  const newReview: Review = {
    ...review,
    id: 'rev-' + Date.now(),
    status: 'approved', // default approved, admin has total hide/delete control
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'reviews', newReview.id), newReview);
  } catch (err) {
    console.warn('Review saved locally:', err);
    try {
      const existing = JSON.parse(localStorage.getItem('jihan_store_reviews') || '[]');
      localStorage.setItem('jihan_store_reviews', JSON.stringify([newReview, ...existing]));
    } catch {
      // Ignore
    }
  }
  return newReview;
}

export function subscribeToReviews(productId: string, callback: (reviews: Review[]) => void) {
  try {
    const colRef = collection(db, 'reviews');
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Review))
        .filter(r => r.productId === productId && r.status === 'approved');
      if (items.length > 0) {
        callback(items);
      } else {
        const fallbacks = INITIAL_REVIEWS.filter(r => r.productId === productId && r.status === 'approved');
        callback(fallbacks);
      }
    }, () => {
      const fallbacks = INITIAL_REVIEWS.filter(r => r.productId === productId && r.status === 'approved');
      callback(fallbacks);
    });
  } catch (err) {
    const fallbacks = INITIAL_REVIEWS.filter(r => r.productId === productId && r.status === 'approved');
    callback(fallbacks);
    return () => {};
  }
}

export function subscribeToAllReviews(callback: (reviews: Review[]) => void) {
  try {
    const colRef = collection(db, 'reviews');
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (items.length > 0) {
        callback(items);
      } else {
        callback(INITIAL_REVIEWS);
      }
    }, (err) => {
      console.warn('Reviews subscription notice:', err);
      try {
        const local = JSON.parse(localStorage.getItem('jihan_store_reviews') || '[]');
        callback(local.length > 0 ? local : INITIAL_REVIEWS);
      } catch {
        callback(INITIAL_REVIEWS);
      }
    });
  } catch (err) {
    callback(INITIAL_REVIEWS);
    return () => {};
  }
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'hidden' | 'pending'): Promise<void> {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { status });
  } catch (err) {
    console.warn('Review status update locally:', err);
    try {
      const existing: Review[] = JSON.parse(localStorage.getItem('jihan_store_reviews') || JSON.stringify(INITIAL_REVIEWS));
      const updated = existing.map(r => r.id === reviewId ? { ...r, status } : r);
      localStorage.setItem('jihan_store_reviews', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (err) {
    console.warn('Review delete locally:', err);
    try {
      const existing: Review[] = JSON.parse(localStorage.getItem('jihan_store_reviews') || JSON.stringify(INITIAL_REVIEWS));
      const filtered = existing.filter(r => r.id !== reviewId);
      localStorage.setItem('jihan_store_reviews', JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  }
}

// Customer Support Chat System (Text, Image, Voice)
export function getOrCreateConversationId(customerId: string): string {
  return `conv-${customerId.replace(/[^a-zA-Z0-9]/g, '') || 'guest'}`;
}

export function subscribeToConversationMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  try {
    const colRef = collection(db, 'conversations', conversationId, 'messages');
    return onSnapshot(colRef, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(msgs);
    }, (err) => {
      console.warn('Chat messages subscription notice:', err);
      // Fallback local chat messages
      const local = JSON.parse(localStorage.getItem(`jihan_chat_${conversationId}`) || '[]');
      callback(local);
    });
  } catch (err) {
    callback([]);
    return () => {};
  }
}

export async function sendChatMessage(
  conversationId: string,
  message: Omit<ChatMessage, 'id' | 'conversationId' | 'createdAt'>,
  customerInfo?: { customerId: string; customerName: string; customerPhone?: string }
): Promise<ChatMessage> {
  const msgId = 'msg-' + Date.now();
  const fullMsg: ChatMessage = {
    ...message,
    id: msgId,
    conversationId,
    createdAt: new Date().toISOString()
  };

  try {
    // 1. Add message doc
    await setDoc(doc(db, 'conversations', conversationId, 'messages', msgId), fullMsg);
    // 2. Update conversation summary doc
    const convDocRef = doc(db, 'conversations', conversationId);
    await setDoc(convDocRef, {
      id: conversationId,
      customerId: customerInfo?.customerId || conversationId,
      customerName: customerInfo?.customerName || message.senderName || 'Customer',
      customerPhone: customerInfo?.customerPhone || '',
      lastMessage: message.type === 'voice' ? '🎤 Voice message' : (message.type === 'image' ? '📷 Image attachment' : (message.text || '')),
      lastMessageTime: fullMsg.createdAt,
      unreadByAdmin: message.senderRole === 'customer' ? 1 : 0,
      unreadByCustomer: message.senderRole === 'admin' ? 1 : 0
    }, { merge: true });
  } catch (err) {
    console.warn('Saved chat message locally:', err);
  }

  // Backup to localStorage for customer device
  try {
    const key = `jihan_chat_${conversationId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...existing, fullMsg]));
  } catch (e) {
    // Ignore quota
  }

  return fullMsg;
}

// Delete Order
export async function deleteOrder(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (err) {
    console.warn('Deleted order locally:', err);
  }
  cachedOrders = cachedOrders.filter(o => o.id !== id);
}

// Save Product (Create or Update)
export async function saveProduct(product: Partial<Product> & { name: string; price: number }, existingId?: string): Promise<Product> {
  const targetId = existingId || product.id;
  if (targetId) {
    await updateProduct(targetId, product);
    return { ...product, id: targetId } as Product;
  } else {
    return await addProduct(product as any);
  }
}

// Subscribe to all conversations for Admin
export function subscribeToAllConversations(callback: (conversations: any[]) => void) {
  try {
    const colRef = collection(db, 'conversations');
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
      callback(items);
    }, (err) => {
      console.warn('Conversations subscription fallback:', err);
      callback([]);
    });
  } catch (err) {
    callback([]);
    return () => {};
  }
}

// Alias for conversations subscription
export const subscribeToConversations = subscribeToAllConversations;

