'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-300 backdrop-blur transition hover:bg-amber-400/25 active:scale-95 shadow-sm ${className}`}
      title={lang === 'ta' ? 'Switch to English / ஆங்கிலத்திற்கு மாற்ற' : 'தமிழுக்கு மாற்ற / Switch to Tamil'}
      aria-label="Switch Language / மொழியை மாற்றுக"
    >
      <Languages className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
      <span className="text-[10px] text-zinc-400 font-semibold">
        ({lang === 'ta' ? 'ஆங்கிலம்' : 'Tamil'})
      </span>
    </button>
  );
}
