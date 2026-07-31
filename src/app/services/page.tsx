import type { Metadata } from 'next';
import { Services } from '../../views/Services';

export const metadata: Metadata = {
  title: 'Taxi Services in Tamil Nadu | Chettinad Express',
  description:
    'Explore all Chettinad Express services: one way drop, round trip, airport transfer, and local rental packages across Tamil Nadu with transparent per-km pricing.',
  alternates: { canonical: '/services' },
};

export default function Page() {
  return <Services />;
}

