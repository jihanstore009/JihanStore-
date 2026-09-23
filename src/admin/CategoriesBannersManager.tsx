import React, { useState } from 'react';
import { 
  Layers, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  ExternalLink, 
  Sliders, 
  Tag 
} from 'lucide-react';
import { Category, Banner } from '../types';
import { addCategory, deleteCategory, addBanner, deleteBanner } from '../services/storeService';
import { uploadMedia } from '../firebase/config';

interface CategoriesBannersManagerProps {
  categories: Category[];
  banners: Banner[];
}

export const CategoriesBannersManager: React.FC<CategoriesBannersManagerProps> = ({
  categories,
  banners
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'categories'>('banners');

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Banner form state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    badge: 'স্পেশাল অফার',
    link: '',
    active: true
  });
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAddingCat(true);
    try {
      const slug = newCatName.toLowerCase().trim().replace(/\s+/g, '-');
      await addCategory({
        name: newCatName.trim(),
        slug,
        icon: newCatIcon
      });
      setNewCatName('');
    } catch (err) {
      console.error('Failed to add category:', err);
    } finally {
      setIsAddingCat(false);
    }
  };

  // Add Banner Handler
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.image.trim()) {
      alert('ব্যানার শিরোনাম এবং ইমেজ আবশ্যক।');
      return;
    }

    setIsSavingBanner(true);
    try {
      await addBanner({
        title: bannerForm.title.trim(),
        subtitle: bannerForm.subtitle.trim(),
        image: bannerForm.image.trim(),
        imageUrl: bannerForm.image.trim(),
        badge: bannerForm.badge.trim(),
        link: bannerForm.link.trim(),
        active: bannerForm.active,
        order: banners.length + 1
      });
      setIsBannerModalOpen(false);
      setBannerForm({
        title: '',
        subtitle: '',
        image: '',
        badge: 'স্পেশাল অফার',
        link: '',
        active: true
      });
    } catch (err) {
      console.error('Failed to add banner:', err);
    } finally {
      setIsSavingBanner(false);
    }
  };

  // Handle Banner Image File Upload
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const url = await uploadMedia(file, `banners/slide_${Date.now()}`);
      setBannerForm({ ...bannerForm, image: url });
    } catch (err) {
      console.error('Failed to upload banner:', err);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'banners' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>হিরো স্লাইডার ব্যানার ({banners.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ক্যাটাগরি ম্যানেজমেন্ট ({categories.length})</span>
        </button>
      </div>

      {/* BANNERS SECTION */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">হোমপেজ হিরো ব্যানারসমূহ</h3>
              <p className="text-xs text-slate-400">কাস্টমার ওয়েবসাইটের প্রধান স্লাইডারে প্রদর্শিত অফার ও বিজ্ঞাপন</p>
            </div>
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্যানার যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={banner.imageUrl || banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {banner.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] rounded-lg shadow-md">
                      {banner.badge}
                    </span>
                  )}
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl shadow-md transition-colors"
                    title="ব্যানার মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{banner.title}</h4>
                  <p className="text-xs text-slate-500">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES SECTION */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-3">নতুন ক্যাটাগরি তৈরি করুন</h4>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="ক্যাটাগরির নাম (যেমন: Gaming Accessories)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isAddingCat}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>যোগ করুন</span>
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{cat.name}</h5>
                    <span className="text-[10px] text-slate-400">/{cat.slug}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  title="মুছুন"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW BANNER MODAL */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">নতুন ব্যানার যোগ করুন</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="যেমন: আকর্ষণীয় স্মার্টওয়াচ অফার"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="যেমন: সন্দ্বীপে ফ্রি হোম ডেলিভারি ও বিশেষ মূল্যছাড়"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অফার ব্যাজ</label>
                <input
                  type="text"
                  value={bannerForm.badge}
                  onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                  placeholder="যেমন: সেরা ডিল / ৫০% ছাড়"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Banner Image URL or Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার ছবি (Image) *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  placeholder="ছবির লিংক দিন অথবা নিচে আপলোড করুন..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে ব্যানার আপলোড</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileUpload} />
                  </label>
                  {isUploadingBanner && <span className="text-xs text-blue-600 animate-pulse">আপলোড হচ্ছে...</span>}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  {isSavingBanner ? 'সংরক্ষণ হচ্ছে...' : 'ব্যানার যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
