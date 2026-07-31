'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Calculator, ChevronRight, MapPin, Phone, X } from 'lucide-react';
import {
  brand,
  calculateFareEstimate,
  getLocalLocationSelection,
  getLocationCity,
  type LocationSuggestion,
  resolveRouteDistance,
  tariffRules,
  tripTypes,
  vehicleRates,
  whatsappMessage,
} from '../content';
import { TamilNaduMap } from './TamilNaduMap';
import { CityAutocomplete } from './CityAutocomplete';

interface FareWidgetProps {
  showMap?: boolean;
  defaultPickup?: string;
  defaultDrop?: string;
}

type RouteState = {
  status: 'idle' | 'calculating' | 'ready' | 'known' | 'estimated' | 'manual';
  note: string;
};

export function FareWidget({ showMap = true, defaultPickup = 'Chennai', defaultDrop = 'Coimbatore' }: FareWidgetProps) {
  const [tripType, setTripType] = useState<(typeof tripTypes)[number]>('One Way');
  const [vehicle, setVehicle] = useState(vehicleRates[0].name);
  const [distance, setDistance] = useState(250);
  const [pickup, setPickup] = useState(defaultPickup);
  const [drop, setDrop] = useState(defaultDrop);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState<LocationSuggestion | null>(() =>
    getLocalLocationSelection(defaultPickup),
  );
  const [dropLocation, setDropLocation] = useState<LocationSuggestion | null>(() =>
    getLocalLocationSelection(defaultDrop),
  );
  const [pickingField, setPickingField] = useState<'pickup' | 'drop' | null>(null);
  const [formStatus, setFormStatus] = useState('');
  const [distanceConfirmed, setDistanceConfirmed] = useState(true);
  const [routeState, setRouteState] = useState<RouteState>({ status: 'idle', note: '' });

  const selectedVehicle = vehicleRates.find((item) => item.name === vehicle) ?? vehicleRates[0];
  const fareEstimate = useMemo(
    () => calculateFareEstimate(tripType, distance, selectedVehicle),
    [distance, selectedVehicle, tripType],
  );
  const isMapPickerOpen = showMap && pickingField !== null;
  const mapPickerTitle = `Choose ${pickingField === 'drop' ? 'drop' : 'pickup'} location`;

  useEffect(() => {
    if (!pickup.trim() || !drop.trim()) {
      setDistanceConfirmed(false);
      setRouteState({ status: 'idle', note: '' });
      return;
    }

    const controller = new AbortController();
    setDistanceConfirmed(false);
    setRouteState({ status: 'calculating', note: 'Calculating route km...' });

    resolveRouteDistance(pickup, drop, pickupLocation, dropLocation, controller.signal)
      .then((result) => {
        if (!result) {
          setRouteState({
            status: 'manual',
            note: 'Select suggested pickup and drop addresses to auto-calculate km.',
          });
          return;
        }

        setDistance(result.distanceKm);
        setDistanceConfirmed(true);

        if (result.source === 'route') {
          setRouteState({
            status: 'ready',
            note: result.durationMinutes
              ? `Road route auto calculated - about ${result.durationMinutes} min.`
              : 'Road route auto calculated.',
          });
        } else if (result.source === 'known') {
          setRouteState({ status: 'known', note: 'Popular route km auto selected.' });
        } else {
          setRouteState({ status: 'estimated', note: 'Approx route km calculated; edit if needed.' });
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setDistanceConfirmed(false);
        setRouteState({ status: 'manual', note: 'Route km unavailable; edit manually.' });
      });

    return () => controller.abort();
  }, [drop, dropLocation, pickup, pickupLocation]);

  useEffect(() => {
    if (!isMapPickerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickingField(null);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMapPickerOpen]);

  const handleMapSelect = (city: string) => {
    const location = getLocalLocationSelection(city);
    setDistanceConfirmed(false);

    if (pickingField === 'drop') {
      setDrop(city);
      setDropLocation(location);
    } else {
      setPickup(city);
      setPickupLocation(location);
    }
  };

  const handleMapLocationSelect = (location: LocationSuggestion) => {
    setDistanceConfirmed(false);
    if (pickingField === 'drop') {
      setDrop(location.label);
      setDropLocation(location);
    } else {
      setPickup(location.label);
      setPickupLocation(location);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phoneDigits = customerPhone.replace(/\D/g, '');
    const normalizedPickup = pickup.trim().toLocaleLowerCase('en-IN');
    const normalizedDrop = drop.trim().toLocaleLowerCase('en-IN');

    if (!normalizedPickup || !normalizedDrop) {
      setFormStatus('Choose both a pickup and drop location.');
      return;
    }

    if (normalizedPickup === normalizedDrop) {
      setFormStatus('Pickup and drop locations must be different.');
      return;
    }

    if (!pickupDate || !pickupTime) {
      setFormStatus('Choose your pickup date and time.');
      return;
    }

    if (!distanceConfirmed || routeState.status === 'calculating') {
      setFormStatus('Wait for the route distance, or enter the route km manually.');
      return;
    }

    if (!customerName.trim() || !/^\d{10}$/.test(phoneDigits)) {
      setFormStatus('Enter your name and a valid 10-digit phone number.');
      return;
    }

    window.open(
      `https://wa.me/${brand.cleanPhone}?text=${prefilledWhatsapp}`,
      '_blank',
      'noopener,noreferrer',
    );
    setFormStatus(
      `Thanks ${customerName.trim()}. WhatsApp opened with your ${pickup} to ${drop} enquiry ready to send.`,
    );
  };

  const prefilledWhatsapp = encodeURIComponent(
    `${whatsappMessage} Route: ${pickup} to ${drop}, ${tripType}, ${vehicle}. Date: ${pickupDate || 'flexible'} ${pickupTime || ''}. Actual route: ${fareEstimate.actualKm} km. Billable distance: ${fareEstimate.billableKm} km. Estimated total: Rs.${fareEstimate.totalFare.toLocaleString('en-IN')} including Rs.${fareEstimate.driverBata} driver bata. Name: ${customerName || 'not given'}. Phone: ${customerPhone || 'not given'}.`,
  );

  return (
    <div className="reveal-up grid min-w-0 gap-4">
      <div className="fare-card min-w-0 rounded-lg border border-white/70 bg-white/95 p-4 text-zinc-950 shadow-2xl backdrop-blur sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-teal-700">Quick booking</p>
            <h2 className="mt-1 text-2xl font-black tracking-normal">Check taxi fare</h2>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
            <Calculator aria-hidden="true" className="h-5 w-5" />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid min-w-0 gap-4">
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-zinc-100 p-1 shadow-inner">
            {tripTypes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTripType(item)}
                className={`min-h-10 rounded-lg px-2 text-xs font-black transition sm:text-sm ${
                  tripType === item ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-700 hover:bg-white hover:text-teal-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Pickup address
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CityAutocomplete
                    value={pickup}
                    onChange={(value) => {
                      setPickup(value);
                      setDistanceConfirmed(false);
                    }}
                    onSelect={setPickupLocation}
                    label="Pickup address"
                    placeholder="Type area, city or landmark"
                    required
                  />
                </div>
                {showMap ? (
                  <button
                    type="button"
                    onClick={() => setPickingField(pickingField === 'pickup' ? null : 'pickup')}
                    aria-pressed={pickingField === 'pickup'}
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition ${
                      pickingField === 'pickup'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-zinc-200 text-zinc-500 hover:border-teal-400'
                    }`}
                    aria-label="Choose pickup city on map"
                  >
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Drop address
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <CityAutocomplete
                    value={drop}
                    onChange={(value) => {
                      setDrop(value);
                      setDistanceConfirmed(false);
                    }}
                    onSelect={setDropLocation}
                    label="Drop address"
                    placeholder="Type area, city or landmark"
                    required
                  />
                </div>
                {showMap ? (
                  <button
                    type="button"
                    onClick={() => setPickingField(pickingField === 'drop' ? null : 'drop')}
                    aria-pressed={pickingField === 'drop'}
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition ${
                      pickingField === 'drop'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-zinc-200 text-zinc-500 hover:border-teal-400'
                    }`}
                    aria-label="Choose drop city on map"
                  >
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Pickup date
              <input
                type="date"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
                required
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Pickup date"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Pickup time
              <input
                type="time"
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
                required
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Pickup time"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Vehicle
              <select
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Vehicle type"
              >
                {vehicleRates.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              {tripType === 'Round Trip' ? 'Route km per side' : 'Route km'}
              <input
                type="number"
                min={1}
                value={distance}
                onChange={(event) => {
                  setDistance(Number(event.target.value));
                  setDistanceConfirmed(true);
                  setRouteState({ status: 'manual', note: 'Using manually entered route km.' });
                }}
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Route distance in kilometers"
              />
              {routeState.note ? (
                <span
                  className={`text-xs font-bold ${
                    routeState.status === 'manual' || routeState.status === 'estimated'
                      ? 'text-amber-700'
                      : routeState.status === 'calculating'
                        ? 'text-zinc-500'
                        : 'text-teal-700'
                  }`}
                >
                  {routeState.note}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Your name
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Full name"
                required
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Customer name"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-800">
              Phone number
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                pattern="[0-9]{10}"
                required
                className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                aria-label="Customer phone number"
              />
            </label>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-zinc-700">Estimated total fare</p>
              <p className="text-2xl font-black tracking-normal text-zinc-950">
                Rs.{fareEstimate.totalFare.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-zinc-600">
              Base fare Rs.{fareEstimate.baseFare.toLocaleString('en-IN')} ({fareEstimate.billableKm} km x
              Rs.{fareEstimate.rate}/km{fareEstimate.multiplier > 1 ? ' x return' : ''}) + driver bata
              Rs.{fareEstimate.driverBata}. {tariffRules.gstNote} Minimum: {fareEstimate.minimumKm} km
              {tripType === 'Round Trip' ? ' per day' : ''}. Excludes toll, permit, parking, waiting, and other
              applicable charges.
            </p>
            {fareEstimate.billableKm > fareEstimate.actualKm ? (
              <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-black leading-5 text-amber-900">
                Minimum fare applied: the {fareEstimate.actualKm} km route is billed as {fareEstimate.billableKm} km.
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className="shine-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800"
            >
              Send Booking Enquiry
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <a
              href={`tel:${brand.cleanPhone}`}
              className="shine-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800"
            >
              <Phone aria-hidden="true" className="h-4 w-4" /> Call Booking Desk
            </a>
          </div>
          {formStatus ? (
            <p role="status" aria-live="polite" className="text-sm font-bold text-teal-700">
              {formStatus}
            </p>
          ) : null}
        </form>
      </div>

      {isMapPickerOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-zinc-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPickingField(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fare-map-picker-title"
            className="reveal-up max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:rounded-2xl sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p id="fare-map-picker-title" className="text-base font-black text-zinc-950">
                  {mapPickerTitle}
                </p>
                <p className="text-xs font-bold text-zinc-500">
                  Search an address or tap a city pin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickingField(null)}
                aria-label="Close map picker"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <TamilNaduMap
              label={`Tap a city to set ${pickingField === 'pickup' ? 'pickup' : 'drop'} location`}
              selectedCity={getLocationCity(pickingField === 'pickup' ? pickup : drop)}
              onSelectCity={handleMapSelect}
              onSelectLocation={handleMapLocationSelect}
              compact
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
