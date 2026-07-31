import { CheckCircle2 } from 'lucide-react';
import { FareWidget } from '../components/FareWidget';
import { airportContent } from '../content';

const airports = ['Chennai International Airport', 'Coimbatore Airport', 'Madurai Airport', 'Trichy Airport', 'Pondicherry Airport'];

export function AirportTaxi() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="reveal-up grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">Airport Taxi</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">On-time airport pickup and drop</h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-600">{airportContent.intro}</p>
        </div>
        <div className="image-frame aspect-[16/9] rounded-lg shadow-2xl shadow-zinc-950/10">
          <img
            src="/images/airport-taxi.png"
            alt="White airport taxi waiting at a terminal pickup lane with luggage"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <ul className="stagger-reveal grid gap-3">
            {airportContent.highlights.map((point) => (
              <li key={point} className="lift-card flex items-start gap-3 rounded-lg border border-zinc-100 bg-white/90 p-4 text-sm font-medium text-zinc-700 shadow-sm">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                {point}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-black">Airports covered</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {airports.map((airport) => (
              <span key={airport} className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
                {airport}
              </span>
            ))}
          </div>
        </div>

        <FareWidget defaultPickup="Chennai International Airport" defaultDrop="Chennai" />
      </div>
    </div>
  );
}
