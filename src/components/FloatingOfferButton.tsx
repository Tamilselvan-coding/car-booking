'use client';

import { Sparkles, Flame } from 'lucide-react';
import { useOffers } from '../context/OfferContext';

export function FloatingOfferButton() {
  const { activeCount, openOffers, isOpen } = useOffers();

  if (activeCount === 0 || isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-bounce">
      <button
        type="button"
        onClick={openOffers}
        className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-3 text-xs sm:text-sm font-black text-zinc-950 shadow-2xl shadow-amber-500/50 transition-all hover:scale-105 active:scale-95 border-2 border-white/80"
        aria-label="View special route offers"
      >
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </span>
        <Flame className="h-4 w-4 text-red-600 fill-current" />
        <span className="tracking-wide">
          Special Offers <span className="rounded-full bg-zinc-950 text-amber-300 px-2 py-0.5 text-[11px] font-black">{activeCount}</span>
        </span>
      </button>
    </div>
  );
}
