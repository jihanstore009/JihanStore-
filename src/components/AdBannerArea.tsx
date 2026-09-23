import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { AdPosition, Advertisement } from '../types';
import { trackAdClick, trackAdImpression } from '../services/storeService';

interface AdBannerAreaProps {
  position: AdPosition;
  className?: string;
  variant?: 'banner' | 'card' | 'compact';
  maxItems?: number;
}

// Security sanitizer to prevent javascript: or malformed URLs
function getSafeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('https://wa.me/')
  ) {
    return trimmed;
  }
  // If user entered plain domain like "example.com" or "wa.me/..."
  if (trimmed.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
    return `https://${trimmed}`;
  }
  return null;
}

export const AdBannerArea: React.FC<AdBannerAreaProps> = ({
  position,
  className = '',
  variant = 'banner',
  maxItems = 1
}) => {
  const { ads } = useSettings();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Filter active and eligible ads for this position
  const activeAds = (ads || [])
    .filter((ad) => {
      if (!ad.active) return false;
      if (ad.position !== position) return false;
      if (dismissedIds.includes(ad.id)) return false;

      const now = new Date().getTime();
      if (ad.startDate) {
        const start = new Date(ad.startDate).getTime();
        if (!isNaN(start) && now < start) return false;
      }
      if (ad.endDate) {
        const end = new Date(ad.endDate).getTime();
        // End of the specified date
        if (!isNaN(end) && now > end + 86400000) return false;
      }

      return true;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .slice(0, maxItems);

  // Track impressions on mount
  useEffect(() => {
    activeAds.forEach((ad) => {
      trackAdImpression(ad.id);
    });
  }, [activeAds.map((a) => a.id).join(',')]);

  // If no ads configured or all inactive, render nothing
  if (activeAds.length === 0) {
    return null;
  }

  const handleAdClick = (e: React.MouseEvent, ad: Advertisement) => {
    e.preventDefault();
    const safeUrl = getSafeUrl(ad.targetUrl);
    if (!safeUrl) return;

    // Track click event asynchronously
    trackAdClick(ad.id);

    // Open safely in new tab or current tab
    if (ad.openInNewTab !== false) {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = safeUrl;
    }
  };

  const handleDismiss = (e: React.MouseEvent, adId: string) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, adId]);
  };

  return (
    <div className={`space-y-4 ${className}`} id={`ad-area-${position}`}>
      {activeAds.map((ad) => {
        const safeUrl = getSafeUrl(ad.targetUrl);

        // Compact Variant (e.g. for Product Details modal or sidebar)
        if (variant === 'compact' || position === 'product_details') {
          return (
            <div
              key={ad.id}
              onClick={(e) => handleAdClick(e, ad)}
              className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-blue-50/50 p-3 shadow-xs transition hover:border-amber-300 cursor-pointer"
            >
              <div className="flex items-center justify-between pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                    স্পন্সরড
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 truncate max-w-[140px]">
                    {ad.advertiserName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, ad.id)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="বিজ্ঞাপন বন্ধ করুন"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {ad.imageUrl && (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover border border-slate-100"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {ad.title}
                  </h4>
                  {ad.description && (
                    <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">
                      {ad.description}
                    </p>
                  )}
                  {safeUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleAdClick(e, ad)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      <span>{ad.buttonText || 'ভিজিট করুন'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Full Responsive Banner Variant (e.g. Homepage or Product List)
        return (
          <div
            key={ad.id}
            onClick={(e) => handleAdClick(e, ad)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md transition duration-200 hover:shadow-lg cursor-pointer"
          >
            {/* Background ambient lighting */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5">
              {/* Creative Image or Thumbnail */}
              <div className="flex w-full md:w-auto items-center gap-4">
                {ad.imageUrl && (
                  <div className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-sm">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="h-18 w-24 sm:h-20 sm:w-28 object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Content details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                      স্পন্সরড বিজ্ঞাপন
                    </span>
                    <span className="text-xs text-blue-200/80 font-medium truncate">
                      {ad.advertiserName}
                    </span>
                  </div>

                  <h4 className="mt-1 text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-blue-100">
                    {ad.title}
                  </h4>

                  {ad.description && (
                    <p className="mt-0.5 text-xs text-slate-300 line-clamp-1 sm:line-clamp-2 max-w-xl">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button & Dismiss */}
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-white/10 md:border-none">
                <button
                  type="button"
                  onClick={(e) => handleDismiss(e, ad.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  title="বিজ্ঞাপন বন্ধ করুন"
                >
                  <X className="h-4 w-4" />
                </button>

                {safeUrl && (
                  <button
                    type="button"
                    onClick={(e) => handleAdClick(e, ad)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-sm transition hover:from-amber-300 hover:to-amber-400 active:scale-95 whitespace-nowrap"
                  >
                    <span>{ad.buttonText || 'ভিজিট করুন'}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
