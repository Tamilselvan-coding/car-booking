import type { Metadata } from 'next';
import { LocalTaxi } from '../../views/LocalTaxi';

export const metadata: Metadata = {
  title: 'Local Taxi Rental in Tamil Nadu | Hourly & Day Packages | Chettinad Express',
  description:
    'Hourly and full-day local taxi rental in Chennai and major Tamil Nadu cities. Sedan and SUV packages for meetings, errands, and sightseeing with a dedicated driver.',
  alternates: { canonical: '/local-taxi' },
};

export default function Page() {
  return <LocalTaxi />;
}

