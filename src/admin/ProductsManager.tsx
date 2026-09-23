import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Star, 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  AlertCircle 
} from 'lucide-react';
import { Product, Category } from '../types';
import { saveProduct, deleteProduct } from '../services/storeService';
import { uploadMedia } from '../firebase/config';

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({ products, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: categories[0]?.name || 'Smart Watch',
    price: 0,
    previousPrice: 0,
    stock: 10,
    inStock: true,
    featured: false,
    popular: false,
    description: '',
    details: '',
    deliveryInfo: 'সন্দ্বীপ পোস্টকোড ৪৩০১ এ ফ্রি হোম ডেলিভারি ও দ্রুত সার্ভিস।',
    images: ['']
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: categories[0]?.name || 'Smart Watch',
      price: 0,
      previousPrice: 0,
      stock: 10,
      inStock: true,
      featured: false,
      popular: false,
      description: '',
      details: '',
      deliveryInfo: 'সন্দ্বীপ পোস্টকোড ৪৩০১ এ ফ্রি হোম ডেলিভারি ও দ্রুত সার্ভিস।',
      images: ['']
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      previousPrice: product.previousPrice || 0,
      stock: product.stock,
      inStock: product.inStock,
      featured: !!product.featured,
      popular: !!product.popular,
      description: product.description || '',
      details: product.details || '',
      deliveryInfo: product.deliveryInfo || 'সন্দ্বীপ পোস্টকোড ৪৩০১ এ ফ্রি হোম ডেলিভারি ও দ্রুত সার্ভিস।',
      images: product.images && product.images.length > 0 ? [...product.images] : ['']
    });
    setIsModalOpen(true);
  };

  // Image Upload Handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);
    try {
      const url = await uploadMedia(file, `products/img_${Date.now()}`);
      const updatedImages = [...form.images];
      updatedImages[index] = url;
      setForm({ ...form, images: updatedImages });
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadProgress(false);
    }
  };

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ''] });
  };

  const removeImageField = (index: number) => {
    if (form.images.length <= 1) {
      setForm({ ...form, images: [''] });
      return;
    }
    const filtered = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: filtered });
  };

  // Save product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) {
      alert('দয়া করে পণ্যের সঠিক নাম এবং বিক্রয় মূল্য দিন।');
      return;
    }

    setIsSaving(true);
    try {
      // Clean images
      const validImages = form.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        validImages.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
      }

      // Calculate discount percentage
      let discount = 0;
      if (form.previousPrice > form.price) {
        discount = Math.round(((form.previousPrice - form.price) / form.previousPrice) * 100);
      }

      const productPayload: Omit<Product, 'id' | 'createdAt'> = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        previousPrice: form.previousPrice > 0 ? Number(form.previousPrice) : undefined,
        discount: discount > 0 ? discount : undefined,
        stock: Number(form.stock),
        inStock: Boolean(form.inStock && form.stock > 0),
        images: validImages,
        description: form.description.trim(),
        details: form.details.trim(),
        deliveryInfo: form.deliveryInfo.trim(),
        featured: Boolean(form.featured),
        popular: Boolean(form.popular),
        rating: editingProduct?.rating || 4.8,
        reviewCount: editingProduct?.reviewCount || 12
      };

      await saveProduct(productPayload, editingProduct?.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('পণ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Category Filter, and Add Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="পণ্য বা ক্যাটাগরির নাম দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রোডাক্ট যোগ করুন</span>
          </button>
        </div>

        {/* Categories selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল ক্যাটাগরি ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(p => p.category === cat.name).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">"নতুন প্রোডাক্ট যোগ করুন" বাটনে ক্লিক করে পণ্য তৈরি করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">পণ্য</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">বিক্রয় মূল্য</th>
                  <th className="py-3 px-4">পূর্বের মূল্য ও ছাড়</th>
                  <th className="py-3 px-4">স্টক</th>
                  <th className="py-3 px-4">ব্যাজ</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const primaryImg = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                  return (
                    <tr key={product.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="max-w-xs">
                            <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                            <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold">{product.rating || 4.8}</span>
                              <span className="text-slate-400">({product.reviewCount || 10} রিভিউ)</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 text-sm">
                        ৳{product.price}
                      </td>
                      <td className="py-3 px-4">
                        {product.previousPrice ? (
                          <div>
                            <span className="line-through text-slate-400 text-xs">৳{product.previousPrice}</span>
                            {product.discount && (
                              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.inStock && product.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{product.inStock && product.stock > 0 ? `${product.stock} পিস স্টক` : 'স্টক আউট'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> ফিচার্ড
                            </span>
                          )}
                          {product.popular && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> পপুলার
                            </span>
                          )}
                          {!product.featured && !product.popular && (
                            <span className="text-slate-400 text-xs">সাধারণ</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            title="এডিট করুন"
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            title="মুছে ফেলুন"
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  এখানে পরিবর্তন করলে Customer Website-এ সাথে সাথে আপডেট হবে।
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="যেমন: T900 Ultra 2 Smartwatch"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Category & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্টক পরিমাণ *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price & Previous Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পূর্বের মূল্য / রেগুলার প্রাইজ (৳) - অপশনাল
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.previousPrice}
                    onChange={(e) => setForm({ ...form, previousPrice: Number(e.target.value) })}
                    placeholder="ছাড় দেখানোর জন্য দিন"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.previousPrice > form.price && (
                    <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
                      স্বয়ংক্রিয় ডিসকাউন্ট: {Math.round(((form.previousPrice - form.price) / form.previousPrice) * 100)}% ছাড়
                    </span>
                  )}
                </div>
              </div>

              {/* Badges & InStock Toggles */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>স্টকে আছে (In Stock)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>ফিচার্ড কালেকশনে দেখান (Featured)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>পপুলার / বেস্ট সেলার ব্যাজ</span>
                </label>
              </div>

              {/* Product Images Management */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    পণ্যের ছবি (Image Upload / URL) *
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>আরো ছবি যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {form.images.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      {/* Thumbnail preview */}
                      <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                        {imgUrl ? (
                          <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Inputs: URL or File */}
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const newArr = [...form.images];
                            newArr[index] = e.target.value;
                            setForm({ ...form, images: newArr });
                          }}
                          placeholder="ছবির লিংক পেস্ট করুন..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px] transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>ডিভাইস থেকে আপলোড</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, index)}
                            />
                          </label>
                          {uploadProgress && <span className="text-[10px] text-blue-600 animate-pulse">আপলোড হচ্ছে...</span>}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের বিস্তারিত বিবরণ (Description) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="পণ্যের বৈশিষ্ট্য, সুযোগ সুবিধা সংক্ষেপে লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Specifications / Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্পেসিফিকেশন / টেকনিক্যাল বিবরণ (Details)
                </label>
                <textarea
                  rows={2}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="যেমন: Bluetooth 5.3 | Battery: 280mAh | Warranty: 1 Month..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Delivery Info */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ডেলিভারি তথ্য নোট (Delivery Info)
                </label>
                <input
                  type="text"
                  value={form.deliveryInfo}
                  onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs sm:text-sm"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'প্রোডাক্ট সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">প্রোডাক্টটি নিশ্চিত মুছতে চান?</h4>
            <p className="text-xs text-slate-500">
              এটি ডাটাবেজ থেকে মুছে যাবে এবং কাস্টমার ওয়েবসাইট থেকেও সাথে সাথে সরে যাবে।
            </p>
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
