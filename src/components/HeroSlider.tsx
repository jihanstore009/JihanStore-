import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Banner } from '../types';

interface HeroSliderProps {
  banners: Banner[];
  onExplore: (category?: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, onExplore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
      <div 
        id="hero-banner-slider"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/60 aspect-[16/7] sm:aspect-[21/8] min-h-[190px] sm:min-h-[280px] bg-slate-900"
      >
        {/* Background Image with Dark Gradient Overlay */}
        <img
          src={currentBanner.imageUrl || currentBanner.image}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 scale-100 hover:scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center" />

        {/* Content Box */}
        <div className="relative z-10 p-5 sm:p-10 max-w-xl text-white space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>সন্দ্বীপে ফ্রি হোম ডেলিভারি</span>
          </div>

          <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {currentBanner.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-md">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2">
            <button
              id="hero-shop-btn"
              onClick={() => onExplore(currentBanner.link)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 flex items-center gap-2 transition-all"
            >
              <span>পণ্যসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
