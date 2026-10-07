'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface BookingInitialData {
  pickup?: string;
  drop?: string;
  vehicle?: string;
  tripType?: 'One Way' | 'Round Trip' | 'Airport';
  offerCode?: string;
  offerPrice?: number;
  actualPrice?: number;
}

interface BookingModalContextValue {
  isOpen: boolean;
  initialData: BookingInitialData | null;
  open: (data?: BookingInitialData | unknown) => void;
  close: () => void;
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

/**
 * App-wide provider that tracks whether the booking modal is open
 * and accepts optional initial offer/route details.
 */
export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<BookingInitialData | null>(null);

  const value: BookingModalContextValue = {
    isOpen,
    initialData,
    open: (data?: BookingInitialData | unknown) => {
      if (data && typeof data === 'object' && !('nativeEvent' in data) && ('pickup' in data || 'offerCode' in data)) {
        setInitialData(data as BookingInitialData);
      } else {
        setInitialData(null);
      }
      setIsOpen(true);
    },
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

