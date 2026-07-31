import type { Metadata } from 'next';
import { Faq } from '../../views/Faq';

export const metadata: Metadata = {
  title: 'FAQ | Chettinad Express Booking, Fare & Pickup Questions',
  description:
    'Answers to common Chettinad Express questions: minimum km, toll charges, round trip, local rental, airport pickup, and how to select your city.',
  alternates: { canonical: '/faq' },
};

export default function Page() {
  return <Faq />;
}

