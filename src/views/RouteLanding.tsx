import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, CarFront, CheckCircle2, Clock, MapPin, Navigation, Phone, Route } from 'lucide-react';
import { FareWidget } from '../components/FareWidget';
import { RouteVisualGallery } from '../components/RouteVisualGallery';
import {
  brand,
  calculateFareEstimate,
  farePolicy,
  seoRouteLandings,
  type SeoRouteLanding,
  vehicleRates,
} from '../content';

interface RouteLandingProps {
  route: SeoRouteLanding;
}

const formatInr = (value: number) => `Rs.${value.toLocaleString('en-IN')}`;

export function RouteLanding({ route }: RouteLandingProps) {
  const vehicleEstimates = vehicleRates.map((vehicle) => ({
    vehicle,
    estimate: calculateFareEstimate('One Way', route.km, vehicle),
  }));
  const relatedRoutes = seoRouteLandings
    .filter((item) => item.slug !== route.slug && (item.from === route.from || item.to === route.to))
    .slice(0, 6);
  const whatsappText = encodeURIComponent(
    `Hi Chettinad Express, I want to book ${route.from} to ${route.to} taxi. Please share live fare and driver availability.`,
  );
  const routeUrl = `${brand.domain}/routes/${route.slug}`;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: route.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: `${route.from} to ${route.to} Taxi`,
    provider: {
      '@type': 'LocalBusiness',
      name: brand.name,
      telephone: brand.phone,
      url: brand.domain,
    },
    areaServed: [route.from, route.to, 'Tamil Nadu'],
    serviceType: 'One way drop taxi',
    url: routeUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: vehicleEstimates[0].estimate.totalFare,
      availability: 'https://schema.org/InStock',
      url: routeUrl,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <Image
          src={route.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.94),rgba(18,18,18,0.72),rgba(18,18,18,0.28))]" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="reveal-up min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-amber-200 backdrop-blur">
              One way drop taxi
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              {route.from} to {route.to} Taxi
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-200">
              Book {route.keyword} with clear per-km pricing, Sedan and SUV options, verified drivers,
              and 24/7 pickup support. {route.tripReason}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${brand.cleanPhone}`}
                className="shine-button inline-flex h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-zinc-950 shadow-xl shadow-amber-950/20 transition hover:bg-amber-300"
              >
                <Phone aria-hidden="true" className="h-4 w-4" /> Call Now
              </a>
              <a
                href={`https://wa.me/${brand.cleanPhone}?text=${whatsappText}`}
                className="shine-button inline-flex h-12 items-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-500"
              >
                <CarFront aria-hidden="true" className="h-4 w-4" /> WhatsApp Fare
              </a>
            </div>
          </div>

          <div className="reveal-up grid gap-3 rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            {[
              { label: 'Approx distance', value: `${route.km} km`, icon: Route },
              { label: 'Travel time', value: route.travelTime, icon: Clock },
              { label: 'Main route', value: route.via, icon: Navigation },
              { label: 'Driver bata', value: `Rs.${farePolicy.driverBata} included`, icon: CheckCircle2 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-teal-700">
                  <item.icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-zinc-300">{item.label}</p>
                  <p className="text-sm font-black text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Route details</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {route.from} to {route.to} cab fare estimate
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
              Distance shown here is an approximate road distance. Final live fare can change slightly based on exact
              pickup area, drop address, tolls, parking, permit, waiting, night, or hill-station charges.
            </p>

            <div className="stagger-reveal mt-6 grid gap-3">
              {route.highlights.map((item) => (
                <div key={item} className="lift-card flex items-start gap-3 rounded-lg border border-zinc-100 bg-white/90 p-4 text-sm font-medium text-zinc-700 shadow-sm">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  {item}
                </div>
              ))}
            </div>

            <div className="table-wrap mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-amber-400 text-zinc-950">
                  <tr>
                    <th scope="col" className="px-4 py-4 text-base font-black uppercase">Vehicle</th>
                    <th scope="col" className="px-4 py-4 text-base font-black uppercase">Rate / km</th>
                    <th scope="col" className="px-4 py-4 text-base font-black uppercase">Billable km</th>
                    <th scope="col" className="px-4 py-4 text-base font-black uppercase">Estimate</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleEstimates.map(({ vehicle, estimate }) => (
                    <tr key={vehicle.name} className="border-t border-zinc-200">
                      <td className="px-4 py-4">
                        <p className="text-lg font-black text-zinc-950">{vehicle.name}</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-zinc-600">{vehicle.examples}</p>
                      </td>
                      <td className="px-4 py-4 font-bold text-zinc-700">Rs.{estimate.rate}</td>
                      <td className="px-4 py-4 font-bold text-zinc-700">{estimate.billableKm} km</td>
                      <td className="px-4 py-4 text-lg font-black text-teal-700">
                        {formatInr(estimate.totalFare)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-zinc-500">
              Estimates include Rs.{farePolicy.driverBata} driver bata and minimum {farePolicy.minimumBillableKm} km
              billing where applicable. Tolls, parking, permit, waiting, and special charges are separate.
            </p>
          </div>

          <FareWidget defaultPickup={route.from} defaultDrop={route.to} />
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <RouteVisualGallery
            key={route.slug}
            from={route.from}
            to={route.to}
            image={route.image}
            imageAlt={route.imageAlt}
            destinationFocus={route.destinationFocus}
          />
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Pickup coverage</p>
            <h2 className="mt-1 text-2xl font-black">Doorstep taxi from {route.from}</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-zinc-600">
              {route.destinationFocus} Share your pickup location, date, time, car type, name, and phone number; the
              team will confirm live availability and exact fare before assigning the driver.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Pickup', body: `${route.from} city, home, hotel, railway station, airport, or office`, icon: MapPin },
                { title: 'Booking details', body: 'Pickup, drop, date, time, car type, name, and phone number', icon: CalendarDays },
              ].map((item) => (
                <div key={item.title} className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-5 shadow-sm">
                  <item.icon aria-hidden="true" className="h-6 w-6 text-teal-700" />
                  <h3 className="mt-3 text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">FAQ</p>
          <h2 className="mt-1 text-2xl font-black">Questions about {route.keyword}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {route.faqs.map((faq) => (
              <details key={faq.question} className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-5 shadow-sm">
                <summary className="cursor-pointer text-sm font-black text-zinc-950">{faq.question}</summary>
                <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {relatedRoutes.length ? (
          <section className="mt-14">
            <p className="text-sm font-black uppercase tracking-wide text-teal-700">Related routes</p>
            <h2 className="mt-1 text-2xl font-black">More one way taxi routes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedRoutes.map((item) => (
                <Link
                  key={item.slug}
                  href={`/routes/${item.slug}`}
                  className="lift-card rounded-lg border border-zinc-100 bg-white/90 p-5 shadow-sm transition hover:border-teal-300"
                >
                  <p className="text-sm font-black text-zinc-950">
                    {item.from} to {item.to} Taxi
                  </p>
                  <p className="mt-2 text-xs font-bold text-zinc-500">
                    Approx {item.km} km - {item.travelTime}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

