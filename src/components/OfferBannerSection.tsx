'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CarFront,
  Sparkles,
  Calendar,
  Tag,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Clock,
  MessageCircle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type { BannerItem } from '../types/banner';
import { useBookingModal } from '../context/BookingModalContext';
import { useOffers } from '../context/OfferContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { fetchActiveBannersFromSupabase, DEFAULT_BANNERS } from '../lib/supabase';
import { brand } from '../content';

interface OfferBannerSectionProps {
  /** Optional custom class for fine-tuning vertical placement */
  className?: string;
  /** Optional custom banners for test/preview sandbox mode */
  previewBanners?: BannerItem[];
}

export function OfferBannerSection({
  className,
  previewBanners,
}: OfferBannerSectionProps) {
  const offerContext = useOffers();
  const { lang, t } = useLanguage();
  const { open: openBooking } = useBookingModal();

  const [banners, setBanners] = useState<BannerItem[]>(previewBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(!previewBanners);

  // Sync with OfferContext, Supabase, or default active banners
  useEffect(() => {
    if (previewBanners && previewBanners.length > 0) {
      setBanners(previewBanners);
      setLoading(false);
      return;
    }

    if (offerContext.banners && offerContext.banners.length > 0) {
      setBanners(offerContext.banners);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadOffers() {
      try {
        const activeData = await fetchActiveBannersFromSupabase();
        if (isMounted && Array.isArray(activeData) && activeData.length > 0) {
          setBanners(activeData);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/banners/active', { cache: 'no-store' });
        const json = await res.json();
        if (isMounted && json.status && Array.isArray(json.data) && json.data.length > 0) {
          setBanners(json.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Fallback to local default banners for offer section:', err);
      }

      if (isMounted) {
        setBanners(DEFAULT_BANNERS.filter((b) => b.is_active));
        setLoading(false);
      }
    }

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, [previewBanners, offerContext.banners]);

  // Handle automatic carousel rotation (every 6 seconds, pauses on hover)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  // Keep index within bounds if banners change
  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const currentBanner = banners.length > 0 ? (banners[currentIndex] || banners[0]) : null;

  // Selected vehicle for the current banner
  const currentVehicle = currentBanner
    ? (selectedVehicles[currentBanner.id] ||
       currentBanner.vehicle_type ||
       currentBanner.available_vehicles?.[0] ||
       'Sedan (Dzire / Etios)')
    : 'Sedan (Dzire / Etios)';

  // Dynamic vehicle price calculation engine - MUST be called unconditionally before any return
  const { calculatedOfferPrice, calculatedActualPrice, savings, discountPercent } = useMemo(() => {
    if (!currentBanner) {
      return {
        calculatedOfferPrice: 0,
        calculatedActualPrice: 0,
        savings: 0,
        discountPercent: 0,
      };
    }

    const weights: Record<string, number> = {
      'Sedan (Dzire / Etios)': 1.0,
      Sedan: 1.0,
      'SUV (Ertiga)': 1.33,
      SUV: 1.33,
      'Innova Crysta': 1.6,
      'Tempo Traveller': 2.3,
    };

    const baseVehicle = currentBanner.vehicle_type || 'Sedan (Dzire / Etios)';
    const baseWeight = weights[baseVehicle] || 1.0;
    const targetWeight = weights[currentVehicle] || 1.0;
    const ratio = targetWeight / baseWeight;

    const baseOffer = Number(currentBanner.offer_price) || 4999;
    const baseActual = Number(currentBanner.actual_price) || 6800;

    const rawOffer = Math.round((baseOffer * ratio) / 50) * 50 - (ratio !== 1.0 ? 1 : 0);
    const rawActual = Math.round((baseActual * ratio) / 50) * 50;
    const currentSavings = Math.max(0, rawActual - rawOffer);
    const currentDiscount =
      rawActual > 0 ? Math.round((currentSavings / rawActual) * 100) : 0;

    return {
      calculatedOfferPrice: rawOffer,
      calculatedActualPrice: rawActual,
      savings: currentSavings,
      discountPercent: currentDiscount,
    };
  }, [currentBanner, currentVehicle]);

  // Safe early return placed AFTER all React hooks have executed unconditionally
  if (loading || banners.length === 0 || !currentBanner) {
    return null;
  }

  // Format dates according to current language
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleClaimOffer = () => {
    openBooking({
      pickup: currentBanner.from_city,
      drop: currentBanner.to_city,
      vehicle: currentVehicle,
      offerCode: currentBanner.quotation_ref,
      offerPrice: calculatedOfferPrice,
      actualPrice: calculatedActualPrice,
      tripType: currentBanner.trip_type || 'One Way',
    });
  };

  const handleWhatsAppOffer = () => {
    const whatsappLines = [
      '*🚖 Chettinad Express - Special Promotional Offer Booking*',
      '',
      'Hi Chettinad Express, I want to book this Special Route Offer:',
      '',
      `• *Offer Campaign:* ${currentBanner.title}`,
      `• *Route:* ${currentBanner.from_city} to ${currentBanner.to_city}`,
      `• *Trip Type:* ${currentBanner.trip_type || 'One Way'}`,
      `• *Selected Vehicle:* ${currentVehicle}`,
      `• *Special Offer Fare:* Rs.${calculatedOfferPrice.toLocaleString('en-IN')}`,
      `• *Regular Price:* Rs.${calculatedActualPrice.toLocaleString('en-IN')} (Save Rs.${savings.toLocaleString('en-IN')})`,
      `• *Offer Code:* ${currentBanner.quotation_ref}`,
      `• *Inclusions:* ${currentBanner.quotation_details || 'Toll allowance & driver bata included'}`,
      '',
      'Please confirm availability and lock this offer ride for me. Thank you!',
    ];
    const url = `https://wa.me/${brand.cleanPhone}?text=${encodeURIComponent(whatsappLines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="promotional-offers"
      aria-label="Promotional Route Offers"
      className={className || 'relative z-20 px-4 sm:px-6 -mt-8 sm:-mt-10 mb-8'}
    >
      <div
        className="mx-auto max-w-6xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Quick Route Deal Switcher Pills (விரைவு ரூட் தேர்வுகள்) */}
        {banners.length > 1 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black uppercase text-amber-500 shrink-0 mr-1">
              <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              {lang === 'ta' ? 'சிறப்பு ரூட்கள்:' : 'Live Deals:'}
            </span>
            {banners.map((b, i) => {
              const isSelected = i === currentIndex;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/25 scale-[1.02] border border-amber-300'
                      : 'bg-zinc-900/80 border border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <MapPin className={`h-3 w-3 ${isSelected ? 'text-zinc-950' : 'text-amber-400'}`} />
                  <span>
                    {b.from_city} ➔ {b.to_city}
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.2 text-[10px] font-black ${
                      isSelected ? 'bg-zinc-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
                    }`}
                  >
                    ₹{Number(b.offer_price).toLocaleString('en-IN')}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Card Container */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-zinc-950 text-white shadow-2xl shadow-amber-500/10">
          {/* Glowing Ambient Top Accent */}
          <div className="absolute -top-28 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/25 to-teal-500/10 blur-3xl pointer-events-none" />

          {/* Top Header Bar */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-zinc-900/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-500/10 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> {t('specialOffer')}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> {lang === 'ta' ? 'உறுதிசெய்யப்பட்ட தள்ளுபடி' : 'Verified Route Deal'}
              </span>
            </div>

            {/* Language Switcher & Carousel Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />

              {banners.length > 1 && (
                <div className="flex items-center gap-1 sm:gap-1.5 border-l border-white/10 pl-2 sm:pl-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        (prev) => (prev - 1 + banners.length) % banners.length
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/15 hover:text-white"
                    aria-label="Previous offer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-zinc-400 min-w-[2.5rem] text-center">
                    {currentIndex + 1} / {banners.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => (prev + 1) % banners.length)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/15 hover:text-white"
                    aria-label="Next offer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Embedded Content Grid */}
          <div className="relative grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Visual Banner Graphic with Route Destination Image */}
            <div className="relative lg:col-span-5 min-h-[240px] sm:min-h-[280px] lg:min-h-[440px] overflow-hidden bg-zinc-900 group">
              <img
                src={currentBanner.banner_image || '/images/special-offer-banner.jpg'}
                alt={currentBanner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Rich Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />

              {/* Discount Badge on Image */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 flex flex-col items-start rounded-xl bg-amber-400 px-3.5 py-1.5 font-black text-zinc-950 shadow-xl shadow-amber-950/50 border border-amber-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900">
                    {lang === 'ta' ? 'சிறப்பு தள்ளுபடி' : 'Flat Savings'}
                  </span>
                  <span className="text-xl font-black leading-tight sm:text-2xl">
                    {discountPercent}% {lang === 'ta' ? 'OFF' : 'OFF'}
                  </span>
                </div>
              )}

              {/* Route Deal Strip at Bottom of Image */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="rounded-xl border border-white/20 bg-zinc-950/80 p-3.5 backdrop-blur-md shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      {currentBanner.trip_type || 'One Way'}{' '}
                      {lang === 'ta' ? 'சிறப்பு கட்டணம்' : 'Route Deal'}
                    </span>
                    <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                      AC Cab
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between font-black text-white text-base sm:text-lg">
                    <span className="truncate">{currentBanner.from_city}</span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-amber-400 mx-2 animate-pulse" />
                    <span className="truncate">{currentBanner.to_city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Details & Dynamic Pricing */}
            <div className="relative lg:col-span-7 flex flex-col justify-between p-5 sm:p-7 bg-zinc-950">
              <div>
                {/* Campaign Title & Route Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-black leading-snug text-white">
                    {currentBanner.title}
                  </h2>
                </div>

                {/* Locations / Route Box */}
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                      {t('routeDetails')}
                    </p>
                    <span className="text-[11px] font-mono font-bold text-amber-300">
                      {currentBanner.trip_type || 'One Way'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 border border-white/5">
                      <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-zinc-400 font-bold uppercase">
                          {t('startLocation')}
                        </span>
                        <span className="text-sm font-black text-white">
                          {currentBanner.from_city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-3 py-2 border border-white/5">
                      <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] text-zinc-400 font-bold uppercase">
                          {t('destLocation')}
                        </span>
                        <span className="text-sm font-black text-white">
                          {currentBanner.to_city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Point Inclusions & Trust Row */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 text-[11px] font-semibold leading-tight">
                      {lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட ஓட்டுநர்' : 'Verified Driver'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
                    <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span className="text-zinc-300 text-[11px] font-semibold leading-tight">
                      {lang === 'ta' ? 'முழுமையான ஏசி பயணம்' : '100% AC Ride'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
                    <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-zinc-300 text-[11px] font-semibold leading-tight">
                      {lang === 'ta' ? 'டோல் கட்டணம் உட்பட' : 'Toll Included'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
                    <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span className="text-zinc-300 text-[11px] font-semibold leading-tight">
                      {lang === 'ta' ? 'கூடுதல் கட்டணம் இல்லை' : 'Zero Surge / Fixed'}
                    </span>
                  </div>
                </div>

                {/* Vehicle Type Dropdown with Real-Time Pricing Adjustment */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="embedded-vehicle-select"
                      className="text-xs font-bold uppercase tracking-wide text-zinc-300"
                    >
                      {t('selectVehicle')}
                    </label>
                    <span className="text-[11px] font-semibold text-teal-400">
                      {lang === 'ta' ? 'தேர்வுக்கு ஏற்ப கட்டணம் மாறும்' : 'Rates update live on vehicle select'}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      id="embedded-vehicle-select"
                      value={currentVehicle}
                      onChange={(e) =>
                        setSelectedVehicles((prev) => ({
                          ...prev,
                          [currentBanner.id]: e.target.value,
                        }))
                      }
                      className="w-full appearance-none rounded-xl border border-white/20 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {(currentBanner.available_vehicles &&
                      currentBanner.available_vehicles.length > 0
                        ? currentBanner.available_vehicles
                        : [
                            'Sedan (Dzire / Etios)',
                            'SUV (Ertiga)',
                            'Innova Crysta',
                            'Tempo Traveller',
                          ]
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

                {/* Dynamic Price Box (ஆக்சுவல் அமௌன்ட் & தள்ளுபடி விலை) */}
                <div className="mt-4 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-900/40 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                          {t('offerPrice')}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          ({currentVehicle})
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black text-amber-400">
                          ₹{calculatedOfferPrice.toLocaleString('en-IN')}
                        </span>
                        {calculatedActualPrice > calculatedOfferPrice && (
                          <del className="text-base sm:text-lg font-bold text-zinc-400">
                            ₹{calculatedActualPrice.toLocaleString('en-IN')}
                          </del>
                        )}
                      </div>
                    </div>

                    {savings > 0 && (
                      <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-right">
                        <span className="block text-[10px] font-bold uppercase text-emerald-300">
                          {t('totalSavings')}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          {lang === 'ta'
                            ? `சேமிப்பு ₹${savings.toLocaleString('en-IN')}`
                            : `Save ₹${savings.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Offer Validity & Sales Order Details */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>
                        {lang === 'ta' ? 'சலுகைக் காலம்:' : 'Validity:'}{' '}
                        <strong>{formatDate(currentBanner.from_date)}</strong>{' '}
                        {lang === 'ta' ? 'முதல்' : 'to'}{' '}
                        <strong>{formatDate(currentBanner.to_date)}</strong>{' '}
                        {lang === 'ta' ? 'வரை' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <Tag className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                      <span>
                        Ref:{' '}
                        <strong className="font-mono text-amber-200">
                          {currentBanner.quotation_ref}
                        </strong>
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

              {/* Dual Action CTAs: Book on Site & WhatsApp Offer Direct */}
              <div className="mt-5 space-y-3">
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
                    onClick={handleWhatsAppOffer}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-xl shadow-emerald-950/30 transition hover:bg-emerald-500 active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4" />{' '}
                    {lang === 'ta' ? 'வாட்ஸ்அப் மூலம் புக் செய்ய' : 'WhatsApp Offer Booking'}
                  </button>
                </div>

                {/* Slider Dots Navigation if multiple banners */}
                {banners.length > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          (prev) => (prev - 1 + banners.length) % banners.length
                        )
                      }
                      className="p-1 rounded-full text-zinc-400 hover:text-white transition"
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
                      className="p-1 rounded-full text-zinc-400 hover:text-white transition"
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
    </section>
  );
}
