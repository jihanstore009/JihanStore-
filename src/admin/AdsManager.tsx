import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Upload, 
  Check, 
  X, 
  Clock, 
  MousePointer, 
  Calendar,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Advertisement, AdPosition } from '../types';
import { addAd, updateAd, deleteAd, toggleAdStatus } from '../services/storeService';
import { uploadMedia } from '../firebase/config';
import { AdPerformanceDashboard } from './AdPerformanceDashboard';

interface AdsManagerProps {
  ads: Advertisement[];
}

export const AdsManager: React.FC<AdsManagerProps> = ({ ads }) => {
  const [mainTab, setMainTab] = useState<'ads' | 'performance'>('ads');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    advertiserName: '',
    imageUrl: '',
    targetUrl: '',
    buttonText: 'ভিজিট করুন',
    position: 'homepage' as AdPosition,
    displayOrder: 1,
    startDate: '',
    endDate: '',
    active: true,
    openInNewTab: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Helper to show transient notifications
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingAd(null);
    setForm({
      title: '',
      description: '',
      advertiserName: '',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      targetUrl: '',
      buttonText: 'ভিজিট করুন',
      position: 'homepage',
      displayOrder: (ads.length || 0) + 1,
      startDate: '',
      endDate: '',
      active: true,
      openInNewTab: true
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      title: ad.title || '',
      description: ad.description || '',
      advertiserName: ad.advertiserName || '',
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      buttonText: ad.buttonText || 'ভিজিট করুন',
      position: ad.position || 'homepage',
      displayOrder: ad.displayOrder || 1,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      active: ad.active,
      openInNewTab: ad.openInNewTab !== false
    });
    setIsModalOpen(true);
  };

  // Handle Image File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে হবে।');
      return;
    }

    setIsUploading(true);
    try {
      const downloadUrl = await uploadMedia(file, `advertisements/${Date.now()}_${file.name}`);
      setForm((prev) => ({ ...prev, imageUrl: downloadUrl }));
      notify('বিজ্ঞাপনের ব্যানার ইমেজ সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      console.error('Ad image upload error:', err);
      notify('ছবি আপলোড করতে ব্যর্থ হয়েছে। সরাসরি ইমেজ লিঙ্ক ব্যবহার করুন।', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Safe Protocol Sanitizer
  const isUrlSafe = (url: string) => {
    if (!url) return true;
    const lower = url.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:text')) return false;
    return true;
  };

  // Submit Handler (Add / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      notify('বিজ্ঞাপনের শিরোনাম দিন।', 'error');
      return;
    }
    if (!form.advertiserName.trim()) {
      notify('বিজ্ঞাপনদাতা প্রতিষ্ঠানের নাম দিন।', 'error');
      return;
    }
    if (!form.targetUrl.trim()) {
      notify('বিজ্ঞাপনের গন্তব্য লিঙ্ক (URL / WhatsApp) দিন।', 'error');
      return;
    }
    if (!isUrlSafe(form.targetUrl)) {
      notify('অননুমোদিত বা অনিরাপদ লিঙ্ক দেওয়া হয়েছে! অনুগ্রহ করে সঠিক URL দিন।', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        advertiserName: form.advertiserName.trim(),
        imageUrl: form.imageUrl.trim() || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
        targetUrl: form.targetUrl.trim(),
        buttonText: form.buttonText.trim() || 'ভিজিট করুন',
        position: form.position,
        displayOrder: Number(form.displayOrder) || 1,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        active: Boolean(form.active),
        openInNewTab: Boolean(form.openInNewTab)
      };

      if (editingAd) {
        await updateAd(editingAd.id, payload);
        notify('বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addAd(payload);
        notify('নতুন বিজ্ঞাপন সফলভাবে তৈরি করা হয়েছে এবং লাইভ হয়েছে!');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save ad:', err);
      notify('বিজ্ঞাপন সংরক্ষণ করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await toggleAdStatus(ad.id, !ad.active);
      notify(`বিজ্ঞাপন "${ad.title}" ${!ad.active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'} করা হয়েছে!`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      notify('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Delete Ad
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteAd(deleteTargetId);
      notify('বিজ্ঞাপনটি মুছে ফেলা হয়েছে।');
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete ad:', err);
      notify('বিজ্ঞাপন মুছে ফেলতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Filtered List
  const filteredAds = ads.filter((ad) => {
    if (filterPosition !== 'all' && ad.position !== filterPosition) return false;
    if (filterStatus === 'active' && !ad.active) return false;
    if (filterStatus === 'inactive' && ad.active) return false;
    return true;
  });

  // Calculate Metrics
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressionsCount || 0), 0);
  const activeCount = ads.filter((a) => a.active).length;

  // Position Labels in Bengali
  const getPositionLabel = (pos: AdPosition) => {
    switch (pos) {
      case 'homepage':
        return { label: 'হোমপেজ ব্যানার', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'product_list':
        return { label: 'প্রোডাক্ট তালিকা', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'category_page':
        return { label: 'ক্যাটাগরি পেজ', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'product_details':
        return { label: 'প্রোডাক্ট বিস্তারিত পপআপ', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: pos, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-rose-600 text-white shadow-rose-600/30'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">বিজ্ঞাপন ও স্পন্সরশিপ পরিচালনা (Ad Management)</h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-blue-200/80">
            Customer Website-এ প্রদর্শিত তৃতীয় পক্ষের বিজ্ঞাপন, স্পন্সর ব্যানার, বাহ্যিক লিঙ্ক ও সময়সূচি সম্পূর্ণ নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন Ad যোগ করুন</span>
        </button>
      </div>

      {/* Top Level Nav Tabs: Ad Inventory vs Ad Performance */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainTab('ads')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              mainTab === 'ads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>বিজ্ঞাপন তালিকা ও পরিচালনা</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              mainTab === 'ads' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {ads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('performance')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              mainTab === 'performance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Ad Performance ড্যাশবোর্ড</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Clicks & CTR
            </span>
          </button>
        </div>

        {mainTab === 'ads' && (
          <span className="text-xs text-slate-500 pr-2 hidden sm:inline">
            সক্রিয় বিজ্ঞাপন: <strong className="text-emerald-600">{activeCount}</strong>টি
          </span>
        )}
      </div>

      {mainTab === 'performance' ? (
        <AdPerformanceDashboard
          ads={ads}
          onPreviewAd={(ad) => setPreviewAd(ad)}
          onEditAd={(ad) => {
            setMainTab('ads');
            handleOpenEdit(ad);
          }}
        />
      ) : (
        <>
          {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট বিজ্ঞাপন</span>
            <LayoutGrid className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{ads.length}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">সকল পজিশন মিলিয়ে</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">বর্তমানে সক্রিয় (Live)</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{activeCount}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">কাস্টমার সাইটে দৃশ্যমান</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ক্লিক (Clicks)</span>
            <MousePointer className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-indigo-600">{totalClicks}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">গ্রাহকদের ভিজিট সংখ্যা</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ইমপ্রেশন (Views)</span>
            <Eye className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">{totalImpressions}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">বিজ্ঞাপন প্রদর্শিত হয়েছে</p>
        </div>
      </div>

      {/* Position Filter & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        {/* Placement tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'সকল পজিশন' },
            { id: 'homepage', label: 'হোমপেজ' },
            { id: 'product_list', label: 'প্রোডাক্ট তালিকা' },
            { id: 'category_page', label: 'ক্যাটাগরি পেজ' },
            { id: 'product_details', label: 'প্রোডাক্ট বিস্তারিত' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterPosition(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                filterPosition === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          {[
            { id: 'all', label: 'সবগুলো' },
            { id: 'active', label: 'সক্রিয়' },
            { id: 'inactive', label: 'নিষ্ক্রিয়' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilterStatus(s.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterStatus === s.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Cards Grid / Empty State */}
      {filteredAds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">কোনো বিজ্ঞাপন পাওয়া যায়নি</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            এই ফিল্টারে বর্তমানে কোনো বিজ্ঞাপন নেই। নতুন বিজ্ঞাপন তৈরি করতে উপরের "নতুন Ad যোগ করুন" বাটনে ক্লিক করুন।
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>প্রথম বিজ্ঞাপন যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAds.map((ad) => {
            const posBadge = getPositionLabel(ad.position);
            return (
              <div
                key={ad.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 shadow-xs transition hover:shadow-md ${
                  ad.active ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                }`}
              >
                <div>
                  {/* Top Bar: Position, Active Switch, Actions */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${posBadge.color}`}>
                        {posBadge.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        ক্রম: #{ad.displayOrder}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(ad)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                          ad.active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={ad.active ? 'নিষ্ক্রিয় করতে ক্লিক করুন' : 'সক্রিয় করতে ক্লিক করুন'}
                      >
                        {ad.active ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Creative & Content */}
                  <div className="mt-3 flex items-start gap-3">
                    {ad.imageUrl && (
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {ad.advertiserName}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-slate-900 line-clamp-1">
                        {ad.title}
                      </h4>
                      {ad.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Destination Link details */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs flex items-center justify-between gap-2 border border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-600 truncate font-mono text-[11px]">
                        {ad.targetUrl}
                      </span>
                    </div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 shrink-0">
                      {ad.buttonText || 'ভিজিট করুন'}
                    </span>
                  </div>

                  {/* Date range if scheduled */}
                  {(ad.startDate || ad.endDate) && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>
                        মেয়াদ: {ad.startDate || 'এখন থেকে'} - {ad.endDate || 'স্থায়ী'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Footer: Stats & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3 text-blue-500" />
                      {ad.clicksCount || 0} ক্লিক
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-amber-500" />
                      {ad.impressionsCount || 0} ভিউ
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewAd(ad)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="লাইভ প্রিভিউ দেখুন"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ad)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                      title="এডিট করুন"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(ad.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* CREATE / EDIT AD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingAd ? 'বিজ্ঞাপন এডিট করুন' : 'নতুন বিজ্ঞাপন তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    নিচের তথ্যগুলো পূরণ করুন। কাস্টমার ওয়েবসাইটে স্বয়ংক্রিয়ভাবে লাইভ হবে।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Row 1: Title & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিজ্ঞাপনের শিরোনাম (Ad Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="যেমন: সন্দ্বীপ এক্সপ্রেস পার্সেল সার্ভিস"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিজ্ঞাপনদাতা / স্পন্সর নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.advertiserName}
                    onChange={(e) => setForm({ ...form, advertiserName: e.target.value })}
                    placeholder="যেমন: Sandwip Express Logistics"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Short Description)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="বিজ্ঞাপনের ছোট আকর্ষণীয় অফার বা বর্ণনা..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Row 2: Target URL & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    গন্তব্য লিঙ্ক (Website / WhatsApp / App URL) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.targetUrl}
                      onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                      placeholder="https://example.com বা https://wa.me/8801867841638"
                      className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    />
                    <ExternalLink className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বাটন টেক্সট (CTA Text)
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="ভিজিট করুন"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Position & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিজ্ঞাপনের অবস্থান (Ad Placement) *
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value as AdPosition })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="homepage">হোমপেজ (ক্যাটাগরি ও প্রোডাক্ট তালিকার মাঝে)</option>
                    <option value="product_list">প্রোডাক্ট তালিকা (ক্যাটালগের মাঝে)</option>
                    <option value="category_page">ক্যাটাগরি পেজ ফিল্টার</option>
                    <option value="product_details">প্রোডাক্ট বিস্তারিত পপআপ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রদর্শনের ক্রম (Display Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্যানার বা ক্রিয়েটিভ ছবি (Creative Image)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="ছবির ওয়েব লিঙ্ক (URL) দিন অথবা ডানপাশের বোতামে আপলোড করুন"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />

                  <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে আপলোড'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Row 5: Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শুরুর তারিখ (Start Date - ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শেষ তারিখ (End Date - ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 6: Toggles */}
              <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    সক্রিয় রাখুন (Active / Show to Customers)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.openInNewTab}
                    onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    ক্লিক করলে নতুন ট্যাবে খুলবে (Open in new tab)
                  </span>
                </label>
              </div>

              {/* Real-time Preview in Modal */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mb-2">
                  <Eye className="h-3 w-3" />
                  কাস্টমার ওয়েবসাইটে যেমন দেখাবে (Live Preview):
                </p>
                <div className="rounded-xl overflow-hidden bg-slate-900 text-white p-3.5 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {form.imageUrl && (
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="h-12 w-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-amber-300 uppercase bg-amber-400/20 px-1 rounded">
                          স্পন্সরড
                        </span>
                        <span className="text-[10px] text-blue-200 truncate">
                          {form.advertiserName || 'বিজ্ঞাপনদাতা নাম'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {form.title || 'বিজ্ঞাপনের শিরোনাম'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shrink-0 flex items-center gap-1"
                  >
                    <span>{form.buttonText || 'ভিজিট করুন'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : editingAd ? 'আপডেট করুন' : 'তৈরি ও প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDALONE LIVE PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">বিজ্ঞাপন লাইভ প্রিভিউ</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                পজিশন: <strong className="text-slate-800">{previewAd.position}</strong> | ক্রম:{' '}
                <strong className="text-slate-800">#{previewAd.displayOrder}</strong> | অবস্থা:{' '}
                <strong className={previewAd.active ? 'text-emerald-600' : 'text-slate-500'}>
                  {previewAd.active ? 'Active' : 'Inactive'}
                </strong>
              </p>

              {/* Banner visual simulation */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {previewAd.imageUrl && (
                    <img
                      src={previewAd.imageUrl}
                      alt={previewAd.title}
                      className="h-16 w-24 object-cover rounded-xl shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                        স্পন্সরড
                      </span>
                      <span className="text-xs text-blue-200">{previewAd.advertiserName}</span>
                    </div>
                    <h4 className="mt-1 text-sm font-bold">{previewAd.title}</h4>
                    {previewAd.description && (
                      <p className="text-xs text-slate-300 mt-0.5">{previewAd.description}</p>
                    )}
                  </div>
                </div>

                <a
                  href={previewAd.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shrink-0 inline-flex items-center gap-1.5 hover:bg-amber-300"
                >
                  <span>{previewAd.buttonText || 'ভিজিট করুন'}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                <p>
                  <strong>গন্তব্য লিঙ্ক:</strong> <span className="font-mono text-blue-600">{previewAd.targetUrl}</span>
                </p>
                <p>
                  <strong>মোট ক্লিক:</strong> {previewAd.clicksCount || 0} বার
                </p>
                <p>
                  <strong>মোট ইমপ্রেশন:</strong> {previewAd.impressionsCount || 0} বার
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">বিজ্ঞাপন মুছে ফেলবেন?</h4>
                <p className="text-xs text-slate-500">এটি কাস্টমার ওয়েবসাইট থেকেও তৎক্ষণাৎ মুছে যাবে।</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
