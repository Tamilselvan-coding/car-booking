'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
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
import { useBookingModal } from '../context/BookingModalContext';
import { CityAutocomplete } from './CityAutocomplete';
import { TamilNaduMap } from './TamilNaduMap';

const stepLabels = ['Trip', 'Ride', 'Details', 'Confirm'];

type RouteState = {
  status: 'idle' | 'calculating' | 'ready' | 'known' | 'estimated' | 'manual';
  note: string;
};

/**
 * Rapido-style booking flow: Where to -> choose ride -> your details -> confirm.
 * No backend exists to dispatch a real driver, so the final step hands the
 * request off to a prefilled WhatsApp message / tap-to-call instead of a
 * live driver match.
 */
export function BookingModal() {
  const { isOpen, close, initialData } = useBookingModal();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [tripType, setTripType] = useState<(typeof tripTypes)[number]>('One Way');
  const [pickup, setPickup] = useState('Chennai');
  const [drop, setDrop] = useState('Coimbatore');
  const [pickingField, setPickingField] = useState<'pickup' | 'drop' | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [distanceKm, setDistanceKm] = useState(250);
  const [vehicle, setVehicle] = useState(vehicleRates[0].name);
  const [pickupLocation, setPickupLocation] = useState<LocationSuggestion | null>(() =>
    getLocalLocationSelection('Chennai'),
  );
  const [dropLocation, setDropLocation] = useState<LocationSuggestion | null>(() =>
    getLocalLocationSelection('Coimbatore'),
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [distanceConfirmed, setDistanceConfirmed] = useState(true);
  const [routeState, setRouteState] = useState<RouteState>({ status: 'idle', note: '' });

  // Pre-fill from special offer when opened via offer slider
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.pickup) {
        setPickup(initialData.pickup);
        const loc = getLocalLocationSelection(initialData.pickup);
        if (loc) setPickupLocation(loc);
      }
      if (initialData.drop) {
        setDrop(initialData.drop);
        const loc = getLocalLocationSelection(initialData.drop);
        if (loc) setDropLocation(loc);
      }
      if (initialData.vehicle) {
        const found = vehicleRates.find((v) =>
          initialData.vehicle?.toLowerCase().includes(v.name.toLowerCase()) ||
          v.name.toLowerCase().includes(initialData.vehicle?.toLowerCase() || '')
        );
        if (found) setVehicle(found.name);
      }
      if (
        initialData.tripType === 'One Way' ||
        initialData.tripType === 'Round Trip' ||
        initialData.tripType === 'Airport'
      ) {
        setTripType(initialData.tripType);
      }
    }
  }, [isOpen, initialData]);


  const selectedVehicle = vehicleRates.find((item) => item.name === vehicle) ?? vehicleRates[0];
  const fareEstimate = useMemo(
    () => calculateFareEstimate(tripType, distanceKm, selectedVehicle),
    [distanceKm, selectedVehicle, tripType],
  );

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

        setDistanceKm(result.distanceKm);
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

  const phoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));

  const summaryLine = `${pickup} to ${drop}, ${tripType}, ${vehicle}, ${fareEstimate.actualKm} km`;
  const prefilledWhatsapp = encodeURIComponent(
    `${whatsappMessage} Route: ${summaryLine}. Billable distance: ${fareEstimate.billableKm} km. Estimated total: Rs.${fareEstimate.totalFare.toLocaleString('en-IN')} including Rs.${fareEstimate.driverBata} driver bata. Date: ${date || 'flexible'} ${time || ''}. Name: ${
      name || 'not given'
    }. Phone: ${phone || 'not given'}.`,
  );
  const waLink = `https://wa.me/${brand.cleanPhone}?text=${prefilledWhatsapp}`;
  const telLink = `tel:${brand.cleanPhone}`;

  // Lock body scroll and allow Escape-to-close while open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Reset the wizard each time it's freshly opened.
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setSubmitted(false);
      setPickingField(null);
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const routeFieldsValid =
    pickup.trim().length > 0 &&
    drop.trim().length > 0 &&
    pickup.trim().toLocaleLowerCase('en-IN') !== drop.trim().toLocaleLowerCase('en-IN') &&
    date.length > 0 &&
    time.length > 0 &&
    distanceConfirmed &&
    routeState.status !== 'calculating';
  const customerFieldsValid = name.trim().length > 0 && phoneValid;
  const canGoNext = step === 0 ? routeFieldsValid : step === 2 ? customerFieldsValid : true;

  const goNext = () => {
    if (!canGoNext) return;
    if (step < 3) setStep((current) => current + 1);
  };

  const goBack = () => setStep((current) => Math.max(0, current - 1));

  const handleConfirm = () => {
    setSubmitted(true);
    // Save to backend database
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name || 'Customer',
        phone,
        pickup,
        drop,
        vehicle,
        trip_type: tripType,
        date: date || new Date().toISOString().slice(0, 10),
        time: time || '10:00',
        estimated_fare: fareEstimate.totalFare,
        offer_code: initialData?.offerCode,
        offer_price: initialData?.offerPrice,
        source: initialData?.offerCode ? 'Offer Slider' : 'Direct Booking',
      }),
    }).catch((err) => console.error('Failed to save booking order to backend:', err));

    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-zinc-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        tabIndex={-1}
        className="reveal-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <p id="booking-modal-title" className="text-lg font-black text-zinc-950">
              {submitted ? 'Booking enquiry ready' : 'Book your taxi'}
            </p>
            {!submitted ? (
              <p className="text-xs font-bold text-zinc-500">
                Step {step + 1} of 4 - {stepLabels[step]}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close booking form"
            className="grid h-10 w-10 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {!submitted ? (
          <div className="flex gap-1 px-5 pt-3">
            {stepLabels.map((label, index) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full transition ${
                  index <= step ? 'bg-teal-600' : 'bg-zinc-100'
                }`}
              />
            ))}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {submitted ? (
            <div className="grid gap-4 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-700">
                <Check aria-hidden="true" className="h-8 w-8" />
              </span>
              <div>
                <p className="text-base font-black text-zinc-950">Your enquiry is ready to send</p>
                <p className="mt-1 text-sm font-medium leading-6 text-zinc-600">
                  WhatsApp opened with your trip details prefilled. Tap send there so our booking desk can confirm
                  the driver and final fare. You can also call us directly.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left text-sm font-semibold text-zinc-700">
                <p>{pickup} to {drop} - {tripType}</p>
                <p>{vehicle} - {fareEstimate.actualKm} km</p>
                <p>Billable distance: {fareEstimate.billableKm} km</p>
                {date ? <p>Date: {date} {time}</p> : null}
                {name ? <p>Name: {name}</p> : null}
                {phone ? <p>Phone: {phone}</p> : null}
                <p className="mt-2 text-base font-black text-zinc-950">
                  Estimated fare: Rs.{fareEstimate.totalFare.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" /> Open WhatsApp
                </a>
                <a
                  href={telLink}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-5 text-sm font-black text-zinc-950 transition hover:border-zinc-950"
                >
                  <Phone aria-hidden="true" className="h-4 w-4" /> Call Now
                </a>
              </div>
              <button
                type="button"
                onClick={close}
                className="mt-1 text-sm font-black text-zinc-500 underline-offset-2 hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {step === 0 ? (
                <div className="grid gap-4">
                  {initialData?.offerCode ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs font-bold text-amber-950">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-black uppercase text-zinc-950">
                          Special Offer
                        </span>
                        <span>Ref: <strong className="font-mono">{initialData.offerCode}</strong></span>
                      </div>
                      {initialData.offerPrice ? (
                        <span className="font-black text-teal-800">
                          Deal Fare: ₹{initialData.offerPrice.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-zinc-100 p-1">
                    {tripTypes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTripType(item)}
                        className={`min-h-10 rounded-lg px-2 text-xs font-black transition sm:text-sm ${
                          tripType === item ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-700 hover:bg-white'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

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
                      <button
                        type="button"
                        onClick={() => setPickingField(pickingField === 'pickup' ? null : 'pickup')}
                        aria-pressed={pickingField === 'pickup'}
                        aria-label="Choose pickup city on map"
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition ${
                          pickingField === 'pickup' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-zinc-200 text-zinc-500 hover:border-teal-400'
                        }`}
                      >
                        <MapPin aria-hidden="true" className="h-4 w-4" />
                      </button>
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
                      <button
                        type="button"
                        onClick={() => setPickingField(pickingField === 'drop' ? null : 'drop')}
                        aria-pressed={pickingField === 'drop'}
                        aria-label="Choose drop city on map"
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition ${
                          pickingField === 'drop' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-zinc-200 text-zinc-500 hover:border-teal-400'
                        }`}
                      >
                        <MapPin aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                  </label>

                  {pickingField ? (
                    <TamilNaduMap
                      label={`Tap a city to set ${pickingField === 'pickup' ? 'pickup' : 'drop'} location`}
                      selectedCity={getLocationCity(pickingField === 'pickup' ? pickup : drop)}
                      onSelectCity={handleMapSelect}
                      onSelectLocation={handleMapLocationSelect}
                      compact
                    />
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-2 text-sm font-bold text-zinc-800">
                      Date
                      <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                        className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-zinc-800">
                      Time
                      <input
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        required
                        className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-bold text-zinc-800">
                    {tripType === 'Round Trip' ? 'Route km per side' : 'Route km'}
                    <input
                      type="number"
                      min={1}
                      value={distanceKm}
                      onChange={(event) => {
                        setDistanceKm(Number(event.target.value));
                        setDistanceConfirmed(true);
                        setRouteState({ status: 'manual', note: 'Using manually entered route km.' });
                      }}
                      className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
              ) : null}

              {step === 1 ? (
                <div className="grid gap-3">
                  <p className="text-sm font-medium text-zinc-600">
                    {pickup} to {drop} - {distanceKm} km - {tripType}
                  </p>
                  {vehicleRates.map((item) => {
                    const itemFare = calculateFareEstimate(tripType, distanceKm, item);
                    const isSelected = vehicle === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setVehicle(item.name)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-4 rounded-lg border p-4 text-left transition ${
                          isSelected ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100' : 'border-zinc-200 hover:border-teal-300'
                        }`}
                      >
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${isSelected ? 'bg-teal-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                          <item.icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-black text-zinc-950">{item.name}</span>
                            <span className="font-black text-zinc-950">Rs.{itemFare.totalFare.toLocaleString('en-IN')}</span>
                          </span>
                          <span className="block text-xs font-semibold text-zinc-500">
                            {item.examples} - {item.seats} - includes Rs.{itemFare.driverBata} bata
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-bold text-zinc-800">
                    Your name
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Full name"
                      required
                      className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-zinc-800">
                    Phone number
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      required
                      className="h-12 rounded-lg border border-zinc-200 px-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                    {!phoneValid && phone.length > 0 ? (
                      <span className="text-xs font-bold text-red-600">Enter a valid 10-digit mobile number.</span>
                    ) : null}
                  </label>
                  <p className="text-xs font-medium leading-5 text-zinc-500">
                    Used only to confirm your booking and share driver details before pickup.
                  </p>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold text-zinc-700">
                    <p className="text-base font-black text-zinc-950">{pickup} to {drop}</p>
                    <p className="mt-1">{tripType} - {vehicle} - {fareEstimate.actualKm} km</p>
                    <p>Billable distance: {fareEstimate.billableKm} km</p>
                    {date ? <p>Date: {date} {time}</p> : <p>Date: flexible</p>}
                    <p>Name: {name || 'not given'}</p>
                    <p>Phone: {phone || 'not given'}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-zinc-700">Estimated fare</p>
                      <p className="text-2xl font-black text-zinc-950">Rs.{fareEstimate.totalFare.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="mt-2 text-xs font-medium leading-5 text-zinc-600">
                      Base fare Rs.{fareEstimate.baseFare.toLocaleString('en-IN')} + driver bata
                      Rs.{fareEstimate.driverBata}. {tariffRules.gstNote} Excludes toll, permit, parking, waiting,
                      and other applicable charges.
                    </p>
                  </div>
                  <p className="text-xs font-medium leading-5 text-zinc-500">
                    Confirming sends this trip to our booking desk on WhatsApp. A real person will verify the
                    fare and assign a driver, since bookings here are not auto-dispatched.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {!submitted ? (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-12 items-center gap-1 rounded-lg border border-zinc-300 px-4 text-sm font-black text-zinc-950 transition hover:border-zinc-950"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className="shine-button inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-black text-white transition hover:bg-teal-800 sm:flex-none"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" /> Confirm Booking
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
