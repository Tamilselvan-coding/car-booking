'use client';

import Link from 'next/link';
import { CarFront } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';
import { services, tariffRules, vehicleRates } from '../content';

export function Services() {
  const { open: openBooking } = useBookingModal();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Services</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">Taxi services built for every trip</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-600">
            From a single one way drop to a multi-day district tour, Chettinad Express covers it with the same
            transparent per-km fares and verified driver network.
          </p>
        </div>
        <button
          type="button"
          onClick={openBooking}
          className="shine-button inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800"
        >
          <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
        </button>
      </div>

      <div className="stagger-reveal mt-10 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <article key={service.title} className="lift-card min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white/90 shadow-sm">
            <div className="image-frame aspect-[16/9]">
              <img src={service.image} alt={service.imageAlt} loading="eager" />
            </div>
            <div className="p-5 sm:p-6">
              <service.icon aria-hidden="true" className="h-7 w-7 text-teal-700" />
              <h2 className="mt-3 text-xl font-black">{service.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{service.longBody}</p>
              <Link href={service.slug} className="mt-4 inline-flex text-sm font-black text-teal-700 hover:underline">
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div id="tariff" className="mt-14 scroll-mt-28">
        <p className="text-sm font-black uppercase tracking-wide text-teal-700">Tariff</p>
        <h2 className="mt-1 text-2xl font-black">Fleet & tariff</h2>
        <div className="table-wrap mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
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
        <div className="mt-8 space-y-5 text-sm leading-7 text-zinc-800">
          <p className="text-base font-black text-zinc-950">{tariffRules.gstNote}</p>
          {[
            ['Drop Trips', tariffRules.dropTrip],
            ['Round Trips', tariffRules.roundTrip],
            ['Extra Charges', tariffRules.extraCharges],
          ].map(([title, rules]) => (
            <div key={title as string} className="grid gap-3">
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
    </div>
  );
}

