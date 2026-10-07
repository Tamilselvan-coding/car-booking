'use client';

import type { ReactNode } from 'react';
import { BookingModal } from '../components/BookingModal';
import { SiteLayout } from '../components/Layout';
import { BookingModalProvider } from '../context/BookingModalContext';
import { OfferProvider } from '../context/OfferContext';
import { LanguageProvider } from '../context/LanguageContext';
import { OfferSplashSlider } from '../components/OfferSplashSlider';
import { FloatingOfferButton } from '../components/FloatingOfferButton';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <BookingModalProvider>
        <OfferProvider>
          <SiteLayout>{children}</SiteLayout>
          <BookingModal />
          <OfferSplashSlider />
          <FloatingOfferButton />
        </OfferProvider>
      </BookingModalProvider>
    </LanguageProvider>
  );
}
