import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import { brand, faqs } from '../content';
import '../styles.css';

const siteDescription =
  'Book reliable one way drop taxi, airport taxi, round trip cab, and outstation cab service across Chennai, Coimbatore, Madurai, Trichy, Karaikudi, Pondicherry, and Tamil Nadu.';

const keywords = [
  'one way drop taxi',
  'drop taxi Tamil Nadu',
  'Chennai to Karaikudi taxi',
  'Chennai to Trichy taxi',
  'Karaikudi to Chennai taxi',
  'Madurai to Chennai taxi',
  'Chennai to Coimbatore taxi',
  'Chennai airport taxi',
  'outstation cab Tamil Nadu',
  'one way cab Chennai',
];

export const metadata: Metadata = {
  metadataBase: new URL(brand.domain),
  title: {
    default: 'One Way Drop Taxi in Tamil Nadu | Chettinad Express',
    template: '%s',
  },
  description: siteDescription,
  keywords,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/taxi-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: brand.name,
    title: 'Chettinad Express - One Way Drop Taxi in Tamil Nadu',
    description:
      'Transparent fares, verified drivers, clean cars, and 24/7 cab booking for one way drops, airport taxi, and outstation trips.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Chettinad Express' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chettinad Express - One Way Drop Taxi in Tamil Nadu',
    description: 'Book one way drop taxi and outstation cabs across Tamil Nadu with clear tariffs and 24/7 support.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f59e0b',
};

const taxiServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: brand.name,
  url: brand.domain,
  image: `${brand.domain}/og-image.png`,
  telephone: brand.phone.replace(/\s/g, '-'),
  priceRange: 'Rs.15/km - Rs.26/km, Rs.400 driver bata included',
  areaServed: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Karaikudi', 'Salem', 'Pondicherry', 'Tamil Nadu'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: brand.city,
    addressRegion: brand.state,
    addressCountry: 'IN',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  sameAs: [`https://wa.me/${brand.cleanPhone}`],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.slice(0, 3).map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceSchema) }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" crossOrigin="" />
      </body>
    </html>
  );
}


