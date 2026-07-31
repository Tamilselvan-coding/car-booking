import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RouteLanding } from '../../../views/RouteLanding';
import { brand, getSeoRouteBySlug, seoRouteLandings } from '../../../content';

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return seoRouteLandings.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getSeoRouteBySlug(slug);

  if (!route) {
    return {
      title: 'Taxi Route Not Found | Chettinad Express',
      robots: { index: false, follow: false },
    };
  }

  const title = `${route.from} to ${route.to} Taxi | One Way Drop Cab | Chettinad Express`;

  return {
    title,
    description: route.metaDescription,
    keywords: [
      route.keyword,
      `${route.from} to ${route.to} drop taxi`,
      `${route.from} to ${route.to} cab`,
      `${route.to} taxi booking`,
      'one way drop taxi Tamil Nadu',
    ],
    alternates: { canonical: `/routes/${route.slug}` },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: `/routes/${route.slug}`,
      siteName: brand.name,
      title,
      description: route.metaDescription,
      images: [{ url: route.image, alt: route.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: route.metaDescription,
      images: [route.image],
    },
  };
}

export default async function Page({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = getSeoRouteBySlug(slug);

  if (!route) notFound();

  return <RouteLanding route={route} />;
}

