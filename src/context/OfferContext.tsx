'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BannerItem } from '../types/banner';

interface OfferContextValue {
  isOpen: boolean;
  activeCount: number;
  openOffers: () => void;
  closeOffers: () => void;
  banners: BannerItem[];
  refreshOffers: () => Promise<void>;
}

const OfferContext = createContext<OfferContextValue | null>(null);

export function OfferProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const fetchActiveOffers = async () => {
    try {
      const res = await fetch('/api/banners/active', { cache: 'no-store' });
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        setBanners(json.data);
      }
    } catch (err) {
      console.error('Failed to load active offers in OfferProvider:', err);
    }
  };

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const value: OfferContextValue = {
    isOpen,
    activeCount: banners.length,
    openOffers: () => setIsOpen(true),
    closeOffers: () => setIsOpen(false),
    banners,
    refreshOffers: fetchActiveOffers,
  };

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffers() {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error('useOffers must be used within an OfferProvider');
  }
  return context;
}
