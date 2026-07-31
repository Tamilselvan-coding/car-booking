# Chettinad Express Site

SEO-friendly Next.js + TypeScript + Tailwind website for a one way drop taxi and outstation cab service in Tamil Nadu.

## What is included

- Next.js App Router setup
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Local hero and Open Graph image assets
- Booking and fare estimate UI
- Tariff, routes, services, fleet, testimonials, FAQ, and CTA sections
- Route-level SEO metadata, Open Graph, Twitter cards, JSON-LD, `robots.txt`, and `sitemap.xml`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Verify fare policy

```bash
npm test
```

## Replace before publishing

- Brand name in `src/content.ts`
- Phone, WhatsApp number, email, and city in `src/content.ts`
- Production domain in `src/content.ts`, `public/robots.txt`, and `src/app/sitemap.ts`
- Route prices and tariff values in `src/content.ts`



