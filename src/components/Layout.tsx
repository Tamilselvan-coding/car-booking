'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { CarFront, Menu, MessageCircle, Phone, X, ShieldCheck } from 'lucide-react';
import { brand, navItems, whatsappMessage } from '../content';
import { useBookingModal } from '../context/BookingModalContext';
import { BrandLogo } from './BrandLogo';

const getPathOnly = (href: string) => href.split('#')[0] || '/';

export function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { open: openBooking } = useBookingModal();

  const waLink = `https://wa.me/${brand.cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  const telLink = `tel:${brand.cleanPhone}`;

  useEffect(() => {
    setMenuOpen(false);

    window.requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [pathname]);

  const getNavClass = (href: string) => {
    const active = pathname === getPathOnly(href);

    return `relative whitespace-nowrap px-3 py-6 text-sm font-black transition hover:text-teal-700 ${
      active
        ? 'text-zinc-950 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-1 after:rounded-t-full after:bg-amber-400'
        : 'text-zinc-600'
    }`;
  };

  const getMobileNavClass = (href: string) => {
    const active = pathname === getPathOnly(href);

    return `rounded-lg border px-3 py-3 text-sm font-black ${
      active
        ? 'border-amber-200 bg-amber-50 text-zinc-950'
        : 'border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50'
    }`;
  };

  return (
    <div className="page-surface min-h-screen text-zinc-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 bg-white shadow-[0_8px_28px_rgba(20,20,20,0.08)]">
        <div className="hidden border-b border-white/10 bg-zinc-950 text-white md:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs font-bold sm:px-6">
            <p className="truncate text-zinc-300">
              <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-amber-400" />
              24/7 Tamil Nadu taxi booking - Rs.15/km Sedan, 130 km minimum, Rs.400 bata included
            </p>
            <div className="flex shrink-0 items-center gap-5">
              <a href={telLink} className="inline-flex items-center gap-1.5 text-zinc-200 transition hover:text-amber-300">
                <Phone aria-hidden="true" className="h-3.5 w-3.5" /> {brand.phone}
              </a>
              <a href={waLink} className="inline-flex items-center gap-1.5 text-amber-300 transition hover:text-amber-200">
                <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" /> WhatsApp fare
              </a>
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-100 bg-white">
          <div className="mx-auto flex h-[76px] sm:h-[84px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="flex shrink-0 items-center py-1 transition-opacity hover:opacity-95"
              onClick={() => setMenuOpen(false)}
            >
              <BrandLogo variant="light" size="md" />
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={getNavClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 xl:flex">
              <button
                type="button"
                onClick={openBooking}
                className="shine-button inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-black text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800"
              >
                <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
              </button>
              <a
                href={telLink}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-black text-zinc-950 transition hover:border-zinc-950"
              >
                <Phone aria-hidden="true" className="h-4 w-4" /> Call Now
              </a>
              <a
                href={waLink}
                className="shine-button inline-flex h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-black text-zinc-950 shadow-lg shadow-amber-900/20 transition hover:bg-amber-300"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2 xl:hidden">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-lg border border-zinc-200 bg-white shadow-sm"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div id="mobile-menu" className="reveal-up border-t border-zinc-100 bg-white px-4 pb-4 shadow-2xl xl:hidden">
            <nav aria-label="Mobile" className="grid gap-1 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={getMobileNavClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 text-sm font-black text-white"
            >
              <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
            </button>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href={telLink} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-300 text-sm font-black">
                <Phone aria-hidden="true" className="h-4 w-4" /> Call Now
              </a>
              <a href={waLink} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 text-sm font-black text-zinc-950">
                <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="main-content" key={pathname}>
        {children}
      </main>

      <footer className="footer-band border-t border-white/10 text-zinc-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-300">Book direct</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Chettinad Express is ready 24/7</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              Outstation, local, and airport taxi service across Tamil Nadu with clear per-km pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={telLink}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-zinc-950 transition hover:bg-amber-100"
            >
              <Phone aria-hidden="true" className="h-4 w-4" /> Call Now
            </a>
            <a
              href={waLink}
              className="shine-button inline-flex h-12 items-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-500"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-white/10 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <BrandLogo variant="dark" size="sm" />
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Clean cabs, verified drivers, and live booking support for Tamil Nadu routes.
            </p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Company</p>
            <ul className="mt-3 grid gap-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/services" className="hover:text-white">Services</Link></li>
              <li><Link href="/services#tariff" className="hover:text-white">Tariff</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Taxi Services</p>
            <ul className="mt-3 grid gap-2 text-sm">
              <li><Link href="/routes" className="hover:text-white">Popular Routes</Link></li>
              <li><Link href="/outstation-taxi" className="hover:text-white">Outstation Taxi</Link></li>
              <li><Link href="/local-taxi" className="hover:text-white">Local Taxi</Link></li>
              <li><Link href="/airport-taxi" className="hover:text-white">Airport Taxi</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-white">Contact</p>
            <ul className="mt-3 grid gap-2 text-sm">
              <li>{brand.address}</li>
              <li><a href={telLink} className="hover:text-white">{brand.phone}</a></li>
              <li><a href={`mailto:${brand.email}`} className="hover:text-white">{brand.email}</a></li>
              <li>{brand.hours}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 sm:px-6">
          <span>(c) {new Date().getFullYear()} Chettinad Express. All rights reserved.</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 font-bold transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Admin Approval Portal (அட்மின் பேனல்)</span>
          </Link>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 lg:hidden">
        <button
          type="button"
          onClick={openBooking}
          aria-label="Book taxi"
          className="shine-button inline-flex h-12 items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-xl shadow-zinc-950/30"
        >
          <CarFront aria-hidden="true" className="h-4 w-4" /> Book Taxi
        </button>
        <a
          href={waLink}
          aria-label="WhatsApp enquiry"
          className="grid h-14 w-14 place-items-center rounded-full bg-teal-700 p-3.5 text-white shadow-xl shadow-teal-950/20"
        >
          <MessageCircle aria-hidden="true" className="h-6 w-6" />
        </a>
        <a
          href={telLink}
          aria-label="Call now"
          className="grid h-14 w-14 place-items-center rounded-full bg-amber-500 p-3.5 text-zinc-950 shadow-xl shadow-amber-900/20"
        >
          <Phone aria-hidden="true" className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}



