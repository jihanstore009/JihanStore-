import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  X, 
  User, 
  Package, 
  Calendar,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { Product, Review } from '../types';
import { subscribeToAllReviews, addProductReview } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

interface CustomerReviewsSectionProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  products,
  onSelectProduct
}) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Auto-fill customer name if user logged in
  useEffect(() => {
    if (currentUser?.displayName && !customerName) {
      setCustomerName(currentUser.displayName);
    }
  }, [currentUser]);

  // Subscribe to reviews in real-time
  useEffect(() => {
    const unsub = subscribeToAllReviews((allRevs) => {
      // ONLY show approved reviews on website - hidden reviews remain invisible!
      const approved = allRevs.filter(r => r.status === 'approved');
      setReviews(approved);
    });
    return () => unsub();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const selectedProd = products.find(p => p.id === selectedProductId);
      const prodName = selectedProd ? selectedProd.name : 'JIHAN STORE - অনলাইন শপিং';
      const prodId = selectedProd ? selectedProd.id : (products[0]?.id || 'general');

      await addProductReview({
        productId: prodId,
        productName: prodName,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim()
      });

      setSuccessNotice('আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশিত হয়েছে! ধন্যবাদ।');
      setComment('');
      setIsModalOpen(false);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <section id="reviews-section" className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>১০০% সন্তুষ্ট গ্রাহকদের মতামত</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>কাস্টমার রিভিউ ও অভিজ্ঞতা</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              সন্দ্বীপ ও সারাদেশে আমাদের সম্মানিত কাস্টমারদের সত্য ও খাঁটি ফিডব্যাক। আপনিও আমাদের সার্ভিস বা প্রোডাক্ট নিয়ে রিভিউ দিন।
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Rating Summary Card */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-black text-slate-900 font-mono">{avgRating}</span>
                <span className="text-slate-400 font-medium"> ({totalReviews} রিভিউ)</span>
              </div>
            </div>

            {/* Write Review Button */}
            <button
              type="button"
              id="open-write-review-modal-btn"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-800/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>রিভিউ দিন</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">এখনো কোনো রিভিউ দেওয়া হয়নি</p>
            <p className="text-xs text-slate-400">প্রথম রিভিউটি দিয়ে অন্যদের সিদ্ধান্ত নিতে সাহায্য করুন!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              প্রথম রিভিউ লিখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  {/* Top: Customer & Stars */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                        {rev.customerName ? rev.customerName[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {rev.customerName}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>ভেরিফাইড ক্রেতা</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Product Tag */}
                  {rev.productName && (
                    <div 
                      onClick={() => {
                        const prod = products.find(p => p.id === rev.productId || p.name === rev.productName);
                        if (prod && onSelectProduct) onSelectProduct(prod);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 text-blue-900 text-[11px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer max-w-full"
                    >
                      <Package className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">{rev.productName}</span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer: Date & Verified */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Jihan Store Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  আপনার রিভিউ বা মতামত লিখুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs sm:text-sm">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কোন প্রোডাক্ট নিয়ে মতামত দিচ্ছেন? (ঐচ্ছিক)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium cursor-pointer"
                >
                  <option value="">সার্বিক শপিং ও ডেলিভারি অভিজ্ঞতা (Jihan Store)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  রেটিং সিলেক্ট করুন: <span className="text-amber-500 font-black">{hoverRating || rating} স্টার</span>
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${(hoverRating || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ (সন্দ্বীপ)"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার অভিজ্ঞতা ও বিস্তারিত মতামত <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="প্রোডাক্টের কোয়ালিটি, ডেলিভারির গতি ও ব্যবহারের অভিজ্ঞতা সম্পর্কে লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>আপনার রিভিউ সরাসরি ওয়েবসাইটে প্রকাশ পাবে। অ্যাডমিন প্যানেল থেকে এটি সম্পূর্ণ নিরীক্ষণযোগ্য।</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? 'প্রকাশ হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
