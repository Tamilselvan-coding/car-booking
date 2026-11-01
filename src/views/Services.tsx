'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CarFront } from 'lucide-react';
import { useBookingModal } from '../context/BookingModalContext';
import { LuggagePolicyModal } from '../components/LuggagePolicyModal';
import { services, tariffRules, vehicleRates } from '../content';

export function Services() {
  const { open: openBooking } = useBookingModal();
  const [showLuggageModal, setShowLuggageModal] = useState(false);

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
        <div>
          <h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Drop Trips and Round Trips</h2>
          <p className="mt-1 text-sm sm:text-base font-semibold text-zinc-800">
            Below are the rates &amp; Terms and Conditions for different type of vehicles.
          </p>
        </div>

        <div className="table-wrap mt-6 overflow-x-auto rounded-lg border border-zinc-300 bg-white shadow-sm">
          <table className="w-full min-w-[620px] text-left text-sm border-collapse">
            <thead className="bg-[#f59e0b] text-zinc-950">
              <tr className="divide-x divide-amber-600/30">
                <th scope="col" className="px-4 py-4 text-sm sm:text-base font-black uppercase tracking-wider">
                  VEHICLE TYPE
                </th>
                <th scope="col" className="px-4 py-4 text-sm sm:text-base font-black uppercase tracking-wider">
                  DROP TRIP<br />Rate / Km
                </th>
                <th scope="col" className="px-4 py-4 text-sm sm:text-base font-black uppercase tracking-wider">
                  ROUND TRIP<br />Rate / Km
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {vehicleRates.map((vehicle) => (
                <tr key={vehicle.name} className="divide-x divide-zinc-200 hover:bg-zinc-50/60 transition">
                  <td className="px-4 py-4">
                    {vehicle.name === 'Innova Crysta' ? (
                      <p className="text-base font-black text-zinc-950">
                        Innova Crysta <span className="font-semibold text-zinc-800">(Innova Crysta)</span>
                      </p>
                    ) : (
                      <>
                        <p className="text-base font-black text-zinc-950">
                          {vehicle.name} ({vehicle.seats.replace(' seats', '')})
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-medium leading-5 text-zinc-700">
                          ({vehicle.examples})
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4 text-base font-bold text-zinc-950">{vehicle.oneWay}</td>
                  <td className="px-4 py-4 text-base font-bold text-zinc-950">{vehicle.roundTrip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm font-bold text-zinc-900">
          Rates given above are inclusive of GST.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="text-xl font-black text-zinc-950">Terms &amp; Charges</h3>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-800">
            {tariffRules.termsList.map((item, idx) => (
              <p key={idx} className="text-zinc-900">
                {item.prefix ? <span className="font-black text-zinc-950">{item.prefix}</span> : null}
                {item.hasLuggagePolicyLink ? (
                  <>
                    {'Luggage charges Rs. 300 for carrying extra Luggage. Check '}
                    <button
                      type="button"
                      onClick={() => setShowLuggageModal(true)}
                      className="text-teal-700 underline font-bold hover:text-teal-900 cursor-pointer"
                    >
                      Luggage Policy
                    </button>
                    {' for more details.'}
                  </>
                ) : (
                  item.text
                )}
              </p>
            ))}
          </div>
        </div>
      </div>

      <LuggagePolicyModal
        isOpen={showLuggageModal}
        onClose={() => setShowLuggageModal(false)}
      />
    </div>
  );
}

