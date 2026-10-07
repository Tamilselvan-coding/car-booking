'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CarFront,
  Sparkles,
  Calendar,
  Tag,
  ArrowRight,
  MapPin,
  Flame,
} from 'lucide-react';
import type { BannerItem } from '../types/banner';
import { useBookingModal } from '../context/BookingModalContext';

export function OfferBannerSection() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const { open: openBooking } = useBookingModal();

  useEffect(() => {
    async function loadActive() {
      try {
        const res = await fetch('/api/banners/active', { cache: 'no-store' });
        const json = await res.json();
        if (json.status && Array.isArray(json.data)) {
          setBanners(json.data);
        }
      } catch (err) {
        console.error('Failed to load active offers for section:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActive();
  }, []);

  if (loading || banners.length === 0) {
    return null; // Only displays when admin has approved active banners!
  }

  const current = banners[currentIndex];
  const currentVehicle =
    selectedVehicles[current.id] ||
    current.vehicle_type ||
    current.available_vehicles?.[0] ||
    'Sedan (Dzire / Etios)';

  const actualPrice = Number(current.actual_price) || 0;
  const offerPrice = Number(current.offer_price) || 0;
  const savings = Math.max(0, actualPrice - offerPrice);
  const discountPercent =
    actualPrice > 0 ? Math.round((savings / actualPrice) * 100) : 0;

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

  const handleBook = () => {
    openBooking({
      pickup: current.from_city,
      drop: current.to_city,
      vehicle: currentVehicle,
      offerCode: current.quotation_ref,
      offerPrice: current.offer_price,
      actualPrice: current.actual_price,
      tripType: current.trip_type || 'One Way',
    });
  };

  return (
    <section aria-label="Special Offers Slider" className="relative z-20 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
              <Flame className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              சிறப்பு தள்ளுபடி சலுகைகள் (Exclusive Route Offers)
            </div>
            <h2 className="mt-2 text-2xl font-black text-zinc-950 sm:text-3xl">
              Limited-Time Route Deals
            </h2>
          </div>
          {banners.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
                }
                className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50"
                aria-label="Previous offer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold text-zinc-500">
                {currentIndex + 1} / {banners.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50"
                aria-label="Next offer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Featured Slider Banner Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/5">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Visual Image Side */}
            <div className="relative min-h-[220px] lg:col-span-5 overflow-hidden bg-zinc-950">
              <img
                src={current.banner_image || '/images/special-offer-banner.jpg'}
                alt={current.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 rounded-xl bg-amber-400 px-3.5 py-1.5 font-black text-zinc-950 shadow-lg">
                  <span className="text-xs uppercase">Save</span>{' '}
                  <span className="text-lg font-black">{discountPercent}% OFF</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl border border-white/20 bg-black/70 p-3.5 backdrop-blur">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {current.trip_type || 'One Way'} Special
                </span>
                <div className="mt-1 flex items-center justify-between font-black text-white text-base">
                  <span>{current.from_city}</span>
                  <ArrowRight className="h-4 w-4 text-amber-400 mx-2" />
                  <span>{current.to_city}</span>
                </div>
              </div>
            </div>

            {/* Content & Control Side */}
            <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase text-teal-800 border border-teal-200">
                    Verified Drop Taxi Deal
                  </span>
                  <span className="text-xs font-bold font-mono text-zinc-500">
                    Quote Ref: {current.quotation_ref}
                  </span>
                </div>

                <h3 className="mt-3 text-xl sm:text-2xl font-black text-zinc-950">
                  {current.title}
                </h3>

                {/* Locations Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500">From</span>
                      <strong className="text-sm text-zinc-900">{current.from_city}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-zinc-500">To</span>
                      <strong className="text-sm text-zinc-900">{current.to_city}</strong>
                    </div>
                  </div>
                </div>

                {/* Dropdown for Vehicle Type */}
                <div className="mt-4">
                  <label htmlFor="section-vehicle-select" className="block text-xs font-black uppercase tracking-wide text-zinc-700 mb-1.5">
                    வாகன தேர்வு (Choose Vehicle Type)
                  </label>
                  <div className="relative">
                    <select
                      id="section-vehicle-select"
                      value={currentVehicle}
                      onChange={(e) =>
                        setSelectedVehicles((prev) => ({
                          ...prev,
                          [current.id]: e.target.value,
                        }))
                      }
                      className="w-full appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    >
                      {(current.available_vehicles && current.available_vehicles.length > 0
                        ? current.available_vehicles
                        : ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta']
                      ).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Pricing & Validity */}
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        Offer Fare (தள்ளுபடி விலை)
                      </span>
                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="text-3xl font-black text-zinc-950">
                          ₹{offerPrice.toLocaleString('en-IN')}
                        </span>
                        {actualPrice > offerPrice && (
                          <del className="text-base font-bold text-zinc-500">
                            ₹{actualPrice.toLocaleString('en-IN')}
                          </del>
                        )}
                      </div>
                    </div>
                    {savings > 0 && (
                      <span className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-amber-200/60 pt-2 text-xs font-semibold text-zinc-700">
                    <Calendar className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    <span>
                      செல்லுபடியாகும் காலம்: <strong>{formatDate(current.from_date)}</strong> to{' '}
                      <strong>{formatDate(current.to_date)}</strong>
                    </span>
                  </div>
                  {current.quotation_details && (
                    <p className="mt-1.5 text-[11px] text-zinc-600">
                      ✓ {current.quotation_details}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBook}
                  className="shine-button inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-black text-zinc-950 shadow-lg shadow-amber-950/10 transition hover:bg-amber-300"
                >
                  <CarFront className="h-4 w-4" /> Book This Offer Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
