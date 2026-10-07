'use client';

import Link from 'next/link';
import { CarFront, ChevronRight, Quote, Star } from 'lucide-react';
import { DestinationGallery } from '../components/DestinationGallery';
import { FareWidget } from '../components/FareWidget';
import { useBookingModal } from '../context/BookingModalContext';
import {
  badgeItems,
  highlights,
  popularRoutes,
  routeSeoKeywords,
  services,
  steps,
  tariffRules,
  testimonials,
  trustPoints,
  vehicleRates,
} from '../content';

export function Home() {
  const { open: openBooking } = useBookingModal();

  return (
    <>
      <section className="hero-shell hero-grid relative overflow-hidden text-white">
        <img
          src="/hero-taxi.png"
          alt="Chettinad Express sedan ready for an outstation trip on a Tamil Nadu highway"
          width={1600}
          height={1000}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.92),rgba(18,18,18,0.58),rgba(18,18,18,0.18))]" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="route-lane reveal-up min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-amber-200 backdrop-blur">
              Tamil Nadu&apos;s trusted drop taxi
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal sm:text-6xl">
              Chettinad Express
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-zinc-200 sm:text-lg">
              Outstation, local, and airport cabs across Tamil Nadu with clean sedans, SUVs, MUVs,
              verified drivers, and clear route-based pricing before pickup.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openBooking}
                className="shine-button inline-flex h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-zinc-950 shadow-xl shadow-amber-950/20 transition hover:bg-amber-300"
              >
                <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
              </button>
              <Link
                href="/services"
                className="inline-flex h-12 items-center rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                View Services
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {badgeItems.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-zinc-200 backdrop-blur"
                >
                  <badge.icon aria-hidden="true" className="h-3.5 w-3.5 text-amber-200" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <div className="floating-soft min-w-0">
            <FareWidget />
          </div>
        </div>
      </section>

      <section aria-label="Trust highlights" className="relative z-20 -mt-8 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 rounded-lg border border-white/70 bg-white/90 p-4 shadow-2xl shadow-zinc-950/10 backdrop-blur md:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-lg bg-white/70 p-4 text-center">
              <item.icon aria-hidden="true" className="mx-auto h-6 w-6 text-teal-700" />
              <p className="mt-2 text-2xl font-black text-zinc-950">{item.value}</p>
              <p className="text-xs font-bold text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="stagger-reveal grid gap-8 md:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-6 shadow-sm">
              <point.icon aria-hidden="true" className="h-7 w-7 text-teal-700" />
              <h3 className="mt-4 text-lg font-black">{point.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-teal-700">Tariff</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Per km rate, no surprises</h2>
            </div>
          </div>
          <div className="table-wrap mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-amber-400 text-zinc-950">
                <tr>
                  <th scope="col" className="px-4 py-4 text-base font-black uppercase">Vehicle type</th>
                  <th scope="col" className="px-4 py-4 text-base font-black uppercase">Drop trip<br />Rate / Km</th>
                  <th scope="col" className="px-4 py-4 text-base font-black uppercase">Round trip<br />Rate / Km</th>
                </tr>
              </thead>
              <tbody>
                {vehicleRates.map((vehicle) => (
                  <tr key={vehicle.name} className="border-t border-zinc-200">
                    <td className="px-4 py-4">
                      <p className="text-lg font-black text-zinc-950">
                        {vehicle.name} <span className="text-base">({vehicle.seats.replace(' seats', '')})</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-zinc-700">({vehicle.examples})</p>
                    </td>
                    <td className="px-4 py-4 text-lg font-semibold text-zinc-950">{vehicle.oneWay}</td>
                    <td className="px-4 py-4 text-lg font-semibold text-zinc-950">{vehicle.roundTrip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-zinc-900">
            {tariffRules.gstNote}
          </p>
          <div className="mt-6 space-y-4 text-sm font-medium leading-7 text-zinc-800">
            {[
              ['Drop Trips', tariffRules.dropTrip],
              ['Round Trips', tariffRules.roundTrip],
              ['Extra Charges', tariffRules.extraCharges],
            ].map(([title, rules]) => (
              <div key={title as string} className="grid gap-2">
                {(rules as string[]).map((rule) => (
                  <p key={rule}>
                    {(title as string) !== 'Extra Charges' ? (
                      <span className="font-black text-zinc-950">{title as string} - </span>
                    ) : null}
                    {rule}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Services</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Every kind of taxi trip, one platform</h2>
        <div className="stagger-reveal mt-8 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.slug}
              className="lift-card group min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white/90 shadow-sm transition hover:border-teal-400"
            >
              <div className="image-frame aspect-[16/9]">
                <img src={service.image} alt={service.imageAlt} loading="lazy" />
              </div>
              <div className="p-5 sm:p-6">
                <service.icon aria-hidden="true" className="h-7 w-7 text-teal-700" />
                <h3 className="mt-3 flex items-center gap-1 text-lg font-black">
                  {service.title}
                  <ChevronRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{service.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Destinations</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Major city routes at a glance</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
              Browse frequent Tamil Nadu taxi routes with city scenery for Coimbatore, Madurai, Trichy, and Chennai.
            </p>
          </div>
          <DestinationGallery />
        </div>
      </section>

      <section className="bg-zinc-950 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-amber-300">Popular routes</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">Most booked one way routes</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="image-frame min-h-[240px] rounded-lg border border-white/10 shadow-2xl shadow-black/20">
              <img src="/images/outstation-taxi.png" alt="Outstation taxi on a Tamil Nadu highway route" loading="lazy" />
            </div>
            <div className="table-wrap overflow-x-auto rounded-lg border border-white/10 bg-white text-zinc-950">
              <table className="h-full w-full min-w-[480px] text-left text-sm">
                <thead className="bg-zinc-100 text-xs font-black uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th scope="col" className="px-4 py-3">Route</th>
                    <th scope="col" className="px-4 py-3">Distance</th>
                    <th scope="col" className="px-4 py-3">Sedan estimate</th>
                  </tr>
                </thead>
                <tbody>
                  {popularRoutes.map((route) => (
                    <tr key={`${route.from}-${route.to}`} className="border-t border-zinc-100">
                      <td className="px-4 py-3 font-bold">
                        <Link href={`/routes/${route.slug}`} className="transition hover:text-teal-700">
                          {route.from} to {route.to}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-600">{route.km} km</td>
                      <td className="px-4 py-3 font-bold text-teal-700">Rs.{route.sedan.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-5 text-xs font-semibold leading-5 text-zinc-300">
            Sedan estimates include Rs.400 driver bata and the 130 km minimum billable distance where applicable.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {routeSeoKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-200">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">How it works</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Three steps to your ride</h2>
        <ol className="stagger-reveal mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-6 shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-sm font-black text-zinc-950">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="footer-band py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-black uppercase tracking-wide text-amber-300">Testimonials</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">What riders say</h2>
          <div className="stagger-reveal mt-8 grid gap-6 md:grid-cols-2">
            {testimonials.map((item) => (
              <figure key={item.name} className="lift-card rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur">
                <Quote aria-hidden="true" className="h-6 w-6 text-amber-300" />
                <blockquote className="mt-3 text-sm font-medium leading-6 text-zinc-200">{item.quote}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>{item.name} - {item.route}</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" /> 5.0
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-black sm:text-3xl">Ready to book your taxi?</h2>
        <p className="mt-2 text-sm font-medium text-zinc-600">
          Call, WhatsApp, or visit the contact page to pick your city on the Tamil Nadu map.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={openBooking}
            className="shine-button inline-flex h-12 items-center gap-2 rounded-lg bg-zinc-950 px-6 text-sm font-black text-white"
          >
            <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
          </button>
          <Link href="/faq" className="inline-flex h-12 items-center rounded-lg border border-zinc-200 bg-white/80 px-6 text-sm font-black">
            Read FAQ
          </Link>
        </div>
      </section>
    </>
  );
}


