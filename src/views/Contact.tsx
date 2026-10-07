'use client';

import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { TamilNaduMap } from '../components/TamilNaduMap';
import { brand, whatsappMessage } from '../content';

export function Contact() {
  const [selectedCity, setSelectedCity] = useState(brand.city);
  const waLink = `https://wa.me/${brand.cleanPhone}?text=${encodeURIComponent(
    `${whatsappMessage} My city: ${selectedCity}.`,
  )}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Contact</p>
        <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">Talk to us, or tap your city</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
          Reach the booking desk directly, or use the map below to select your pickup city before calling or
          messaging on WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="stagger-reveal grid gap-4">
          <a href={`tel:${brand.cleanPhone}`} className="lift-card flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 p-5 shadow-sm transition hover:border-teal-400">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700">
              <Phone aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black">Call Now</p>
              <p className="text-sm font-medium text-zinc-600">{brand.phone}</p>
            </div>
          </a>
          <a href={waLink} className="lift-card flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 p-5 shadow-sm transition hover:border-teal-400">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black">WhatsApp Enquiry</p>
              <p className="text-sm font-medium text-zinc-600">Selected city: {selectedCity}</p>
            </div>
          </a>
          <a href={`mailto:${brand.email}`} className="lift-card flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 p-5 shadow-sm transition hover:border-zinc-400">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-700">
              <Mail aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black">Email</p>
              <p className="text-sm font-medium text-zinc-600">{brand.email}</p>
            </div>
          </a>
          <div className="lift-card flex items-center gap-3 rounded-lg border border-zinc-200 bg-white/90 p-5 shadow-sm">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-700">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black">Office</p>
              <p className="text-sm font-medium text-zinc-600">{brand.address}</p>
              <p className="text-xs font-bold text-zinc-500">{brand.hours}</p>
            </div>
          </div>
          <div className="image-frame aspect-[16/10] rounded-lg shadow-xl shadow-zinc-950/10">
            <img src="/images/airport-taxi.png" alt="Chettinad Express airport cab ready for pickup" loading="lazy" />
          </div>
        </div>

        <TamilNaduMap
          label="Tap your pickup city to prefill the WhatsApp message"
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />
      </div>
    </div>
  );
}

