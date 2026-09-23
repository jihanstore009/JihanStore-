import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  Eye, 
  Trash2, 
  Phone, 
  ExternalLink, 
  Download, 
  Printer, 
  X,
  CreditCard,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { updateOrderStatus, deleteOrder } from '../services/storeService';

interface OrdersManagerProps {
  orders: Order[];
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ orders }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Status list
  const STATUSES: { key: OrderStatus; label: string; color: string; bg: string }[] = [
    { key: 'Pending', label: 'অপেক্ষারত', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    { key: 'Confirmed', label: 'নিশ্চিত', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { key: 'Processing', label: 'প্রক্রিয়াধীন', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    { key: 'Shipped', label: 'ডেলিভারিতে', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    { key: 'Delivered', label: 'ডেলিভার্ড', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { key: 'Cancelled', label: 'বাতিল', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' }
  ];

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.orderStatus.toLowerCase() === filter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.trxId && o.trxId.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, paymentStatus?: 'pending' | 'verified' | 'failed') => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, paymentStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus,
          ...(paymentStatus ? { paymentStatus } : {})
        });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  // Export orders to CSV
  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'Area', 'Payment Method', 'TrxID', 'Items', 'Total Amount', 'Status'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
      o.deliveryArea === 'inside_sandwip' ? 'Inside Sandwip' : 'Outside Sandwip',
      o.paymentMethod.toUpperCase(),
      o.trxId || 'N/A',
      `"${o.items.map(i => `${i.name} (x${i.quantity})`).join(', ').replace(/"/g, '""')}"`,
      o.totalAmount,
      o.orderStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jihan_store_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print packing slip / invoice
  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .title { font-size: 20px; font-weight: bold; color: #1e3a8a; }
            .subtitle { font-size: 12px; color: #64748b; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th { background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; }
            td { padding: 8px; border: 1px solid #cbd5e1; }
            .total-box { margin-left: auto; width: 250px; font-size: 13px; }
            .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-weight: bold; font-size: 15px; border-top: 2px solid #1e293b; padding-top: 6px; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">JIHAN STORE – জিহান স্টোর</div>
              <div class="subtitle">পোস্টকোড ৪৩০১, সন্দ্বীপ, চট্টগ্রাম • ফোন: 01867841638</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${order.orderNumber}</div>
              <div class="subtitle">${new Date(order.createdAt).toLocaleString('bn-BD')}</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <strong>গ্রাহকের তথ্য:</strong><br/>
              নাম: ${order.customerName}<br/>
              ফোন: ${order.customerPhone}<br/>
              ঠিকানা: ${order.shippingAddress}<br/>
              এরিয়া: ${order.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে' : 'সন্দ্বীপের বাইরে'}
            </div>
            <div>
              <strong>পেমেন্ট ও ডেলিভারি:</strong><br/>
              পেমেন্ট মাধ্যম: ${order.paymentMethod.toUpperCase()}<br/>
              ${order.trxId ? `TrxID: ${order.trxId}<br/>` : ''}
              পেমেন্ট স্ট্যাটাস: ${order.paymentStatus.toUpperCase()}<br/>
              অর্ডার স্ট্যাটাস: ${order.orderStatus}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>আইটেম</th>
                <th style="text-align: center; width: 60px;">পরিমাণ</th>
                <th style="text-align: right; width: 90px;">দর</th>
                <th style="text-align: right; width: 100px;">মোট</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">৳${item.price}</td>
                  <td style="text-align: right;">৳${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-row"><span>সাবটোটাল:</span><span>৳${order.subtotal}</span></div>
            <div class="total-row"><span>ডেলিভারি চার্জ:</span><span>৳${order.deliveryCharge}</span></div>
            <div class="total-row grand-total"><span>সর্বমোট:</span><span>৳${order.totalAmount}</span></div>
          </div>

          <div class="footer">
            জিহান স্টোরে শপিং করার জন্য ধন্যবাদ। কোনো প্রয়োজনে যোগাযোগ করুন: 01867841638 | jihanstore009@gmail.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filter Tabs, Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অর্ডার নম্বর (JS-...), গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ক্লিয়ার
              </button>
            )}
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>CSV এক্সপোর্ট ({filteredOrders.length})</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল অর্ডার ({orders.length})
          </button>
          {STATUSES.map((st) => {
            const count = orders.filter((o) => o.orderStatus.toLowerCase() === st.key.toLowerCase()).length;
            return (
              <button
                key={st.key}
                onClick={() => setFilter(st.key.toLowerCase())}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filter === st.key.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{st.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === st.key.toLowerCase() ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">কাস্টমার যখন ওয়েবসাইট থেকে অর্ডার করবে তা এখানে তাৎক্ষণিক প্রদর্শিত হবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">অর্ডার নং ও সময়</th>
                  <th className="py-3 px-4">গ্রাহক ও ফোন</th>
                  <th className="py-3 px-4">আইটেম ও এরিয়া</th>
                  <th className="py-3 px-4">পেমেন্ট</th>
                  <th className="py-3 px-4">মোট টাকা</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusObj = STATUSES.find(s => s.key.toLowerCase() === order.orderStatus.toLowerCase()) || STATUSES[0];
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {order.orderNumber}
                        <div className="text-[10px] font-normal text-slate-400 font-sans mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-700 truncate max-w-[180px]">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                        <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 ${
                          order.deliveryArea === 'inside_sandwip' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপ (ফ্রি)' : 'সন্দ্বীপের বাইরে'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {order.paymentMethod}
                        </span>
                        {order.trxId && (
                          <div className="text-[10px] font-mono text-blue-700 mt-1">
                            Trx: {order.trxId}
                          </div>
                        )}
                        {order.paymentScreenshot && (
                          <span className="inline-block text-[10px] text-emerald-600 font-semibold mt-0.5">
                            ✓ স্ক্রিনশট আছে
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        ৳{order.totalAmount}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusObj.bg} ${statusObj.color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{statusObj.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="বিস্তারিত দেখুন"
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printInvoice(order)}
                            title="ইনভয়েস প্রিন্ট করুন"
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(order.id)}
                            title="অর্ডার মুছুন"
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  তারিখ: {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                অর্ডার স্ট্যাটাস পরিবর্তন করুন (Customer Website-এ লাইভ আপডেট হবে):
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((st) => (
                  <button
                    key={st.key}
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedOrder.id, st.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.orderStatus.toLowerCase() === st.key.toLowerCase()
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">গ্রাহকের বিবরণ</h4>
                <div className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://wa.me/880${selectedOrder.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`প্রিয় ${selectedOrder.customerName}, জিহান স্টোর থেকে আপনার অর্ডার ${selectedOrder.orderNumber} সম্পর্কে:`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল করুন</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ডেলিভারি ঠিকানা</h4>
                <div className="text-xs text-slate-800 leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedOrder.shippingAddress}</span>
                </div>
                <div className="text-xs text-slate-500">
                  এরিয়া: <span className="font-semibold text-slate-700">{selectedOrder.deliveryArea === 'inside_sandwip' ? 'সন্দ্বীপের ভিতরে (ফ্রি)' : 'সন্দ্বীপের বাইরে (৳১৩০)'}</span>
                </div>
                {selectedOrder.notes && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    নোট: {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details & Screenshot */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">পেমেন্ট ইনফরমেশন</h4>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  selectedOrder.paymentStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  পেমেন্ট: {selectedOrder.paymentStatus === 'verified' ? 'যাচাইকৃত' : 'অপেক্ষারত'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">মাধ্যম:</span>
                  <p className="font-bold uppercase text-slate-800">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-slate-400">TrxID:</span>
                  <p className="font-mono font-bold text-blue-700">{selectedOrder.trxId || 'প্রযোজ্য নয়'}</p>
                </div>
                <div>
                  <span className="text-slate-400">সর্বমোট:</span>
                  <p className="font-black text-slate-900 text-sm">৳{selectedOrder.totalAmount}</p>
                </div>
              </div>

              {/* Verify Payment Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.orderStatus, selectedOrder.paymentStatus === 'verified' ? 'pending' : 'verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    selectedOrder.paymentStatus === 'verified'
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedOrder.paymentStatus === 'verified' ? 'পেমেন্ট অনিশ্চিত হিসেবে মার্ক করুন' : 'পেমেন্ট ভেরিফাই করুন'}</span>
                </button>
              </div>

              {/* Payment Screenshot Viewer */}
              {selectedOrder.paymentScreenshot && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">গ্রাহকের পাঠানো পেমেন্ট স্ক্রিনশট:</span>
                  <img
                    src={selectedOrder.paymentScreenshot}
                    alt="Payment Screenshot"
                    className="max-h-48 rounded-xl border border-slate-300 cursor-pointer object-cover hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewScreenshot(selectedOrder.paymentScreenshot!)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">পূর্ণ স্ক্রিনে দেখতে ছবিতে ক্লিক করুন</p>
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">অর্ডারকৃত আইটেমসমূহ</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">৳{item.price} × {item.quantity} পিস</div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-slate-900">
                      ৳{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>সাবটোটাল:</span><span>৳{selectedOrder.subtotal}</span></div>
                <div className="flex justify-between"><span>ডেলিভারি ফি:</span><span>৳{selectedOrder.deliveryCharge}</span></div>
                <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-200 pt-1">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span>৳{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => printInvoice(selectedOrder)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>চালান / ইনভয়েস প্রিন্ট</span>
              </button>
              <button
                onClick={() => setConfirmDeleteId(selectedOrder.id)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>অর্ডার মুছুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewScreenshot(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewScreenshot} alt="Payment Full Screenshot" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">অর্ডারটি নিশ্চিত মুছে ফেলতে চান?</h4>
            <p className="text-xs text-slate-500">এই অর্ডারটি ডাটাবেজ থেকে মুছে ফেলা হবে। এই কাজটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
