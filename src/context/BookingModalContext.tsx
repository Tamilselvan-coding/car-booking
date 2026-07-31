'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface BookingModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

/**
 * App-wide provider that tracks whether the Rapido-style booking modal is
 * open. Wrap the app once with this, then any "Book Taxi" button anywhere
 * can call useBookingModal().open() to launch it.
 */
export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value: BookingModalContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  return <BookingModalContext.Provider value={value}>{children}</BookingModalContext.Provider>;
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return context;
}
