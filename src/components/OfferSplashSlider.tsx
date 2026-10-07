'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CarFront,
  Calendar,
  Tag,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Percent,
} from 'lucide-react';
import type { BannerItem } from '../types/banner';
import { useBookingModal } from '../context/BookingModalContext';
import { useOffers } from '../context/OfferContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface OfferSplashSliderProps {
  /** If passed, forces slider open (e.g. from floating button or test preview) */
  forceOpen?: boolean;
  onClose?: () => void;
  /** Custom banners for test preview mode */
  previewBanners?: BannerItem[];
}

export function OfferSplashSlider({
  forceOpen,
  onClose,
  previewBanners,
}: OfferSplashSliderProps) {
  const offerContext = useOffers();
  const { lang, t } = useLanguage();
  const [banners, setBanners] = useState<BannerItem[]>(previewBanners || []);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Record<number, string>>({});
  const [autoCloseRemaining, setAutoCloseRemaining] = useState(15);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);

  const { open: openBooking } = useBookingModal();

  // Sync with OfferContext banners if not previewBanners
  useEffect(() => {
    if (previewBanners && previewBanners.length > 0) {
      setBanners(previewBanners);
      setIsOpen(true);
      return;
    }

    if (offerContext.banners && offerContext.banners.length > 0) {
      setBanners(offerContext.banners);
    }
  }, [previewBanners, offerContext.banners]);

  // Sync with context isOpen or forceOpen prop
  useEffect(() => {
    if (forceOpen || offerContext.isOpen) {
      setIsOpen(true);
    }
  }, [forceOpen, offerContext.isOpen]);


  // Handle slide rotation
  useEffect(() => {
    if (!isOpen || banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen, banners.length, isPaused]);

  // Auto-close countdown (optional, pauses on hover)
  useEffect(() => {
    if (!isOpen || !autoCloseEnabled || isPaused) return;

    const interval = setInterval(() => {
      setAutoCloseRemaining((prev) => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseEnabled, isPaused]);

  // Close handler with session recording
  const handleClose = useCallback(() => {
    setIsOpen(false);
    offerContext.closeOffers();
    if (!previewBanners) {
      sessionStorage.setItem('ce_offer_splash_dismissed', 'true');
    }
    if (onClose) onClose();
  }, [previewBanners, onClose, offerContext]);


  // Escape key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  // Selected vehicle for current banner
  const currentVehicle =
    selectedVehicles[currentBanner.id] ||
    currentBanner.vehicle_type ||
    currentBanner.available_vehicles?.[0] ||
    'Sedan (Dzire / Etios)';

  // Calculate savings and discount percentage
  const actualPrice = Number(currentBanner.actual_price) || 0;
  const offerPrice = Number(currentBanner.offer_price) || 0;
  const savings = Math.max(0, actualPrice - offerPrice);
  const discountPercent =
    actualPrice > 0 ? Math.round((savings / actualPrice) * 100) : 0;

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleClaimOffer = () => {
    handleClose();
    openBooking({
      pickup: currentBanner.from_city,
      drop: currentBanner.to_city,
      vehicle: currentVehicle,
      offerCode: currentBanner.quotation_ref,
      offerPrice: currentBanner.offer_price,
      actualPrice: currentBanner.actual_price,
      tripType: currentBanner.trip_type || 'One Way',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-splash-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-400/30 bg-zinc-950 text-white shadow-2xl shadow-amber-500/10">
        {/* Glowing Ambient Top Accent */}
        <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-zinc-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/20">
              <Sparkles className="h-3 w-3" /> Festive Special Offer
            </span>
            {banners.length > 1 && (
              <span className="hidden sm:inline-block text-xs font-medium text-zinc-400">
                Offer {currentIndex + 1} of {banners.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            {autoCloseEnabled && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> {t('autoCloseIn')} {autoCloseRemaining}s
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20 hover:text-white"
              aria-label="Close offer banner"
            >
              <X className="h-4 w-4 transition group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Main Banner Visual & Content */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Visual Banner Card with Image */}
          <div className="relative lg:col-span-5 min-h-[220px] lg:min-h-[420px] overflow-hidden bg-zinc-900">
            <img
              src={currentBanner.banner_image || '/images/special-offer-banner.jpg'}
              alt={currentBanner.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />

            {/* Discount Badge on Image */}
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 z-10 flex flex-col items-start rounded-xl bg-amber-400 px-3.5 py-1.5 font-black text-zinc-950 shadow-xl shadow-amber-900/40">
                <span className="text-xs uppercase tracking-wider">Flat</span>
                <span className="text-xl font-black leading-tight sm:text-2xl">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {/* Route Highlights on Image Bottom */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="rounded-xl border border-white/20 bg-black/70 p-3 backdrop-blur-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {currentBanner.trip_type || 'One Way'} Route Deal
                </p>
                <div className="mt-1 flex items-center justify-between font-black text-white">
                  <span className="truncate text-base">{currentBanner.from_city}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-amber-400 mx-2" />
                  <span className="truncate text-base">{currentBanner.to_city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Details & Actions */}
          <div className="relative lg:col-span-7 flex flex-col justify-between p-5 sm:p-7 bg-zinc-950">
            <div>
              {/* Campaign Title */}
              <h2
                id="offer-splash-title"
                className="text-xl sm:text-2xl font-black leading-snug text-white"
              >
                {currentBanner.title}
              </h2>

              {/* Locations / Route Box */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  {t('routeDetails')}
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 border border-white/5">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase">{t('startLocation')}</span>
                      <span className="text-sm font-black text-white">{currentBanner.from_city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 border border-white/5">
                    <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-zinc-400 font-bold uppercase">{t('destLocation')}</span>
                      <span className="text-sm font-black text-white">{currentBanner.to_city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Type Drop-down (டிராப் டவுன் தேர்வுகள்) */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="splash-vehicle-select" className="text-xs font-bold uppercase tracking-wide text-zinc-300">
                    {t('selectVehicle')}
                  </label>
                  <span className="text-[11px] font-semibold text-teal-400">
                    AC Guaranteed
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="splash-vehicle-select"
                    value={currentVehicle}
                    onChange={(e) =>
                      setSelectedVehicles((prev) => ({
                        ...prev,
                        [currentBanner.id]: e.target.value,
                      }))
                    }
                    className="w-full appearance-none rounded-xl border border-white/20 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    {(currentBanner.available_vehicles && currentBanner.available_vehicles.length > 0
                      ? currentBanner.available_vehicles
                      : ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta', 'Tempo Traveller']
                    ).map((v) => (
                      <option key={v} value={v} className="bg-zinc-900 text-white">
                        {v}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Price Details (ஆக்சுவல் அமௌன்ட் & தள்ளுபடி விலை) */}
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-900/40 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      {t('offerPrice')}
                    </span>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400">
                        ₹{offerPrice.toLocaleString('en-IN')}
                      </span>
                      {actualPrice > offerPrice && (
                        <del className="text-base sm:text-lg font-bold text-zinc-400">
                          ₹{actualPrice.toLocaleString('en-IN')}
                        </del>
                      )}
                    </div>
                  </div>

                  {savings > 0 && (
                    <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-right">
                      <span className="block text-[10px] font-bold uppercase text-emerald-300">{t('totalSavings')}</span>
                      <span className="text-sm font-black text-emerald-400">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Offer Validity & Sales Order Details */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      {lang === 'ta' ? 'காலம்:' : 'Validity:'} <strong>{formatDate(currentBanner.from_date)}</strong> {lang === 'ta' ? 'முதல்' : 'to'}{' '}
                      <strong>{formatDate(currentBanner.to_date)}</strong> {lang === 'ta' ? 'வரை' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <Tag className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span>
                      Ref: <strong className="font-mono text-amber-200">{currentBanner.quotation_ref}</strong>
                    </span>
                  </div>
                </div>

                {/* Quotation / Terms notes */}
                {currentBanner.quotation_details && (
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-zinc-400 border-t border-white/5 pt-2">
                    ✓ {currentBanner.quotation_details}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleClaimOffer}
                  className="shine-button flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-black text-zinc-950 shadow-xl shadow-amber-950/40 transition hover:bg-amber-300 active:scale-[0.98]"
                >
                  <CarFront className="h-4 w-4" /> {t('claimOffer')}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  {t('continueWebsite')}
                </button>
              </div>

              {/* Slider Dots Navigation if multiple banners */}
              {banners.length > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        (prev) => (prev - 1 + banners.length) % banners.length
                      )
                    }
                    className="p-1 rounded-full text-zinc-400 hover:text-white"
                    aria-label="Previous offer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {banners.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        currentIndex === i
                          ? 'w-6 bg-amber-400'
                          : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                      }`}
                      aria-label={`Go to offer ${i + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev + 1) % banners.length)
                    }
                    className="p-1 rounded-full text-zinc-400 hover:text-white"
                    aria-label="Next offer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
