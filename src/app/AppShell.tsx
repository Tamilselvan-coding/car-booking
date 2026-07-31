'use client';

import type { ReactNode } from 'react';
import { BookingModal } from '../components/BookingModal';
import { SiteLayout } from '../components/Layout';
import { BookingModalProvider } from '../context/BookingModalContext';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <BookingModalProvider>
      <SiteLayout>{children}</SiteLayout>
      <BookingModal />
    </BookingModalProvider>
  );
}
