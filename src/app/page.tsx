import type { Metadata } from 'next';
import { Home } from '../views/Home';

export const metadata: Metadata = {
  title: 'Chettinad Express | Outstation, Local & Airport Cabs in Tamil Nadu',
  description:
    'Book one way, round trip, local, or airport taxi anywhere in Tamil Nadu. Get Chennai to Trichy, Karaikudi to Chennai, and Madurai to Chennai cab estimates with 24/7 support.',
  alternates: { canonical: '/' },
};

export default function Page() {
  return <Home />;
}

