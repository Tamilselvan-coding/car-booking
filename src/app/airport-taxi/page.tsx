import type { Metadata } from 'next';
import { AirportTaxi } from '../../views/AirportTaxi';

export const metadata: Metadata = {
  title: 'Airport Taxi in Tamil Nadu | Flight-Aware Pickup & Drop | Chettinad Express',
  description:
    'Airport taxi for Chennai, Coimbatore, Madurai, Trichy, and Pondicherry airports. Flight-aware pickup, meet and greet, and fixed fares with Chettinad Express.',
  alternates: { canonical: '/airport-taxi' },
};

export default function Page() {
  return <AirportTaxi />;
}

