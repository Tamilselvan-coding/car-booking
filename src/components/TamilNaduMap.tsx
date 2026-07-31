'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ExternalLink, MapPin, Navigation, Search } from 'lucide-react';
import { mapCities, searchRemoteLocations, type Coordinates, type LocationSuggestion } from '../content';

type LeafletLatLng = [number, number];

interface LeafletMap {
  setView: (center: LeafletLatLng, zoom?: number, options?: { animate?: boolean }) => LeafletMap;
  invalidateSize: (options?: boolean | { animate?: boolean }) => LeafletMap;
  remove: () => void;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  setLatLng: (latLng: LeafletLatLng) => LeafletMarker;
  bindPopup: (content: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
}

interface LeafletLayer {
  addTo: (map: LeafletMap) => LeafletLayer;
}

interface LeafletApi {
  map: (element: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
  marker: (latLng: LeafletLatLng, options?: Record<string, unknown>) => LeafletMarker;
}

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

interface TamilNaduMapProps {
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  onSelectLocation?: (location: LocationSuggestion) => void;
  label?: string;
  compact?: boolean;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });

export function TamilNaduMap({
  selectedCity,
  onSelectCity,
  onSelectLocation,
  label,
  compact = false,
}: TamilNaduMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const selected = mapCities.find((city) => city.name === selectedCity) ?? mapCities[0];
  const preview = mapCities.find((city) => city.name === hovered) ?? selected;
  const [activePoint, setActivePoint] = useState({
    label: selected.name,
    coordinates: { lat: selected.lat, lng: selected.lng },
    zoom: 11,
  });
  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const listId = useId();
  const trimmedQuery = query.trim();

  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${activePoint.coordinates.lat}&mlon=${activePoint.coordinates.lng}#map=${activePoint.zoom}/${activePoint.coordinates.lat}/${activePoint.coordinates.lng}`;
  const activeTitle = hovered ? preview.name : activePoint.label;
  const activeDescription = hovered ? preview.note : 'Selected map location';

  const placeMarker = (coordinates: Coordinates, address: string, zoom = 14) => {
    const map = leafletMapRef.current;
    const leaflet = window.L;

    setActivePoint({ label: address, coordinates, zoom });

    if (!map || !leaflet) return;

    const latLng: LeafletLatLng = [coordinates.lat, coordinates.lng];
    map.setView(latLng, zoom, { animate: true });

    if (!markerRef.current) {
      markerRef.current = leaflet.marker(latLng).addTo(map);
    } else {
      markerRef.current.setLatLng(latLng);
    }

    markerRef.current.bindPopup(`<strong>${escapeHtml(address)}</strong>`).openPopup();
  };

  useEffect(() => {
    let retryTimer: number | undefined;

    const initMap = (attempt = 0) => {
      const element = mapElementRef.current;
      const leaflet = window.L;

      if (!element || leafletMapRef.current) return;

      if (!leaflet) {
        if (attempt < 20) {
          retryTimer = window.setTimeout(() => initMap(attempt + 1), 100);
          return;
        }

        setLeafletReady(false);
        return;
      }

      const map = leaflet.map(element, {
        scrollWheelZoom: false,
        zoomControl: true,
      });

      leafletMapRef.current = map;
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        })
        .addTo(map);

      setLeafletReady(true);
      placeMarker({ lat: selected.lat, lng: selected.lng }, selected.name, 11);

      retryTimer = window.setTimeout(() => map.invalidateSize(), 80);
    };

    initMap();

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    placeMarker({ lat: selected.lat, lng: selected.lng }, selected.name, 11);
  }, [selected.lat, selected.lng, selected.name]);

  useEffect(() => {
    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setSearching(false);
      setSearchError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError(false);

      searchRemoteLocations(trimmedQuery, controller.signal)
        .then((results) => setSuggestions(results))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setSuggestions([]);
          setSearchError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const showSuggestions =
    searchOpen && trimmedQuery.length >= 3 && (suggestions.length > 0 || searching || searchError);

  const selectLocation = (location: LocationSuggestion) => {
    setQuery(location.label);
    setSearchOpen(false);
    setActiveIndex(-1);
    placeMarker(location.coordinates, location.label, 15);
    onSelectLocation?.(location);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Escape') setSearchOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectLocation(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const handleCitySelect = (city: (typeof mapCities)[number]) => {
    setQuery(city.name);
    setSearchOpen(false);
    setActiveIndex(-1);
    placeMarker({ lat: city.lat, lng: city.lng }, city.name, 11);
    onSelectCity?.(city.name);
  };

  const visibleSuggestions = useMemo(() => suggestions.slice(0, 6), [suggestions]);
  const cardClass = compact
    ? 'map-card reveal-up rounded-lg border border-zinc-200 bg-white p-3 shadow-sm'
    : 'map-card reveal-up rounded-lg border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-950/5 sm:p-6';
  const layoutClass = compact ? 'grid gap-4' : 'grid gap-6 lg:grid-cols-[1.18fr_0.82fr]';
  const mapShellClass = compact
    ? 'relative min-h-[260px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100'
    : 'relative min-h-[340px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100';
  const mapClass = compact
    ? 'leaflet-address-map h-[260px] w-full sm:h-[300px]'
    : 'leaflet-address-map h-[340px] w-full sm:h-[430px]';
  const cityGridClass = compact
    ? 'mt-4 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1'
    : 'mt-5 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1';

  return (
    <div className={cardClass}>
      {label ? (
        <p className="mb-4 text-sm font-bold text-zinc-700">{label}</p>
      ) : null}
      <div className={layoutClass}>
        <div className="grid min-w-0 gap-3">
          <div className="relative z-20">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Search address
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  autoComplete="off"
                  placeholder="Type 3+ characters"
                  className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 pl-10 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </span>
            </label>
            {showSuggestions ? (
              <ul
                id={listId}
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-2xl"
              >
                {visibleSuggestions.map((suggestion, index) => (
                  <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectLocation(suggestion)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm font-semibold transition ${
                        index === activeIndex ? 'bg-teal-50 text-teal-700' : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="min-w-0">
                        <span className="block truncate">{suggestion.label}</span>
                        <span className="block text-xs font-medium text-zinc-500">
                          {suggestion.detail} - {suggestion.city}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
                {searching ? (
                  <li className="px-3 py-2 text-xs font-bold text-zinc-500">Searching addresses...</li>
                ) : null}
                {!searching && searchError ? (
                  <li className="px-3 py-2 text-xs font-bold text-red-600">Address search unavailable.</li>
                ) : null}
                {!searching && !searchError && visibleSuggestions.length === 0 ? (
                  <li className="px-3 py-2 text-xs font-bold text-zinc-500">No address found.</li>
                ) : null}
              </ul>
            ) : null}
          </div>

          <div className={mapShellClass}>
            <div
              ref={mapElementRef}
              className={mapClass}
              aria-label={`OpenStreetMap view of ${activePoint.label}`}
            />
            {!leafletReady ? (
              <div className="absolute inset-0 grid place-items-center bg-zinc-100 px-5 text-center text-sm font-bold text-zinc-600">
                Loading OpenStreetMap...
              </div>
            ) : null}
            <div className="pointer-events-none absolute left-3 top-3 z-[401] rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-black text-zinc-800 shadow-lg backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <Navigation aria-hidden="true" className="h-3.5 w-3.5 text-teal-700" />
                <span className="max-w-[12rem] truncate sm:max-w-[15rem]">{activePoint.label}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-teal-700">
            Free OpenStreetMap
          </p>
          <h3 className="mt-3 break-words text-xl font-black tracking-normal sm:text-2xl">
            {activeTitle}
          </h3>
          <p className="mt-2 min-h-10 text-sm font-medium leading-6 text-zinc-600">
            {activeDescription}
          </p>
          <a
            href={fullMapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-black text-teal-700 hover:text-teal-900"
          >
            Open larger map
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>

          <div className={cityGridClass}>
            {mapCities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCitySelect(city)}
                onMouseEnter={() => setHovered(city.name)}
                onMouseLeave={() => setHovered(null)}
                className={`city-pill flex min-h-10 min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-bold transition ${
                  selectedCity === city.name
                    ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
                    : 'border-zinc-200 text-zinc-700 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate">{city.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-medium leading-5 text-zinc-500">
            Map data is served by OpenStreetMap with visible attribution in the map. Address suggestions use Photon.
          </p>
        </div>
      </div>
    </div>
  );
}
  
