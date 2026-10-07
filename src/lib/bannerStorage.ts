import fs from 'node:fs';
import path from 'node:path';
import type { BannerItem, BannerFormData, BannerSummary } from '../types/banner';

const DATA_FILE = path.join(process.cwd(), 'data', 'banners.json');

const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Chennai to Madurai Festive Special Drop',
    from_city: 'Chennai',
    to_city: 'Madurai',
    vehicle_type: 'Sedan (Dzire / Etios)',
    available_vehicles: [
      'Sedan (Dzire / Etios)',
      'SUV (Ertiga)',
      'Innova Crysta',
      'Tempo Traveller',
    ],
    trip_type: 'One Way',
    actual_price: 6800,
    offer_price: 4999,
    from_date: '2026-10-01',
    to_date: '2026-10-15',
    quotation_ref: 'QT-CHM-2026-778',
    quotation_details: 'All-inclusive toll allowance, ₹400 driver bata included, sanitized AC car, zero hidden charges.',
    banner_image: '/images/special-offer-banner.jpg',
    is_active: true,
    created_at: '2026-10-01T06:00:00.000Z',
    updated_at: '2026-10-01T06:00:00.000Z',
  },
  {
    id: 2,
    title: 'Trichy to Chennai Express One Way Drop',
    from_city: 'Trichy',
    to_city: 'Chennai',
    vehicle_type: 'Sedan (Dzire / Etios)',
    available_vehicles: [
      'Sedan (Dzire / Etios)',
      'SUV (Ertiga)',
      'Innova Crysta',
    ],
    trip_type: 'One Way',
    actual_price: 5400,
    offer_price: 3999,
    from_date: '2026-09-28',
    to_date: '2026-10-20',
    quotation_ref: 'QT-TRC-2026-902',
    quotation_details: 'Doorstep pickup anywhere in Trichy, express highway drop to Chennai with driver allowance.',
    banner_image: '/images/destination-trichy.png',
    is_active: true,
    created_at: '2026-10-01T06:30:00.000Z',
    updated_at: '2026-10-01T06:30:00.000Z',
  },
  {
    id: 3,
    title: 'Coimbatore to Bangalore Highway Special',
    from_city: 'Coimbatore',
    to_city: 'Bangalore',
    vehicle_type: 'SUV (Ertiga)',
    available_vehicles: [
      'Sedan (Dzire / Etios)',
      'SUV (Ertiga)',
      'Innova Crysta',
    ],
    trip_type: 'One Way',
    actual_price: 7800,
    offer_price: 5999,
    from_date: '2026-10-05',
    to_date: '2026-10-25',
    quotation_ref: 'QT-COB-2026-301',
    quotation_details: 'Interstate tax included, clean 7-seater SUV, 24/7 highway assistance.',
    banner_image: '/images/destination-coimbatore.png',
    is_active: false,
    created_at: '2026-10-01T07:00:00.000Z',
    updated_at: '2026-10-01T07:00:00.000Z',
  },
];

function ensureDataFile(): BannerItem[] {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_BANNERS, null, 2), 'utf-8');
      return INITIAL_BANNERS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BANNERS;
  } catch (err) {
    console.error('Failed reading banners file:', err);
    return INITIAL_BANNERS;
  }
}

function writeBannersFile(banners: BannerItem[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(banners, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing banners file:', err);
    return false;
  }
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAllBanners(): BannerItem[] {
  return ensureDataFile();
}

/**
 * Returns only approved active banners whose date range covers today.
 * Admin Approval Requirement: is_active must be true!
 */
export function getActiveBanners(today?: string): BannerItem[] {
  const todayStr = today || getTodayString();
  const all = getAllBanners();
  return all.filter((b) => {
    if (!b.is_active) return false;
    if (b.from_date && b.from_date > todayStr) return false;
    if (b.to_date && b.to_date < todayStr) return false;
    return true;
  });
}

export function getBannerById(id: number): BannerItem | null {
  const all = getAllBanners();
  return all.find((b) => b.id === id) || null;
}

export function createBanner(data: BannerFormData): BannerItem {
  const all = getAllBanners();
  const nextId = all.length ? Math.max(...all.map((b) => b.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newBanner: BannerItem = {
    id: nextId,
    ...data,
    actual_price: Number(data.actual_price),
    offer_price: Number(data.offer_price),
    is_active: Boolean(data.is_active),
    created_at: now,
    updated_at: now,
  };

  all.unshift(newBanner);
  writeBannersFile(all);
  return newBanner;
}

export function updateBanner(id: number, data: Partial<BannerFormData>): BannerItem | null {
  const all = getAllBanners();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = all[index];
  const updated: BannerItem = {
    ...existing,
    ...data,
    actual_price: data.actual_price !== undefined ? Number(data.actual_price) : existing.actual_price,
    offer_price: data.offer_price !== undefined ? Number(data.offer_price) : existing.offer_price,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active,
    updated_at: new Date().toISOString(),
  };

  all[index] = updated;
  writeBannersFile(all);
  return updated;
}

export function setBannerStatus(id: number, isActive: boolean): BannerItem | null {
  return updateBanner(id, { is_active: isActive });
}

export function deleteBanner(id: number): boolean {
  const all = getAllBanners();
  const filtered = all.filter((b) => b.id !== id);
  if (filtered.length === all.length) return false;
  writeBannersFile(filtered);
  return true;
}

export function getBannerSummary(today?: string): BannerSummary {
  const todayStr = today || getTodayString();
  const all = getAllBanners();

  let live = 0;
  let scheduled = 0;
  let inactive = 0;

  for (const b of all) {
    if (!b.is_active) {
      inactive++;
    } else if (b.from_date > todayStr) {
      scheduled++;
    } else if (b.to_date < todayStr) {
      inactive++;
    } else {
      live++;
    }
  }

  return {
    total: all.length,
    live,
    scheduled,
    inactive,
  };
}
