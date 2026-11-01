'use client';

import { X, Luggage, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LuggagePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LuggagePolicyModal({ isOpen, onClose }: LuggagePolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="luggage-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Luggage className="h-5 w-5" />
            </div>
            <div>
              <h3 id="luggage-policy-title" className="text-lg font-black text-zinc-950">
                Luggage Policy
              </h3>
              <p className="text-xs text-zinc-500">Cab baggage limits & extra luggage terms</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-zinc-700">
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 space-y-2.5">
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
              Standard Vehicle Luggage Capacity
            </h4>
            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-black text-zinc-900">Sedan (4+1):</span>{' '}
                  Up to 2 medium suitcases + small handbags (max 30 kg).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-black text-zinc-900">SUV (6+1):</span>{' '}
                  Up to 4 medium suitcases + small handbags (max 50 kg).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-black text-zinc-900">MUV (7+1) & Innova Crysta:</span>{' '}
                  Up to 5 large suitcases with flexible third-row boot space.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2 text-zinc-800">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <ShieldAlert className="h-4 w-4" />
              <span>Extra Luggage & Carrier Charges</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                <strong>Luggage charges Rs. 300</strong> applies when extra luggage exceeds vehicle boot capacity or occupies passenger seating space.
              </li>
              <li>
                Roof carrier / top carrier can be requested in advance for selected MUV / SUV vehicles.
              </li>
              <li>
                Hazardous materials, contraband, or commercial goods strictly prohibited.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-black text-white hover:bg-zinc-800 transition"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
