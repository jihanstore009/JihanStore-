import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  MessageSquare, 
  User, 
  Package, 
  Calendar,
  X,
  Sparkles,
  ShieldAlert,
  ThumbsUp
} from 'lucide-react';
import { Review, Product } from '../types';
import { 
  subscribeToAllReviews, 
  updateReviewStatus, 
  deleteReview, 
  addProductReview 
} from '../services/storeService';

interface ReviewsManagerProps {
  products: Product[];
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({ products }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  
  // Notification alert state
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Add Review Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductId, setNewProductId] = useState(products[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAllReviews((revs) => {
      setReviews(revs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleToggleHide = async (rev: Review) => {
    const nextStatus = rev.status === 'hidden' ? 'approved' : 'hidden';
    await updateReviewStatus(rev.id, nextStatus);
    showNotice(
      nextStatus === 'hidden'
        ? `"${rev.customerName}"-এর রিভিউটি সফলভাবে হাইড (গোপন) করা হয়েছে। ওয়েবসাইটে এটি আর দেখা যাবে না।`
        : `রিভিউটি সফলভাবে দৃশ্যমান (Approved) করা হয়েছে।`
    );
  };

  const handleDelete = async (rev: Review) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${rev.customerName}"-এর এই রিভিউটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      await deleteReview(rev.id);
      showNotice('রিভিউটি স্থায়ীভাবে মুছে ফেলা হয়েছে।');
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newComment.trim() || !newProductId) return;

    setIsSubmitting(true);
    const selectedProd = products.find(p => p.id === newProductId);
    const productName = selectedProd ? selectedProd.name : 'Unknown Product';

    try {
      await addProductReview({
        productId: newProductId,
        productName,
        customerName: newCustomerName.trim(),
        rating: newRating,
        comment: newComment.trim()
      });

      setIsAddModalOpen(false);
      setNewCustomerName('');
      setNewComment('');
      setNewRating(5);
      showNotice('নতুন রিভিউ সফলভাবে যুক্ত ও প্রকাশিত হয়েছে!');
    } catch (err) {
      console.error('Failed to add review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchProd = (r.productName || '').toLowerCase().includes(q);
      if (!matchName && !matchComment && !matchProd) return false;
    }
    return true;
  });

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const hiddenCount = reviews.filter(r => r.status === 'hidden').length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 max-w-6xl font-sans">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                কাস্টমার রিভিউ ম্যানেজমেন্ট (হাইড ও ডিলিট নিয়ন্ত্রণ)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              কাস্টমারদের দেওয়া রিভিউ অনুমোদন করুন, খারাপ বা অনুপযুক্ত রিভিউ হাইড বা ডিলিট করুন
            </p>
          </div>

          <button
            type="button"
            id="add-review-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন রিভিউ যুক্ত করুন</span>
          </button>
        </div>

        {/* Live Notification */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 4 Statistics Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">মোট রিভিউ</span>
            <span className="text-xl font-black text-slate-900 font-mono">{totalReviews} টি</span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 block">লাইভ / অনুমোদিত</span>
            <span className="text-xl font-black text-emerald-700 font-mono">{approvedCount} টি</span>
          </div>

          <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-1">
            <span className="text-[11px] font-bold text-rose-800 block">হাইড করা (লুকানো)</span>
            <span className="text-xl font-black text-rose-700 font-mono">{hiddenCount} টি</span>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 block">গড় রেটিং</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-xl font-black text-amber-800 font-mono">{avgRating} / ৫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="কাস্টমারের নাম, মতামত বা প্রোডাক্ট দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              সকল ({totalReviews})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              লাইভ ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('hidden')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'hidden' ? 'bg-rose-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              হাইড ({hiddenCount})
            </button>
          </div>

          {/* Rating filter dropdown */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">সব রেটিং (★ ১-৫)</option>
            <option value="5">৫ স্টার (★★★★★)</option>
            <option value="4">৪ স্টার (★★★★)</option>
            <option value="3">৩ স্টার (★★★)</option>
            <option value="2">২ স্টার (★★)</option>
            <option value="1">১ স্টার (★)</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            রিভিউ লোড হচ্ছে...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">কোনো রিভিউ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করুন অথবা নতুন রিভিউ যোগ করুন।</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isHidden = rev.status === 'hidden';
            return (
              <div
                key={rev.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isHidden
                    ? 'bg-rose-50/40 border-rose-200 opacity-80'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left: Customer Info, Product, Rating & Comment */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-700" />
                        <span>{rev.customerName}</span>
                      </span>

                      {/* Stars */}
                      <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                        <span className="ml-1 text-xs font-black text-amber-900">{rev.rating}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isHidden 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {isHidden ? 'গোপন (Hidden from Website)' : '✓ লাইভ (Visible)'}
                      </span>
                    </div>

                    {/* Product Name */}
                    {rev.productName && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-800 font-semibold bg-blue-50/60 px-2.5 py-1 rounded-lg w-fit">
                        <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="line-clamp-1">{rev.productName}</span>
                      </div>
                    )}

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(rev.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Right Action Buttons (Hide / Unhide & Delete) */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1">
                    {/* Hide/Unhide Toggle Button */}
                    <button
                      type="button"
                      id={`toggle-hide-btn-${rev.id}`}
                      onClick={() => handleToggleHide(rev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isHidden
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      }`}
                      title={isHidden ? 'রিভিউটি ওয়েবসাইটে দৃশ্যমান করুন' : 'রিভিউটি ওয়েবসাইট থেকে লুকিয়ে রাখুন'}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>দৃশ্যমান করুন</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>হাইড করুন</span>
                        </>
                      )}
                    </button>

                    {/* Delete Review Button */}
                    <button
                      type="button"
                      id={`delete-review-btn-${rev.id}`}
                      onClick={() => handleDelete(rev)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                      title="স্থায়ীভাবে মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-sm text-slate-900">
                  নতুন রিভিউ যোগ করুন (কাস্টমার মতামত)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  প্রোডাক্ট নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  কাস্টমারের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ (সন্দ্বীপ)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রেটিং (স্টার)</label>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-xs text-amber-900">{newRating} স্টার</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  রিভিউ বা মতামত বক্তব্য <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="পণ্যটির গুণগত মান, ডেলিভারি ও প্যাকেজিং নিয়ে মতামত লিখুন..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'রিভিউ যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
