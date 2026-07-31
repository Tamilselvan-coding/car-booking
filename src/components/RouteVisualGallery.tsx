'use client';

import Image from 'next/image';
import { Camera, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { destinationGallery } from '../content';

interface RouteVisualGalleryProps {
  from: string;
  to: string;
  image: string;
  imageAlt: string;
  destinationFocus: string;
}

interface RouteVisual {
  city: string;
  image: string;
  imageAlt: string;
  title: string;
  body: string;
}

export function RouteVisualGallery({
  from,
  to,
  image,
  imageAlt,
  destinationFocus,
}: RouteVisualGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visuals = useMemo(() => {
    const routeImageCity = destinationGallery.find((item) => item.image === image)?.city ?? 'Route view';
    const routeVisual: RouteVisual = {
      city: routeImageCity,
      image,
      imageAlt,
      title: `${from} to ${to}`,
      body: destinationFocus,
    };
    const orderedDestinations = [
      ...destinationGallery.filter((item) => item.city === to),
      ...destinationGallery.filter((item) => item.city === from && item.city !== to),
      ...destinationGallery.filter((item) => item.city !== to && item.city !== from),
    ].map(
      (item): RouteVisual => ({
        city: item.city,
        image: item.image,
        imageAlt: item.imageAlt,
        title: item.routeKeyword,
        body: item.body,
      }),
    );
    const seenImages = new Set<string>();

    return [routeVisual, ...orderedDestinations]
      .filter((item) => {
        if (seenImages.has(item.image)) return false;
        seenImages.add(item.image);
        return true;
      })
      .slice(0, 4);
  }, [destinationFocus, from, image, imageAlt, to]);
  const selectedVisual = visuals[Math.min(activeIndex, visuals.length - 1)];

  return (
    <div className="grid gap-3">
      <figure className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10">
        <div className="group relative aspect-[16/10] overflow-hidden bg-zinc-200">
          <Image
            src={selectedVisual.image}
            alt={selectedVisual.imageAlt}
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03] group-hover:saturate-110"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-zinc-950 shadow-sm backdrop-blur">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-teal-700" />
            {selectedVisual.city}
          </span>
        </div>
        <figcaption aria-live="polite" className="p-4">
          <p className="flex items-center gap-2 text-sm font-black text-zinc-950">
            <Camera aria-hidden="true" className="h-4 w-4 text-teal-700" />
            {selectedVisual.title}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-zinc-600">{selectedVisual.body}</p>
        </figcaption>
      </figure>

      {visuals.length > 1 ? (
        <div className="flex snap-x gap-2 overflow-x-auto pb-1" role="group" aria-label="Choose destination scenery">
          {visuals.map((visual, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={visual.image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
                className={`group min-w-24 flex-1 snap-start overflow-hidden rounded-lg border bg-white text-left shadow-sm outline-none transition focus-visible:ring-4 focus-visible:ring-teal-200 sm:min-w-28 ${
                  isActive ? 'border-teal-600 ring-2 ring-teal-100' : 'border-zinc-200 hover:border-teal-400'
                }`}
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-zinc-200">
                  <Image
                    src={visual.image}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className={`block truncate px-2 py-2 text-xs font-black ${isActive ? 'text-teal-700' : 'text-zinc-700'}`}>
                  {visual.city}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
