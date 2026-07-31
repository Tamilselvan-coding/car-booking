import type { Metadata } from 'next';
import { OutstationTaxi } from '../../views/OutstationTaxi';

export const metadata: Metadata = {
  title: 'Outstation Taxi in Tamil Nadu | One Way & Round Trip | Chettinad Express',
  description:
    'Book outstation taxi across Tamil Nadu for Chennai to Trichy, Karaikudi to Chennai, Madurai to Chennai, and more. Sedan, SUV, MUV, and Innova Crysta cabs with clear fare estimates.',
  alternates: { canonical: '/outstation-taxi' },
};

export default function Page() {
  return <OutstationTaxi />;
}

