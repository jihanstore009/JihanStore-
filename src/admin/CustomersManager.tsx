import React, { useState } from 'react';
import { Users, Search, Phone, ExternalLink, ShoppingBag, MapPin, Calendar } from 'lucide-react';
import { Order } from '../types';

interface CustomersManagerProps {
  orders: Order[];
}

interface CustomerStats {
  phone: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  lastAddress: string;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate customers from orders
  const customerMap = new Map<string, CustomerStats>();
  orders.forEach((o) => {
    const phone = o.customerPhone.trim();
    if (!phone) return;

    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        phone,
        name: o.customerName,
        totalOrders: 1,
        totalSpent: o.totalAmount,
        lastOrderDate: o.createdAt,
        lastAddress: o.shippingAddress
      });
    } else {
      const existing = customerMap.get(phone)!;
      existing.totalOrders += 1;
      existing.totalSpent += o.totalAmount;
      if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
        existing.lastAddress = o.shippingAddress;
        existing.name = o.customerName;
      }
    }
  });

  const customersList = Array.from(customerMap.values());

  const filteredCustomers = customersList.filter((c) => {
    const q = searchTerm.toLowerCase();
    return !searchTerm || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.lastAddress.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-bold shrink-0">
          মোট গ্রাহক: {customersList.length} জন
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">কোনো গ্রাহক পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">অর্ডার সম্পন্ন হলে গ্রাহকদের স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত করা হবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">গ্রাহক</th>
                  <th className="py-3 px-4">ফোন নম্বর</th>
                  <th className="py-3 px-4">মোট অর্ডার</th>
                  <th className="py-3 px-4">মোট খরচ</th>
                  <th className="py-3 px-4">সর্বশেষ ঠিকানা</th>
                  <th className="py-3 px-4">সর্বশেষ অর্ডার</th>
                  <th className="py-3 px-4 text-right">যোগাযোগ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.phone} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {cust.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        {cust.totalOrders} টি অর্ডার
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ৳{cust.totalSpent}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {cust.lastAddress}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(cust.lastOrderDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
