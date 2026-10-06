export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  previousPrice?: number;
  discount?: number;
  stock: number;
  inStock: boolean;
  images: string[];
  description: string;
  details?: string;
  deliveryInfo?: string;
  featured?: boolean;
  popular?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card' | 'other';
export type PaymentStatus = 'pending' | 'verified' | 'failed';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryArea: 'inside_sandwip' | 'outside_sandwip';
  shippingAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trxId?: string;
  paymentScreenshot?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerId?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  imageUrl?: string;
  link?: string;
  badge?: string;
  active: boolean;
  order: number;
}

export interface AdditionalContact {
  id: string;
  type: 'phone' | 'whatsapp' | 'address' | 'email';
  label: string;
  value: string;
}

export interface StorePhoneContact {
  id: string;
  number: string;
  label: string;
  type: 'primary' | 'secondary' | 'whatsapp' | 'support' | 'other';
  isPrimary?: boolean;
  notes?: string;
}

export interface StoreEmailContact {
  id: string;
  email: string;
  label: string;
  isPrimary?: boolean;
}

export interface StoreAddress {
  id: string;
  title: string;
  address: string;
  phone?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface StoreSocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'whatsapp' | 'website' | 'other' | string;
  platformName: string;
  platformNameEn?: string;
  url: string;
  enabled: boolean;
  language?: 'both' | 'bn' | 'en';
}

export interface StorePaymentAccount {
  id: string;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'other';
  methodName: string;
  accountNumber: string;
  accountType: 'Personal' | 'Merchant' | 'Agent' | 'Savings' | 'Current' | string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  instruction?: string;
  enabled: boolean;
  isDefault?: boolean;
}

export interface StoreDeliveryZone {
  id: string;
  name: string;
  charge: number;
  estimatedTime?: string;
  enabled: boolean;
  isInsideSandwip?: boolean;
}

export interface StoreBrandColors {
  primary: string;
  secondary: string;
  accent?: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  businessName: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  logoUrl?: string;
  deliveryInsideSandwip: number;
  deliveryOutsideSandwip: number;
  freeDeliveryThreshold?: number;
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant' | 'Agent';
  bkashInstruction: string;
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  nagadInstruction: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  socialTelegram: string;
  socialWhatsapp: string;
  additionalContacts: AdditionalContact[];
  // Extended structured fields for comprehensive admin control
  addresses?: StoreAddress[];
  phoneNumbers?: StorePhoneContact[];
  emailAddresses?: StoreEmailContact[];
  socialLinks?: StoreSocialLink[];
  paymentAccounts?: StorePaymentAccount[];
  deliveryZones?: StoreDeliveryZone[];
  brandColors?: StoreBrandColors;
}

export type MessageType = 'text' | 'image' | 'voice';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'admin';
  senderName: string;
  type: MessageType;
  text?: string;
  fileUrl?: string;
  audioDuration?: number;
  createdAt: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAt?: string;
  unreadByAdmin: number;
  unreadByCustomer: number;
}

export type ChatConversation = Conversation;


export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  address?: string;
  deliveryArea?: 'inside_sandwip' | 'outside_sandwip';
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface SourceVersion {
  version: string;
  date: string;
  summary: string;
  fileCount: number;
  isLatest?: boolean;
}

export type AdPosition = 'homepage' | 'product_list' | 'category_page' | 'product_details';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  advertiserName: string;
  imageUrl: string;
  targetUrl: string;
  buttonText: string;
  position: AdPosition;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  openInNewTab: boolean;
  clicks?: number;
  clicksCount?: number;
  impressions?: number;
  impressionsCount?: number;
  lastClickedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
