'use client';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({
  className = '',
  variant = 'light',
  size = 'md',
  showText = true,
}: BrandLogoProps) {
  const isDark = variant === 'dark';

  // Crisp dimensions for the vector crest emblem
  const emblemSizes = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12 sm:h-13 sm:w-13',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
  };

  const textSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-[23px] lg:text-[25px]',
    lg: 'text-2xl sm:text-3xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] sm:text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };

  const subtitleSizes = {
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
  };

  return (
    <div className={`group inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Crystal Clear Vector Shield Crest Emblem (Zero Blur, 100% Sharp) */}
      <div className={`relative shrink-0 flex items-center justify-center ${emblemSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 52 56"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 24K Luxury Gold Gradient */}
            <linearGradient id="ceGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="90%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* Deep Onyx Shield Background */}
            <linearGradient id="ceShieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Teal Glow Accent */}
            <linearGradient id="ceTealAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>

          {/* Outer Royal Shield Base */}
          <path
            d="M26 2.5 L48 8.5 C48 30 38 46 26 53.5 C14 46 4 30 4 8.5 L26 2.5 Z"
            fill="url(#ceShieldBg)"
            stroke="url(#ceGoldMetallic)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Golden Border Inset */}
          <path
            d="M26 6.5 L44 11.5 C44 29 35 43 26 49.5 C17 43 8 29 8 11.5 L26 6.5 Z"
            stroke="url(#ceGoldMetallic)"
            strokeWidth="1"
            strokeOpacity="0.5"
            fill="none"
          />

          {/* Crown & Laurel Monogram Stars */}
          <g transform="translate(26, 12.5)">
            <circle cx="-8" cy="1" r="1.3" fill="url(#ceGoldMetallic)" />
            <polygon points="0,-4 1.3,-1 4.2,-1 1.8,0.8 2.7,3.6 0,1.9 -2.7,3.6 -1.8,0.8 -4.2,-1 -1.3,-1" fill="url(#ceGoldMetallic)" />
            <circle cx="8" cy="1" r="1.3" fill="url(#ceGoldMetallic)" />
          </g>

          {/* CE Royal Lettering Accent */}
          <text
            x="26"
            y="21"
            textAnchor="middle"
            fill="url(#ceGoldMetallic)"
            fontSize="7"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="1.5"
          >
            CE
          </text>

          {/* Luxury Sedan Taxi Silhouette */}
          <g transform="translate(10.5, 23.5)">
            {/* Taxi Beacon on Roof */}
            <rect x="12" y="0" width="7" height="2.5" rx="0.8" fill="#F59E0B" stroke="#78350F" strokeWidth="0.4" />
            <rect x="13.2" y="0.6" width="4.6" height="1.3" rx="0.4" fill="#FFFFFF" />

            {/* Aerodynamic Glass Cabin */}
            <path
              d="M7.5 7 L11.5 2.5 H19.5 L23.5 7 Z"
              fill="url(#ceTealAccent)"
              opacity="0.95"
            />
            {/* Pillar separator */}
            <rect x="15.2" y="2.7" width="0.9" height="4.3" fill="#0F172A" />

            {/* Sleek Golden Car Body */}
            <path
              d="M2.5 7 C2.5 6.4 3.8 5.8 6 5.8 H25 C27.2 5.8 28.5 6.4 28.5 7 L30.5 10.5 C30.8 11.2 30.2 12 29.3 12 H1.7 C0.8 12 0.2 11.2 0.5 10.5 L2.5 7 Z"
              fill="url(#ceGoldMetallic)"
            />

            {/* Front Headlight (Bright Xenon) */}
            <polygon points="29.2,9.2 31,9.8 29.2,10.6" fill="#FEF08A" />
            {/* Rear Taillight (Ruby Red) */}
            <polygon points="1.8,9.2 0.5,9.8 1.8,10.6" fill="#EF4444" />

            {/* Front & Rear Alloy Wheels */}
            <g transform="translate(7, 12)">
              <circle cx="0" cy="0" r="3.2" fill="#0F172A" stroke="url(#ceGoldMetallic)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.3" fill="#FDE68A" />
            </g>
            <g transform="translate(24, 12)">
              <circle cx="0" cy="0" r="3.2" fill="#0F172A" stroke="url(#ceGoldMetallic)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.3" fill="#FDE68A" />
            </g>
          </g>

          {/* Bottom Gold Speed Laurels */}
          <path
            d="M13 43 C18 46 26 47 26 47 C26 47 34 46 39 43"
            stroke="url(#ceGoldMetallic)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16 40 C20 42.5 26 43.5 26 43.5 C26 43.5 32 42.5 36 40"
            stroke="url(#ceGoldMetallic)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
        </svg>
      </div>

      {/* Brand Typography (Razor Sharp & Perfectly Aligned) */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Main Brand Title */}
            <span
              className={`${textSizes[size]} font-black tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              Chettinad
            </span>

            {/* Express Gold Pill Badge */}
            <span
              className={`inline-flex items-center justify-center rounded-md bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 font-black uppercase tracking-wider text-zinc-950 shadow-sm border border-amber-300/90 shrink-0 leading-none ${badgeSizes[size]}`}
            >
              EXPRESS
            </span>
          </div>

          {/* Bottom Subtitle / Tagline */}
          <div
            className={`mt-1.5 flex items-center gap-1.5 sm:gap-2 font-bold leading-none whitespace-nowrap ${subtitleSizes[size]}`}
          >
            <span className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              DROP TAXI
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 font-bold">•</span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
              Tamil Nadu 24/7
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


