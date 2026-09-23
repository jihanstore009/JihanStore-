import React from 'react';
import { ShoppingBag, Star, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onBuyNow,
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock && product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock && product.stock > 0) {
      onBuyNow(product);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300/80 transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-xs">
            -{product.discount}%
          </div>
        )}

        {/* Featured Tag */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 fill-current" />
            <span>ফিচার্ড</span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {(!product.inStock || product.stock <= 0) && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              স্টক শেষ
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="truncate max-w-[90px] sm:max-w-[120px] font-medium text-blue-700">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewCount || 1})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 flex-wrap mt-1">
            <span className="font-extrabold text-sm sm:text-base text-blue-700">
              ৳{product.price.toLocaleString('bn-BD')}
            </span>
            {product.previousPrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                ৳{product.previousPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div className="mt-1 flex items-center gap-1 text-[10px] font-medium">
            {product.inStock && product.stock > 0 ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>স্টকে আছে ({product.stock})</span>
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>স্টক আউট</span>
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
            <button
              id={`add-cart-${product.id}`}
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stock <= 0}
              className="min-h-[38px] sm:min-h-[40px] px-2 py-1.5 rounded-xl border border-blue-700 text-blue-700 hover:bg-blue-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all"
              title="কার্টে যোগ করুন"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">কার্ট</span>
            </button>

            <button
              id={`buy-now-${product.id}`}
              onClick={handleBuyNow}
              disabled={!product.inStock || product.stock <= 0}
              className="min-h-[38px] sm:min-h-[40px] px-2 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-[11px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all"
              title="সরাসরি অর্ডার করুন"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>অর্ডার</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
