import Link from 'next/link';
import { ArrowRight, CheckCircle2, MapPin, Route } from 'lucide-react';
import { FareWidget } from '../components/FareWidget';
import { farePolicy, seoRouteLandings } from '../content';

export function RoutesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="reveal-up min-w-0">
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Taxi route pages</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-5xl">
            One way drop taxi routes in Tamil Nadu
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-zinc-600 sm:text-base">
            Choose a popular city pair to see route-specific taxi fare estimates, distance, travel time, booking details,
            and FAQs. Customers can still type any pickup or drop address in the fare calculator.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              `${farePolicy.minimumBillableKm} km minimum`,
              `Rs.${farePolicy.driverBata} driver bata included`,
              'Sedan, SUV, MUV options',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white/90 p-3 text-xs font-black text-zinc-700 shadow-sm">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-700" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <FareWidget defaultPickup="Chennai" defaultDrop="Karaikudi" />
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Popular routes</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Route landing pages</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seoRouteLandings.map((route) => (
            <Link
              key={route.slug}
              href={`/routes/${route.slug}`}
              className="lift-card group overflow-hidden rounded-lg border border-zinc-100 bg-white/90 shadow-sm transition hover:border-teal-300"
            >
              <div className="image-frame aspect-[16/9]">
                <img src={route.image} alt={route.imageAlt} loading="lazy" />
              </div>
              <div className="p-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700">
                  <MapPin aria-hidden="true" className="h-3 w-3" /> Approx {route.km} km
                </span>
                <h3 className="mt-3 flex items-center gap-2 text-lg font-black text-zinc-950">
                  {route.from} to {route.to} Taxi
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                  {route.travelTime} via {route.via}. View fare table and book with prefilled pickup/drop details.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <Route aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-sm font-bold leading-6 text-zinc-800">
            For SEO, only useful city-pair pages are generated. For enquiries, the booking form accepts full pickup and
            drop addresses, so customers can type area names, landmarks, railway stations, airports, or cities.
          </p>
        </div>
      </section>
    </div>
  );
}

