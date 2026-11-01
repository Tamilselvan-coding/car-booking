'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Car,
  Plane,
  Clock,
  Sparkles,
  CheckCheck,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { brand } from '../content';

type ChatStep = 'main' | 'oneway' | 'roundtrip' | 'airport' | 'tariff';
type BotLang = 'en' | 'ta';

export function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [step, setStep] = useState<ChatStep>('main');
  const [botLang, setBotLang] = useState<BotLang>('en'); // Default is English as requested
  const [customText, setCustomText] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTa = botLang === 'ta';

  // Read saved preference if any, but default is English ('en')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ce_chatbot_lang');
      if (saved === 'ta' || saved === 'en') {
        setBotLang(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSwitchLang = (newLang: BotLang) => {
    setBotLang(newLang);
    try {
      localStorage.setItem('ce_chatbot_lang', newLang);
    } catch {
      // ignore
    }
  };

  // Automatically show greeting tooltip after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat when step or language changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [step, isOpen, botLang]);

  const handleOpenWhatsApp = (text: string) => {
    const url = `https://wa.me/${brand.cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const msg = isTa
      ? `வணக்கம் Chettinad Express, எனது டாக்ஸி கோரிக்கை: ${customText.trim()}`
      : `Hi Chettinad Express, Taxi Enquiry: ${customText.trim()}`;
    handleOpenWhatsApp(msg);
    setCustomText('');
  };

  const handleQuickRoute = (from: string, to: string) => {
    const msg = isTa
      ? `வணக்கம் Chettinad Express! நான் ஒரு வழி டாக்ஸி முன்பதிவு செய்ய விரும்புகிறேன்.\nபிக்கப் இடம்: ${from}\nஇறங்கும் இடம்: ${to}\nவாகனம்: Sedan\nகட்டண விபரம் தெரிவிக்கவும்.`
      : `Hi Chettinad Express! I want to book a One-Way Drop Taxi.\nPickup: ${from}\nDrop: ${to}\nVehicle: Sedan\nPlease share fare and availability details.`;
    handleOpenWhatsApp(msg);
  };

  const handleOneWaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCity.trim() || !dropCity.trim()) return;
    const msg = isTa
      ? `வணக்கம் Chettinad Express! ஒரு வழி டாக்ஸி முன்பதிவு கோரிக்கை:\nபிக்கப் இடம்: ${pickupCity.trim()}\nஇறங்கும் இடம்: ${dropCity.trim()}\nவாகனம்: ${selectedVehicle}\nதேதி: ${travelDate || 'முடிவாகவில்லை'}\nகட்டண விபரம் அனுப்பவும்.`
      : `Hi Chettinad Express! One-Way Drop Taxi Enquiry:\nFrom: ${pickupCity.trim()}\nTo: ${dropCity.trim()}\nVehicle: ${selectedVehicle}\nDate: ${travelDate || 'Flexible'}\nPlease send estimated fare & confirm cab.`;
    handleOpenWhatsApp(msg);
  };

  const handleRoundTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCity.trim() || !dropCity.trim()) return;
    const msg = isTa
      ? `வணக்கம் Chettinad Express! இரு வழி (Round Trip) டாக்ஸி முன்பதிவு கோரிக்கை:\nதொடக்க இடம்: ${pickupCity.trim()}\nசெல்லும் இடம்: ${dropCity.trim()}\nவாகனம்: ${selectedVehicle}\nபயண தேதி: ${travelDate || 'முடிவாகவில்லை'}\nகட்டண விபரம் அனுப்பவும்.`
      : `Hi Chettinad Express! Round-Trip Taxi Enquiry:\nStarting Point: ${pickupCity.trim()}\nDestination: ${dropCity.trim()}\nVehicle: ${selectedVehicle}\nTravel Date: ${travelDate || 'Flexible'}\nPlease share package pricing.`;
    handleOpenWhatsApp(msg);
  };

  const handleAirportSelect = (airportName: string, city: string) => {
    const msg = isTa
      ? `வணக்கம் Chettinad Express! விமான நிலைய டாக்ஸி சேவை தேவை:\nவிமான நிலையம்: ${airportName}\nஊர் / பிக்கப்: ${city}\nகட்டண விபரம் அனுப்பவும்.`
      : `Hi Chettinad Express! Airport Taxi Booking Enquiry:\nAirport: ${airportName}\nCity / Pickup Area: ${city}\nPlease provide fare details & driver availability.`;
    handleOpenWhatsApp(msg);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 flex flex-col items-end">
        {/* Tooltip greeting popup */}
        {!isOpen && showTooltip && hasPrompted && (
          <div className="relative mb-3 max-w-[280px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl bg-zinc-950 p-3.5 text-white shadow-2xl border border-emerald-500/30">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    {isTa ? '24/7 வாட்ஸ்அப் உதவி' : '24/7 WhatsApp Taxi Bot'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTooltip(false)}
                  className="text-zinc-400 hover:text-white"
                  aria-label="Close tooltip"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-zinc-200">
                {isTa
                  ? 'வணக்கம்! டாக்ஸி முன்பதிவு செய்ய இங்கே சாட் செய்யலாம். (6385326954)'
                  : 'Hi there! Need a quick cab booking or fare quote? Chat with our bot! (6385326954)'}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(true);
                    setShowTooltip(false);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-zinc-950 transition hover:bg-emerald-400"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{isTa ? 'சாட் தொடங்கு' : 'Start Chat'}</span>
                </button>
                {/* Quick language switch in tooltip */}
                <button
                  type="button"
                  onClick={() => handleSwitchLang(isTa ? 'en' : 'ta')}
                  className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-white/20"
                >
                  {isTa ? 'English' : 'தமிழ்'}
                </button>
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-zinc-950 border-r border-b border-emerald-500/30"></div>
          </div>
        )}

        {/* The Main Round WhatsApp Trigger Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowTooltip(false);
          }}
          aria-label="Open WhatsApp Chatbot"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-700/50 transition-all hover:scale-110 hover:bg-emerald-500 active:scale-95 border-2 border-white"
        >
          {/* Glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping opacity-75"></span>

          {isOpen ? (
            <X className="relative h-6 w-6 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <MessageCircle className="relative h-7 w-7" />
              {/* Unread dot badge */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-zinc-950 border-2 border-white shadow">
                1
              </span>
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Chatbot Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 top-20 z-50 flex flex-col overflow-hidden rounded-3xl bg-[#efeae2] shadow-2xl sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto sm:h-[630px] sm:w-[400px] border border-zinc-300 animate-in fade-in zoom-in-95 duration-200">
          {/* Chatbot Header */}
          <div className="bg-[#075E54] px-4 py-3 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-800 shadow-inner font-black text-sm">
                    🚖
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#075E54]"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-black tracking-wide">
                      {brand.name}
                    </h3>
                    <ShieldCheck className="h-4 w-4 text-emerald-300 fill-emerald-300/20 shrink-0" />
                  </div>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    {isTa ? 'ஆன்லைன் | 24/7 உதவி' : 'Online | 24/7 Taxi Bot'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Prominent Language Switcher in Header */}
                <div className="flex items-center rounded-full bg-black/25 p-0.5 border border-white/20">
                  <button
                    type="button"
                    onClick={() => handleSwitchLang('en')}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-black transition ${
                      botLang === 'en'
                        ? 'bg-white text-[#075E54] shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchLang('ta')}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-black transition ${
                      botLang === 'ta'
                        ? 'bg-amber-400 text-zinc-950 shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>

                <a
                  href={`tel:${brand.cleanPhone}`}
                  className="rounded-full p-1.5 text-white hover:bg-white/10 transition"
                  title={`Call: ${brand.phone}`}
                  aria-label="Direct Phone Call"
                >
                  <Phone className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white hover:bg-white/10 transition"
                  aria-label="Close Chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Subheader: Hotline + Language switch prompt */}
          <div className="bg-[#128C7E] px-3.5 py-1.5 text-xs text-white/95 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-1.5 truncate">
              <span>📞 Hotline:</span>
              <a
                href={`tel:${brand.cleanPhone}`}
                className="bg-amber-400 text-zinc-950 px-2 py-0.5 rounded text-[11px] font-black hover:bg-amber-300 transition"
              >
                {brand.phone}
              </a>
            </div>

            <button
              type="button"
              onClick={() => handleSwitchLang(isTa ? 'en' : 'ta')}
              className="flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold text-amber-200 hover:bg-white/25 transition shrink-0"
            >
              <Languages className="h-3 w-3" />
              <span>{isTa ? 'Switch to English' : 'தமிழில் பேச'}</span>
            </button>
          </div>

          {/* Chat Content Body */}
          <div
            className="flex-1 overflow-y-auto p-3.5 space-y-3"
            style={{
              backgroundImage:
                'radial-gradient(#d1d7db 0.8px, transparent 0.8px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Date pill */}
            <div className="flex justify-center">
              <span className="rounded-full bg-white/80 px-3 py-0.5 text-[10px] font-bold text-zinc-600 shadow-sm backdrop-blur">
                {isTa ? 'இன்று • Chettinad Express' : 'Today • Chettinad Express'}
              </span>
            </div>

            {/* Language Switch Pill Banner inside Chat */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-zinc-600">
                {isTa ? 'மொழி / Language:' : 'Language / மொழி:'}
              </span>
              <div className="inline-flex rounded-lg bg-white p-1 shadow-sm border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchLang('en')}
                  className={`px-2.5 py-0.5 rounded font-bold transition ${
                    botLang === 'en'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  🇬🇧 English (Default)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchLang('ta')}
                  className={`px-2.5 py-0.5 rounded font-bold transition ${
                    botLang === 'ta'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  🇮🇳 தமிழ்
                </button>
              </div>
            </div>

            {/* Bot Message 1: Welcome Greeting */}
            <div className="flex items-start gap-2">
              <div className="rounded-2xl rounded-tl-sm bg-white p-3 text-xs leading-relaxed text-zinc-800 shadow-sm border border-zinc-200/60 max-w-[90%]">
                <p className="font-bold text-emerald-800">
                  {isTa
                    ? 'வணக்கம்! Chettinad Express டாக்ஸி முன்பதிவு உதவிக்கு வரவேற்கிறோம்! 🚕'
                    : 'Hello! Welcome to Chettinad Express Drop Taxi Service! 🚕'}
                </p>
                <p className="mt-1 text-zinc-600">
                  {isTa
                    ? 'தமிழ்நாடு முழுவதும் குறைந்த கட்டணத்தில் பாதுகாப்பான ஒன்-வே மற்றும் ரவுண்ட் ட்ரிப் டாக்ஸி சேவை.'
                    : 'Safe, sanitized, lowest fare outstation and one-way taxi service across Tamil Nadu.'}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Official Booking Assistant</span>
                  <span className="flex items-center text-emerald-600">
                    <CheckCheck className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Step: Main Menu */}
            {step === 'main' && (
              <div className="flex items-start gap-2 animate-in fade-in duration-200">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-xs text-zinc-800 shadow-sm border border-zinc-200/60 w-full space-y-2.5">
                  <p className="font-bold text-zinc-900">
                    {isTa
                      ? 'உங்களுக்கு என்ன சேவை தேவை? கீழேயுள்ள ஆப்ஷனைத் தேர்வு செய்யவும்:'
                      : 'How can we help your trip today? Please select an option below:'}
                  </p>

                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('oneway')}
                      className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-left text-xs font-bold text-emerald-950 transition hover:bg-emerald-100 hover:border-emerald-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-600 p-1.5 text-white">🚖</span>
                        <span>{isTa ? 'ஒரு வழி டாக்ஸி (One-Way Drop Taxi)' : 'One-Way Drop Taxi (Save 40%)'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-emerald-600 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('roundtrip')}
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-left text-xs font-bold text-amber-950 transition hover:bg-amber-100 hover:border-amber-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-lg bg-amber-500 p-1.5 text-white">🔄</span>
                        <span>{isTa ? 'இரு வழி பயணம் (Round Trip Taxi)' : 'Round Trip Taxi Booking'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-amber-600 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('airport')}
                      className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 text-left text-xs font-bold text-sky-950 transition hover:bg-sky-100 hover:border-sky-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-lg bg-sky-600 p-1.5 text-white">✈️</span>
                        <span>{isTa ? 'விமான நிலைய டாக்ஸி (Airport Pickup/Drop)' : 'Airport Taxi (MAA / TRZ / IXM)'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-sky-600 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('tariff')}
                      className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 p-2.5 text-left text-xs font-bold text-purple-950 transition hover:bg-purple-100 hover:border-purple-300"
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-lg bg-purple-600 p-1.5 text-white">💰</span>
                        <span>{isTa ? 'கட்டண விபரம் (Tariff & Rates)' : 'Tariff Rates (Per KM Price)'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-purple-600 shrink-0" />
                    </button>

                    <a
                      href={`tel:${brand.cleanPhone}`}
                      className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/70 p-2.5 text-left text-xs font-bold text-red-950 transition hover:bg-red-100"
                    >
                      <span className="flex items-center gap-2">
                        <span className="rounded-lg bg-red-600 p-1.5 text-white">📞</span>
                        <span>{isTa ? 'நேரடி அழைப்பு: 6385326954' : 'Direct Call: +91 63853 26954'}</span>
                      </span>
                      <Phone className="h-4 w-4 text-red-600 shrink-0" />
                    </a>
                  </div>

                  {/* Popular Quick Route Chips */}
                  <div className="pt-2 border-t border-zinc-100">
                    <p className="text-[11px] font-bold text-zinc-500 mb-1.5">
                      {isTa ? '⚡ பிரபல வழித்தடங்கள் (1-Click WhatsApp):' : '⚡ Popular Routes (1-Click Booking):'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { from: 'Chennai', to: 'Karaikudi' },
                        { from: 'Karaikudi', to: 'Chennai' },
                        { from: 'Trichy', to: 'Madurai' },
                        { from: 'Madurai', to: 'Coimbatore' },
                      ].map((r) => (
                        <button
                          key={`${r.from}-${r.to}`}
                          type="button"
                          onClick={() => handleQuickRoute(r.from, r.to)}
                          className="rounded-full bg-zinc-100 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-[11px] font-bold text-zinc-700 transition"
                        >
                          {r.from} ➔ {r.to}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: One-Way Drop Taxi Form */}
            {step === 'oneway' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setStep('main')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white/80 px-2 py-1 rounded shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isTa ? 'பின்செல்ல' : 'Back to Menu'}</span>
                </button>

                <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-xs shadow-sm border border-zinc-200/60">
                  <h4 className="font-black text-sm text-emerald-800 flex items-center gap-1.5">
                    <span>🚖</span>
                    <span>{isTa ? 'ஒரு வழி டாக்ஸி முன்பதிவு' : 'One-Way Drop Taxi'}</span>
                  </h4>
                  <p className="mt-1 text-zinc-500 text-[11px]">
                    {isTa
                      ? 'ஒரு வழி கட்டணம் மட்டும்! திரும்பும் கட்டணம் இல்லை (Sedan ₹15/km, SUV ₹20/km)'
                      : 'Pay only for one-way distance! No return fare. (Sedan ₹15/km, SUV ₹20/km)'}
                  </p>

                  <form onSubmit={handleOneWaySubmit} className="mt-3 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        {isTa ? 'பிக்கப் ஊர் / இடம் (Pickup City):' : 'Pickup City / Location:'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isTa ? 'எ.கா: Karaikudi / Chennai' : 'e.g. Karaikudi / Chennai'}
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        {isTa ? 'இறங்கும் ஊர் (Drop City):' : 'Drop City / Destination:'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isTa ? 'எ.கா: Madurai / Trichy / Coimbatore' : 'e.g. Madurai / Trichy / Coimbatore'}
                        value={dropCity}
                        onChange={(e) => setDropCity(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                          {isTa ? 'பயண தேதி:' : 'Travel Date:'}
                        </label>
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                          {isTa ? 'வாகனம்:' : 'Vehicle:'}
                        </label>
                        <select
                          value={selectedVehicle}
                          onChange={(e) => setSelectedVehicle(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="Sedan (Dzire/Etios)">Sedan (₹15/km)</option>
                          <option value="SUV (Ertiga)">SUV (₹20/km)</option>
                          <option value="MUV (Innova/Xylo)">MUV (₹21/km)</option>
                          <option value="Innova Crysta">Innova Crysta (₹26/km)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-black text-white hover:bg-emerald-500 shadow-md shadow-emerald-700/20 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isTa ? 'வாட்ஸ்அப்பில் முன்பதிவு செய்' : 'Send to WhatsApp (6385326954)'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Step: Round Trip Form */}
            {step === 'roundtrip' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setStep('main')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white/80 px-2 py-1 rounded shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isTa ? 'பின்செல்ல' : 'Back to Menu'}</span>
                </button>

                <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-xs shadow-sm border border-zinc-200/60">
                  <h4 className="font-black text-sm text-amber-800 flex items-center gap-1.5">
                    <span>🔄</span>
                    <span>{isTa ? 'இரு வழி பயணம் (Round Trip)' : 'Round Trip Taxi Booking'}</span>
                  </h4>
                  <p className="mt-1 text-zinc-500 text-[11px]">
                    {isTa
                      ? 'இரு வழி பயணங்களுக்கு சிறப்பு கட்டணம்! Sedan ₹13/km, SUV ₹18/km, MUV ₹18/km, Innova Crysta ₹23/km (Min 250km/day)'
                      : 'Special discount on round trips! Sedan ₹13/km, SUV ₹18/km, MUV ₹18/km, Innova Crysta ₹23/km (Min 250 km/day)'}
                  </p>

                  <form onSubmit={handleRoundTripSubmit} className="mt-3 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        {isTa ? 'தொடக்க இடம் (Pickup City):' : 'Starting Location:'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karaikudi"
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        {isTa ? 'செல்லும் இடங்கள் (Destinations):' : 'Destination Cities:'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Madurai, Rameswaram, Kanyakumari"
                        value={dropCity}
                        onChange={(e) => setDropCity(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                          {isTa ? 'பயண தேதி:' : 'Travel Date:'}
                        </label>
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                          {isTa ? 'வாகனம்:' : 'Vehicle:'}
                        </label>
                        <select
                          value={selectedVehicle}
                          onChange={(e) => setSelectedVehicle(e.target.value)}
                          className="w-full rounded-lg border border-zinc-300 p-2 text-xs focus:border-emerald-600 focus:outline-none"
                        >
                          <option value="Sedan (Dzire/Etios)">Sedan (₹13/km)</option>
                          <option value="SUV (Ertiga)">SUV (₹18/km)</option>
                          <option value="MUV (Innova/Xylo)">MUV (₹18/km)</option>
                          <option value="Innova Crysta">Innova Crysta (₹23/km)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 font-black text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-600/20 transition"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isTa ? 'வாட்ஸ்அப்பில் பேக்கேஜ் கேட்க' : 'Get Round Trip Quote on WhatsApp'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Step: Airport Taxi Selection */}
            {step === 'airport' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setStep('main')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white/80 px-2 py-1 rounded shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isTa ? 'பின்செல்ல' : 'Back to Menu'}</span>
                </button>

                <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-xs shadow-sm border border-zinc-200/60 space-y-2.5">
                  <h4 className="font-black text-sm text-sky-800 flex items-center gap-1.5">
                    <span>✈️</span>
                    <span>{isTa ? 'விமான நிலைய டாக்ஸி சேவை' : 'Airport Pickup & Drop Taxi'}</span>
                  </h4>
                  <p className="text-zinc-500 text-[11px]">
                    {isTa
                      ? 'சரியான நேரத்தில் பிக்கப், லக்கேஜ் வசதி, 24/7 விமான நிலைய டாக்ஸி சேவை.'
                      : 'On-time flight pickup & drop, sanitized cars with generous luggage space.'}
                  </p>

                  <div className="grid gap-2 pt-1">
                    {[
                      { airport: 'Trichy Airport (TRZ)', city: 'Karaikudi / Thanjavur / Pudukkottai' },
                      { airport: 'Madurai Airport (IXM)', city: 'Karaikudi / Sivagangai / Ramanathapuram' },
                      { airport: 'Chennai Airport (MAA)', city: 'Pondicherry / Vellore / Villupuram' },
                      { airport: 'Coimbatore Airport (CJB)', city: 'Tiruppur / Erode / Salem' },
                    ].map((item) => (
                      <button
                        key={item.airport}
                        type="button"
                        onClick={() => handleAirportSelect(item.airport, item.city)}
                        className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/60 p-2.5 text-left text-xs font-bold text-sky-950 transition hover:bg-sky-100"
                      >
                        <div>
                          <p className="font-black text-sky-900">{item.airport}</p>
                          <p className="text-[11px] text-zinc-500 font-medium">{item.city}</p>
                        </div>
                        <Send className="h-4 w-4 text-sky-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Tariff & Rates */}
            {step === 'tariff' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => setStep('main')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white/80 px-2 py-1 rounded shadow-sm"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isTa ? 'பின்செல்ல' : 'Back to Menu'}</span>
                </button>

                <div className="rounded-2xl rounded-tl-sm bg-white p-4 text-xs shadow-sm border border-zinc-200/60 space-y-2.5">
                  <h4 className="font-black text-sm text-purple-900 flex items-center gap-1.5">
                    <span>💰</span>
                    <span>{isTa ? 'தெளிவான கட்டண விபரம்' : 'Official Tariff Rates'}</span>
                  </h4>

                  <div className="grid gap-2 pt-1">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-zinc-900">Sedan (4+1)</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">₹15/km</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Dzire, Etios, Xcent | Drop: ₹15/km | Round: ₹13/km</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-zinc-900">SUV (6+1)</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">₹20/km</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Ertiga, Kia Carens | Drop: ₹20/km | Round: ₹18/km</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-zinc-900">MUV (7+1)</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">₹21/km</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Innova, Xylo, Marazzo | Drop: ₹21/km | Round: ₹18/km</p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-zinc-900">Innova Crysta</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">₹26/km</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">Premium 6+1 | Drop: ₹26/km | Round: ₹23/km</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-900 font-medium">
                    ⚠️ {isTa ? 'குறைந்தபட்ச தூரம்: 100 கி.மீ | டிரைவர் பேட்டா: ₹400' : 'Min billable: 100 km for drop | Driver batta: ₹400'}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenWhatsApp(
                        isTa
                          ? 'வணக்கம் Chettinad Express! நான் கட்டண விபரம் பற்றி பேசி டாக்ஸி புக் செய்ய விரும்புகிறேன்.'
                          : 'Hi Chettinad Express! I have checked your tariff. I want to book a taxi.'
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-black text-white hover:bg-emerald-500 shadow transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{isTa ? 'வாட்ஸ்அப்பில் பேச' : 'Chat on WhatsApp (6385326954)'}</span>
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Chat Input Bar at Bottom */}
          <div className="bg-[#f0f2f5] p-2.5 border-t border-zinc-300">
            <form onSubmit={handleSendCustomMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={
                  isTa ? 'ரூட் அல்லது தகவல் தட்டச்சு செய்க...' : 'Type route e.g. Chennai to Madurai...'
                }
                className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs text-zinc-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={!customText.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#128C7E] text-white shadow hover:bg-[#075E54] disabled:opacity-40 transition"
                aria-label="Send message to WhatsApp"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-zinc-500">
              <span>{isTa ? 'உடனடி வாட்ஸ்அப் இணைப்பு' : 'Instant 24x7 WhatsApp Connect'}</span>
              <span className="font-bold text-emerald-700">📱 {brand.phone}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
