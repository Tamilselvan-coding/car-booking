import type { Metadata } from 'next';
import { Contact } from '../../views/Contact';

export const metadata: Metadata = {
  title: 'Contact Chettinad Express | Call, WhatsApp, or Pick Your City',
  description:
    'Contact Chettinad Express for booking, fare queries, or support. Call, WhatsApp, or tap your pickup city on the interactive Tamil Nadu map.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <Contact />;
}

