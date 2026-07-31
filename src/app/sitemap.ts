import type { MetadataRoute } from 'next';
import { brand, seoRouteLandings } from '../content';

const staticRoutes = [
  { path: '/', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/routes', priority: 0.95, changeFrequency: 'weekly' as const },
  { path: '/outstation-taxi', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/local-taxi', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/airport-taxi', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const staticUrls = staticRoutes.map((route) => ({
    url: `${brand.domain}${route.path}`,
    lastModified: today,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const routeUrls = seoRouteLandings.map((route) => ({
    url: `${brand.domain}/routes/${route.slug}`,
    lastModified: today,
    changeFrequency: 'weekly' as const,
    priority: route.from === 'Chennai' ? 0.9 : 0.82,
  }));

  return [...staticUrls, ...routeUrls];
}
