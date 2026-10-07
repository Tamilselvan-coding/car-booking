'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-300 backdrop-blur transition hover:bg-amber-400/20 active:scale-95 ${className}`}
      title="Switch Language / மொழியை மாற்றுக"
      aria-label="Switch Language / மொழியை மாற்றுக"
    >
      <Languages className="h-3.5 w-3.5 text-amber-400" />
      <span>{lang === 'ta' ? 'தமிழ்' : 'English'}</span>
      <span className="text-[10px] text-zinc-400 opacity-70">
        ({lang === 'ta' ? 'EN' : 'தமிழ்'})
      </span>
    </button>
  );
}
