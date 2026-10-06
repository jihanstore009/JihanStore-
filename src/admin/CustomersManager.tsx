import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  ExternalLink, 
  ShoppingBag, 
  MapPin, 
  Calendar,
  Download,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { Order, UserProfile } from '../types';
import { db, collection, getDocs } from '../firebase/config';

interface CustomersManagerProps {
  orders: Order[];
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  accountStatus: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Fetch registered users from Firestore users collection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const usersList: UserProfile[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as UserProfile;
          if (data.role !== 'admin') {
            usersList.push({ ...data, uid: doc.id });
          }
        });
        setRegisteredUsers(usersList);
      } catch (err) {
        console.warn('Could not fetch Firestore users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Merge registered users with orders to create comprehensive customer list
  const customerMap = new Map<string, CustomerRecord>();

  // 1. Add registered users
  registeredUsers.forEach((u) => {
    const key = u.phoneNumber ? u.phoneNumber.trim() : (u.email || u.uid);
    customerMap.set(key, {
      id: u.uid,
      name: u.displayName || 'Customer',
      email: u.email || '',
      phone: u.phoneNumber || '',
      address: u.address || '',
      registrationDate: u.createdAt || new Date().toISOString(),
      accountStatus: 'Active',
      orderCount: 0,
      totalSpent: 0
    });
  });

  // 2. Add or update with order information
  orders.forEach((o) => {
    const phone = o.customerPhone?.trim() || '';
    const email = o.customerEmail?.trim() || '';
    const key = phone || email || o.customerName;
    if (!key) return;

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: o.customerId || `cust_${phone}`,
        name: o.customerName,
        email: email,
        phone: phone,
        address: o.shippingAddress,
        registrationDate: o.createdAt,
        accountStatus: 'Active',
        orderCount: 1,
        totalSpent: o.totalAmount,
        lastOrderDate: o.createdAt
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.orderCount += 1;
      existing.totalSpent += o.totalAmount;
      if (!existing.email && email) existing.email = email;
      if (!existing.address && o.shippingAddress) existing.address = o.shippingAddress;
      if (!existing.lastOrderDate || new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
        existing.address = o.shippingAddress;
      }
    }
  });

  const customersList = Array.from(customerMap.values());

  const filteredCustomers = customersList.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  // Export functions (Non-sensitive data only!)
  const handleDownloadCustomersCSV = () => {
    const headers = [
      'Customer Name',
      'Email',
      'Phone Number',
      'Delivery Address',
      'Registration Date',
      'Account Status',
      'Order Count',
      'Total Spent (BDT)',
      'Last Order Date'
    ];

    const rows = customersList.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${new Date(c.registrationDate).toLocaleDateString()}"`,
      `"${c.accountStatus}"`,
      c.orderCount,
      c.totalSpent,
      c.lastOrderDate ? `"${new Date(c.lastOrderDate).toLocaleDateString()}"` : '""'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jihan_store_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('কাস্টমার ডাটা CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  const handleDownloadCustomersJSON = () => {
    const safeData = customersList.map((c) => ({
      customerId: c.id,
      name: c.name,
      email: c.email,
      phoneNumber: c.phone,
      deliveryAddress: c.address,
      registrationDate: c.registrationDate,
      accountStatus: c.accountStatus,
      orderCount: c.orderCount,
      totalSpentBDT: c.totalSpent,
      lastOrderDate: c.lastOrderDate || null
    }));

    const blob = new Blob([JSON.stringify(safeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jihan_store_customers_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('কাস্টমার ডাটা JSON ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  const handleDownloadOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Delivery Area',
      'Shipping Address',
      'Items Count',
      'Subtotal (BDT)',
      'Delivery Charge (BDT)',
      'Total Amount (BDT)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Order Date'
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
      `"${o.deliveryArea}"`,
      `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
      (o.items || []).reduce((sum, item) => sum + item.quantity, 0),
      o.subtotal,
      o.deliveryCharge,
      o.totalAmount,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jihan_store_customer_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('কাস্টমার অর্ডার হিস্টোরি CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  const showNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Top Export Bar: Customer File & Order History Download */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>কাস্টমার ডাটা ডাউনলোড ও এক্সপোর্ট (Customer File Export)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              অনুমোদিত এডমিন হিসেবে কাস্টমার তথ্য এবং অর্ডার হিস্টোরি CSV ও JSON ফরম্যাটে নিরাপদে ডাউনলোড করুন
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="download-customer-csv-btn"
              onClick={handleDownloadCustomersCSV}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Download Customer (CSV)</span>
            </button>

            <button
              type="button"
              id="download-customer-json-btn"
              onClick={handleDownloadCustomersJSON}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>Download Customer (JSON)</span>
            </button>

            <button
              type="button"
              id="download-orders-csv-btn"
              onClick={handleDownloadOrdersCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-200" />
              <span>Download Orders (CSV)</span>
            </button>
          </div>
        </div>

        {/* Security & Non-Sensitive Data Assurance */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            নিরাপত্তা নিশ্চয়তা: এক্সপোর্ট ফাইলে কাস্টমার পাসওয়ার্ড, সিক্রেট টোকেন বা গোপন তথ্য অন্তর্ভুক্ত করা হয় না।
          </span>
        </div>
      </div>

      {/* Search & Overview Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="গ্রাহকের নাম, ইমেইল, ফোন অথবা ঠিকানা দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs font-bold shrink-0">
          মোট কাস্টমার: {customersList.length} জন
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">কোনো গ্রাহক পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">অর্ডার সম্পন্ন হলে বা কাস্টমার একাউন্ট খুললে স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">গ্রাহকের নাম</th>
                  <th className="py-3 px-4">ইমেইল ও ফোন</th>
                  <th className="py-3 px-4">মোট অর্ডার</th>
                  <th className="py-3 px-4">মোট কেনাকাটা</th>
                  <th className="py-3 px-4">ডেলিভারি ঠিকানা</th>
                  <th className="py-3 px-4">রেজিস্ট্রেশন তারিখ</th>
                  <th className="py-3 px-4 text-right">যোগাযোগ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id + cust.phone} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                        {cust.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-slate-800">{cust.phone || 'ফোন নেই'}</div>
                      {cust.email && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{cust.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        {cust.orderCount} টি অর্ডার
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ৳{cust.totalSpent}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {cust.address || 'ঠিকানা দেওয়া হয়নি'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(cust.registrationDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cust.phone && (
                          <>
                            <a
                              href={`https://wa.me/880${cust.phone.replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="WhatsApp মেসেজ দিন"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a
                              href={`tel:${cust.phone}`}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="সরাসরি কল করুন"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        {cust.email && (
                          <a
                            href={`mailto:${cust.email}`}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            title="ইমেইল পাঠান"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
