import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Zap, 
  Star, 
  Truck, 
  ShieldCheck, 
  Share2, 
  CheckCircle2, 
  Plus, 
  Minus, 
  MessageCircle,
  Clock
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { subscribeToReviews, addProductReview } from '../services/storeService';
import { AdBannerArea } from './AdBannerArea';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || '');
      setQuantity(1);
      setActiveTab('details');

      const unsubscribe = subscribeToReviews(product.id, (revs) => {
        setReviews(revs);
      });
      return () => unsubscribe();
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addProductReview({
        productId: product.id,
        productName: product.name,
        customerName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess(true);
      setReviewComment('');
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // WhatsApp order inquiry URL
  const waText = encodeURIComponent(`আসসালামু আলাইকুম, আমি জিহান স্টোর থেকে এই প্রোডাক্টটি নিতে চাই:\n*${product.name}*\nমূল্য: ৳${product.price}`);
  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        id="product-detail-modal"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          id="product-detail-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-xs text-slate-700 hover:text-slate-900 hover:bg-white rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                <img
                  src={selectedImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === img ? 'border-blue-700 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges under image */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 font-medium">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>সন্দ্বীপে ফ্রি হোম ডেলিভারি</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>১০০% আসল ও কোয়ালিটি পণ্য</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Information */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-xs">
                  {product.category}
                </span>

                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2 leading-snug">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({product.reviewCount || reviews.length} টি রিভিউ)</span>
                </div>

                {/* Pricing Block */}
                <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-blue-800">
                    ৳{product.price.toLocaleString('bn-BD')}
                  </span>
                  {product.previousPrice && (
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      ৳{product.previousPrice.toLocaleString('bn-BD')}
                    </span>
                  )}
                  {product.discount && (
                    <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold text-xs rounded-full">
                      -{product.discount}% ছাড়
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">স্টক অবস্থা:</span>
                  {product.inStock && product.stock > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>স্টকে আছে ({product.stock} টি উপলব্ধ)</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">স্টক শেষ (Out of Stock)</span>
                  )}
                </div>

                {/* Short Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Quantity Selector */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-black text-slate-800 min-w-[32px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="detail-add-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!product.inStock || product.stock <= 0}
                    className="py-3 px-4 rounded-xl border-2 border-blue-700 text-blue-700 hover:bg-blue-50 active:scale-95 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>

                  <button
                    id="detail-buy-now-btn"
                    onClick={handleBuyNowClick}
                    disabled={!product.inStock || product.stock <= 0}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-40"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>এখনই কিনুন</span>
                  </button>
                </div>

                {/* WhatsApp Quick Order Inquiry */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার / তথ্য জানুন</span>
                </a>
              </div>
            </div>
          </div>

          {/* Details & Reviews Tabs */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                প্রোডাক্ট স্পেসিফিকেশন ও বিবরণ
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                কাস্টমার রিভিউ ({reviews.length})
              </button>
            </div>

            {/* Tab 1: Details */}
            {activeTab === 'details' && (
              <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">স্পেসিফিকেশন:</h4>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {product.details || 'উচ্চমানের ম্যাটেরিয়াল ও দীর্ঘস্থায়ী নির্ভরযোগ্য পারফরম্যান্স।'}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">ডেলিভারি সংক্রান্ত তথ্য:</h4>
                  <p className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-900">
                    {product.deliveryInfo || 'সন্দ্বীপ পোস্টকোড ৪৩০১ এ ২৪-৪৮ ঘণ্টার মধ্যে ফ্রি ডেলিভারি। সন্দ্বীপের বাইরে ক্যাশ অন ডেলিভারি ২-৩ কর্মদিবসে।'}
                  </p>
                </div>

                {/* Sponsored Ad Area */}
                <AdBannerArea position="product_details" variant="compact" className="pt-2" />
              </div>
            )}

            {/* Tab 2: Reviews */}
            {activeTab === 'reviews' && (
              <div className="py-4 space-y-6">
                {/* Write Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800">আপনার মতামত বা রিভিউ দিন:</h4>
                  
                  {reviewSuccess && (
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold">
                      ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">রেটিং:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="আপনার নাম..."
                      className="p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="পণ্যটির গুণগত মান সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </form>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">এখনো কোনো রিভিউ দেওয়া হয়নি। আপনিই প্রথম রিভিউ দিন!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{rev.customerName}</span>
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{rev.comment}</p>
                        <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
