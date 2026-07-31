import { MapPin, Route } from 'lucide-react';
import { destinationGallery } from '../content';

type Destination = (typeof destinationGallery)[number];

interface DestinationGalleryProps {
  compact?: boolean;
}

function DestinationCard({
  destination,
  duplicate = false,
  compact = false,
}: {
  destination: Destination;
  duplicate?: boolean;
  compact?: boolean;
}) {
  return (
    <article
      aria-hidden={duplicate || undefined}
      className={`destination-card lift-card group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-white shadow-sm ${
        compact ? 'destination-card-grid' : ''
      }`}
    >
      <img
        src={destination.image}
        alt={duplicate ? '' : destination.imageAlt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:saturate-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-5">
        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-zinc-950">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-teal-700" />
          {destination.city}
        </span>
        <h3 className="text-xl font-black">{destination.routeKeyword}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-zinc-200">{destination.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {destination.routes.map((route) => (
            <span
              key={route}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-zinc-100 backdrop-blur"
            >
              <Route aria-hidden="true" className="h-3 w-3 text-amber-300" />
              {route}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function DestinationGallery({ compact = false }: DestinationGalleryProps) {
  if (compact) {
    return (
      <div className="stagger-reveal mt-8 grid gap-5 sm:grid-cols-2">
        {destinationGallery.map((destination) => (
          <DestinationCard key={destination.city} destination={destination} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="destination-rail mt-8">
      <div className="destination-track">
        {destinationGallery.map((destination) => (
          <DestinationCard key={destination.city} destination={destination} />
        ))}
        {destinationGallery.map((destination) => (
          <DestinationCard key={`${destination.city}-duplicate`} destination={destination} duplicate />
        ))}
      </div>
    </div>
  );
}
