import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { DestinationGallery } from '../components/DestinationGallery';
import { FareWidget } from '../components/FareWidget';
import { outstationContent, popularRoutes, routeCities, routeSeoKeywords, tariffRules } from '../content';

export function OutstationTaxi() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Outstation Taxi</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">
            Intercity taxi across Tamil Nadu
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-600">{outstationContent.intro}</p>
        </div>
        <div className="image-frame aspect-[16/9] rounded-lg shadow-2xl shadow-zinc-950/10">
          <img
            src="/images/outstation-taxi.png"
            alt="White sedan taxi on a scenic Tamil Nadu highway"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <ul className="stagger-reveal grid gap-3">
            {outstationContent.highlights.map((point) => (
              <li key={point} className="lift-card flex items-start gap-3 rounded-lg border border-zinc-100 bg-white/90 p-4 text-sm font-medium text-zinc-700 shadow-sm">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-zinc-950">{tariffRules.gstNote}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-teal-700">Drop trip rules</h2>
                <ul className="mt-2 grid gap-2 text-xs font-semibold leading-5 text-zinc-700">
                  {tariffRules.dropTrip.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-teal-700">Round trip rules</h2>
                <ul className="mt-2 grid gap-2 text-xs font-semibold leading-5 text-zinc-700">
                  {tariffRules.roundTrip.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <h2 className="mt-10 text-xl font-black">Popular outstation routes</h2>
          <div className="table-wrap mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
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
          <p className="mt-3 text-xs font-semibold leading-5 text-zinc-500">
            Estimates include Rs.400 driver bata and the 130 km drop-trip minimum where applicable.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {routeSeoKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
                {keyword}
              </span>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-black">Cities we cover</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {routeCities.map((city) => (
              <span key={city} className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
                {city}
              </span>
            ))}
          </div>
        </div>

        <FareWidget defaultPickup="Chennai" defaultDrop="Madurai" />
      </div>

      <section className="mt-14">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Destination visuals</p>
        <h2 className="mt-1 text-2xl font-black">Popular Tamil Nadu taxi destinations</h2>
        <DestinationGallery compact />
      </section>
    </div>
  );
}

