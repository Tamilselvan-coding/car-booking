import type { Metadata } from 'next';
import { About } from '../../views/About';

export const metadata: Metadata = {
  title: 'About Chettinad Express | Outstation Cab Service in Tamil Nadu',
  description:
    'Learn about Chettinad Express: 8+ years serving Tamil Nadu with verified drivers, transparent per-km pricing, and 25+ cities covered.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <About />;
}

