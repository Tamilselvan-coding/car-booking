import type { Metadata } from 'next';
import { RoutesIndex } from '../../views/RoutesIndex';

export const metadata: Metadata = {
  title: 'Popular Taxi Routes in Tamil Nadu | Chettinad Express',
  description:
    'Browse Chettinad Express route landing pages for Chennai to Karaikudi, Chennai to Trichy, Madurai to Chennai, Coimbatore routes, and more one way drop taxi fares.',
  alternates: { canonical: '/routes' },
};

export default function Page() {
  return <RoutesIndex />;
}

