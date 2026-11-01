import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { BannerItem, BannerFormData, BannerSummary } from '../types/banner';
import type { BookingOrderItem, LoginLogItem } from '../types/backend';

// -------------------------------------------------------------
// Supabase Configuration
// Set these in .env.local:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// -------------------------------------------------------------

export const getActiveSupabaseConfig = (): { url: string; key: string } => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('ce_custom_supabase_url');
    const savedKey = localStorage.getItem('ce_custom_supabase_key');
    if (savedUrl && savedKey) {
      url = savedUrl;
      key = savedKey;
    }
  }
  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getActiveSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id')
  );
};

export function saveCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ce_custom_supabase_url', url.trim());
    localStorage.setItem('ce_custom_supabase_key', key.trim());
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ce_custom_supabase_url');
    localStorage.removeItem('ce_custom_supabase_key');
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getActiveSupabaseConfig();
  if (!isSupabaseConfigured()) return null;
  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(url, key, { auth: { persistSession: true } });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const supabase = getSupabaseClient();

// Default Seed Banners (Used when DB is empty or during local fallback)
export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Chennai to Madurai Festive Special Drop',
    from_city: 'Chennai',
    to_city: 'Madurai',
    vehicle_type: 'Sedan (Dzire / Etios)',
    available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta', 'Tempo Traveller'],
    trip_type: 'One Way',
    banner_image: '/images/destination-madurai.png',
    actual_price: 6800,
    offer_price: 4999,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    quotation_ref: 'QT-CHM-2026-778',
    quotation_details: 'All-inclusive toll allowance, ₹400 driver bata included, sanitized AC car, zero hidden charges.',
    is_active: true,
  },
  {
    id: 2,
    title: 'Trichy to Chennai Express One Way Drop',
    from_city: 'Trichy',
    to_city: 'Chennai',
    vehicle_type: 'Sedan (Dzire / Etios)',
    available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
    trip_type: 'One Way',
    banner_image: '/images/destination-trichy.png',
    actual_price: 5400,
    offer_price: 3999,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    quotation_ref: 'QT-TRC-2026-902',
    quotation_details: 'Doorstep pickup anywhere in Trichy, express highway drop to Chennai with ₹400 driver allowance and toll.',
    is_active: true,
  },
  {
    id: 3,
    title: 'Coimbatore to Ooty Hill Station Tour Offer',
    from_city: 'Coimbatore',
    to_city: 'Ooty',
    vehicle_type: 'SUV (Ertiga)',
    available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
    trip_type: 'Round Trip',
    banner_image: '/images/destination-coimbatore.png',
    actual_price: 5200,
    offer_price: 3899,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    quotation_ref: 'QT-CBE-OOTY',
    quotation_details: 'Includes hill permit, fuel, toll, experienced ghat driver and ₹500 driver bata.',
    is_active: true,
  },
  {
    id: 4,
    title: 'Bangalore to Chennai Executive Highway Ride',
    from_city: 'Bangalore',
    to_city: 'Chennai',
    vehicle_type: 'Innova Crysta',
    available_vehicles: ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
    trip_type: 'One Way',
    banner_image: '/images/destination-chennai.png',
    actual_price: 7800,
    offer_price: 6200,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    quotation_ref: 'QT-BLR-CHN',
    quotation_details: 'Interstate tax included, highway expressway route, free waiting 30 mins, verified driver.',
    is_active: true,
  },
];

// LocalStorage helpers for offline / pre-setup preview
const LOCAL_BOOKINGS_KEY = 'ce_supabase_mock_bookings';
const LOCAL_BANNERS_KEY = 'ce_supabase_mock_banners';
const LOCAL_LOGS_KEY = 'ce_supabase_mock_logs';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key: string, val: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

// =============================================================
// 1. BOOKINGS API (Direct Supabase)
// =============================================================

export interface BookingPayload {
  customer_name: string;
  phone: string;
  pickup: string;
  drop: string;
  vehicle: string;
  trip_type: string;
  date?: string;
  time?: string;
  estimated_fare: number;
  offer_code?: string;
  offer_price?: number;
  source?: 'Offer Slider' | 'Direct Booking' | 'Fare Widget';
  notes?: string;
}

export async function saveBookingToSupabase(payload: BookingPayload): Promise<BookingOrderItem> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const dbPayload = {
      customer_name: payload.customer_name || 'Customer',
      phone: payload.phone,
      pickup: payload.pickup,
      drop_location: payload.drop,
      vehicle: payload.vehicle || 'Sedan (Dzire / Etios)',
      trip_type: payload.trip_type || 'One Way',
      booking_date: payload.date || new Date().toISOString().slice(0, 10),
      booking_time: payload.time || '10:00',
      estimated_fare: Number(payload.estimated_fare) || 0,
      offer_code: payload.offer_code || null,
      offer_price: payload.offer_price ? Number(payload.offer_price) : null,
      status: 'Pending',
      source: payload.source || 'Direct Booking',
      notes: payload.notes || 'Submitted via web interface (Supabase Cloud)',
    };

    const { data, error } = await client
      .from('bookings')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase booking insert error:', error);
      throw error;
    }

    return {
      id: data.id,
      customer_name: data.customer_name,
      phone: data.phone,
      pickup: data.pickup,
      drop: data.drop_location || data.drop || payload.drop,
      vehicle: data.vehicle,
      trip_type: data.trip_type,
      date: data.booking_date,
      time: data.booking_time,
      estimated_fare: Number(data.estimated_fare),
      offer_code: data.offer_code,
      offer_price: data.offer_price ? Number(data.offer_price) : undefined,
      status: data.status,
      source: data.source,
      notes: data.notes,
      created_at: data.created_at || new Date().toISOString(),
    };
  }

  // Fallback when Supabase credentials are not yet entered
  const existing = getLocal<BookingOrderItem[]>(LOCAL_BOOKINGS_KEY, [
    {
      id: 101,
      customer_name: 'Karthik Raja',
      phone: '+91 98401 23456',
      pickup: 'Chennai',
      drop: 'Madurai',
      vehicle: 'Sedan (Dzire / Etios)',
      trip_type: 'One Way',
      date: '2026-10-02',
      time: '06:00',
      estimated_fare: 4999,
      offer_code: 'QT-CHM-2026-778',
      offer_price: 4999,
      status: 'Confirmed',
      source: 'Offer Slider',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      notes: 'Customer booked via Festive Special Offer popup.',
    },
  ]);

  const newId = existing.length ? Math.max(...existing.map((b) => b.id)) + 1 : 101;
  const newOrder: BookingOrderItem = {
    id: newId,
    customer_name: payload.customer_name || 'Customer',
    phone: payload.phone,
    pickup: payload.pickup,
    drop: payload.drop,
    vehicle: payload.vehicle || 'Sedan (Dzire / Etios)',
    trip_type: payload.trip_type || 'One Way',
    date: payload.date || new Date().toISOString().slice(0, 10),
    time: payload.time || '10:00',
    estimated_fare: Number(payload.estimated_fare) || 0,
    offer_code: payload.offer_code,
    offer_price: payload.offer_price ? Number(payload.offer_price) : undefined,
    status: 'Pending',
    source: payload.source || 'Direct Booking',
    notes: payload.notes || 'Saved locally (Connect Supabase in .env.local to save to Cloud)',
    created_at: new Date().toISOString(),
  };

  setLocal(LOCAL_BOOKINGS_KEY, [newOrder, ...existing]);
  return newOrder;
}

export async function fetchAllBookingsFromSupabase(): Promise<BookingOrderItem[]> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from('bookings')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase fetch bookings error:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      customer_name: row.customer_name,
      phone: row.phone,
      pickup: row.pickup,
      drop: row.drop_location || row.drop || '',
      vehicle: row.vehicle,
      trip_type: row.trip_type,
      date: row.booking_date,
      time: row.booking_time,
      estimated_fare: Number(row.estimated_fare) || 0,
      offer_code: row.offer_code,
      offer_price: row.offer_price ? Number(row.offer_price) : undefined,
      status: row.status,
      source: row.source,
      notes: row.notes,
      created_at: row.created_at,
    }));
  }

  // Local fallback
  return getLocal<BookingOrderItem[]>(LOCAL_BOOKINGS_KEY, [
    {
      id: 101,
      customer_name: 'Karthik Raja',
      phone: '+91 98401 23456',
      pickup: 'Chennai',
      drop: 'Madurai',
      vehicle: 'Sedan (Dzire / Etios)',
      trip_type: 'One Way',
      date: '2026-10-02',
      time: '06:00',
      estimated_fare: 4999,
      offer_code: 'QT-CHM-2026-778',
      offer_price: 4999,
      status: 'Confirmed',
      source: 'Offer Slider',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      notes: 'Customer booked via Festive Special Offer popup.',
    },
  ]);
}

export async function updateBookingStatusInSupabase(
  id: number,
  status: BookingOrderItem['status']
): Promise<boolean> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const { error } = await client
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Supabase update booking status error:', error);
      throw error;
    }
    return true;
  }

  const existing = getLocal<BookingOrderItem[]>(LOCAL_BOOKINGS_KEY, []);
  const idx = existing.findIndex((b) => b.id === id);
  if (idx !== -1) {
    existing[idx].status = status;
    setLocal(LOCAL_BOOKINGS_KEY, [...existing]);
    return true;
  }
  return false;
}

// =============================================================
// 2. BANNERS API (Direct Supabase)
// =============================================================

export async function fetchActiveBannersFromSupabase(): Promise<BannerItem[]> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await client
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .lte('from_date', today)
      .gte('to_date', today)
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase fetch active banners error:', error);
      // Fallback without date filter if strict date returns empty
      const { data: allActive } = await client
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false });
      return (allActive || []).map(formatBannerRow);
    }

    if (data && data.length > 0) {
      return data.map(formatBannerRow);
    }

    // Try all active
    const { data: allActive } = await client
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: false });
    return (allActive || []).map(formatBannerRow);
  }

  // Local fallback
  const all = getLocal<BannerItem[]>(LOCAL_BANNERS_KEY, DEFAULT_BANNERS);
  return all.filter((b) => b.is_active);
}

export async function fetchAllBannersFromSupabase(): Promise<{
  data: BannerItem[];
  summary: BannerSummary;
}> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from('banners')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase fetch all banners error:', error);
      throw error;
    }

    const items = (data || []).map(formatBannerRow);
    const today = new Date().toISOString().slice(0, 10);

    const summary: BannerSummary = {
      total: items.length,
      live: items.filter((b) => b.is_active && b.from_date <= today && b.to_date >= today).length,
      scheduled: items.filter((b) => b.is_active && b.from_date > today).length,
      inactive: items.filter((b) => !b.is_active).length,
    };

    return { data: items, summary };
  }

  // Local fallback
  const items = getLocal<BannerItem[]>(LOCAL_BANNERS_KEY, DEFAULT_BANNERS);
  const today = new Date().toISOString().slice(0, 10);
  const summary: BannerSummary = {
    total: items.length,
    live: items.filter((b) => b.is_active && b.from_date <= today && b.to_date >= today).length,
    scheduled: items.filter((b) => b.is_active && b.from_date > today).length,
    inactive: items.filter((b) => !b.is_active).length,
  };

  return { data: items, summary };
}

export async function createBannerInSupabase(form: BannerFormData): Promise<BannerItem> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const dbPayload = {
      title: form.title,
      from_city: form.from_city,
      to_city: form.to_city,
      vehicle_type: form.vehicle_type,
      available_vehicles: form.available_vehicles,
      trip_type: form.trip_type,
      banner_image: form.banner_image,
      actual_price: Number(form.actual_price),
      offer_price: Number(form.offer_price),
      from_date: form.from_date,
      to_date: form.to_date,
      quotation_ref: form.quotation_ref,
      quotation_details: form.quotation_details,
      is_active: Boolean(form.is_active),
    };

    const { data, error } = await client
      .from('banners')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase create banner error:', error);
      throw error;
    }

    return formatBannerRow(data);
  }

  // Local fallback
  const all = getLocal<BannerItem[]>(LOCAL_BANNERS_KEY, DEFAULT_BANNERS);
  const nextId = all.length ? Math.max(...all.map((b) => b.id)) + 1 : 1;
  const created: BannerItem = {
    id: nextId,
    ...form,
    created_at: new Date().toISOString(),
  };
  setLocal(LOCAL_BANNERS_KEY, [created, ...all]);
  return created;
}

export async function updateBannerInSupabase(id: number, form: Partial<BannerFormData>): Promise<BannerItem> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const updatePayload: Record<string, any> = {
      ...form,
      updated_at: new Date().toISOString(),
    };
    if (form.actual_price !== undefined) updatePayload.actual_price = Number(form.actual_price);
    if (form.offer_price !== undefined) updatePayload.offer_price = Number(form.offer_price);

    const { data, error } = await client
      .from('banners')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update banner error:', error);
      throw error;
    }
    return formatBannerRow(data);
  }

  const all = getLocal<BannerItem[]>(LOCAL_BANNERS_KEY, DEFAULT_BANNERS);
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Banner not found');
  const updated: BannerItem = {
    ...all[idx],
    ...form,
    updated_at: new Date().toISOString(),
  };
  all[idx] = updated;
  setLocal(LOCAL_BANNERS_KEY, [...all]);
  return updated;
}

export async function toggleBannerStatusInSupabase(id: number, is_active: boolean): Promise<BannerItem> {
  return updateBannerInSupabase(id, { is_active });
}

export async function deleteBannerInSupabase(id: number): Promise<boolean> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const { error } = await client.from('banners').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete banner error:', error);
      throw error;
    }
    return true;
  }

  const all = getLocal<BannerItem[]>(LOCAL_BANNERS_KEY, DEFAULT_BANNERS);
  const filtered = all.filter((b) => b.id !== id);
  setLocal(LOCAL_BANNERS_KEY, filtered);
  return true;
}

function formatBannerRow(row: any): BannerItem {
  return {
    id: row.id,
    title: row.title,
    from_city: row.from_city || 'Chennai',
    to_city: row.to_city || 'Madurai',
    vehicle_type: row.vehicle_type || 'Sedan (Dzire / Etios)',
    available_vehicles: Array.isArray(row.available_vehicles)
      ? row.available_vehicles
      : typeof row.available_vehicles === 'string'
      ? JSON.parse(row.available_vehicles)
      : ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
    trip_type: row.trip_type || 'One Way',
    banner_image: row.banner_image || '/images/special-offer-banner.jpg',
    actual_price: Number(row.actual_price) || 0,
    offer_price: Number(row.offer_price) || 0,
    from_date: row.from_date,
    to_date: row.to_date,
    quotation_ref: row.quotation_ref || 'QT-SPECIAL',
    quotation_details: row.quotation_details || '',
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// =============================================================
// 3. AUDIT LOGS & AUTH (Direct Supabase)
// =============================================================

export async function recordLoginLogToSupabase(log: {
  email: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
}): Promise<LoginLogItem> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const payload = {
      email: log.email,
      ip: 'Client Web Browser',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser Client',
      status: log.status,
      message: log.message,
    };

    const { data } = await client.from('login_logs').insert([payload]).select().single();
    if (data) {
      return {
        id: data.id,
        email: data.email,
        ip: data.ip,
        user_agent: data.user_agent,
        status: data.status,
        message: data.message,
        created_at: data.created_at,
      };
    }
  }

  // Local fallback
  const existing = getLocal<LoginLogItem[]>(LOCAL_LOGS_KEY, [
    {
      id: 1,
      email: 'admin@example.com',
      ip: 'Direct Client',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Antigravity IDE Agent',
      status: 'SUCCESS',
      message: 'Admin signed in successfully',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const newLog: LoginLogItem = {
    id: existing.length ? Math.max(...existing.map((l) => l.id)) + 1 : 1,
    email: log.email,
    ip: 'Direct Client',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser Client',
    status: log.status,
    message: log.message,
    created_at: new Date().toISOString(),
  };

  setLocal(LOCAL_LOGS_KEY, [newLog, ...existing]);
  return newLog;
}

export async function fetchLoginLogsFromSupabase(): Promise<LoginLogItem[]> {
  const client = getSupabaseClient();

  if (client && isSupabaseConfigured()) {
    const { data } = await client
      .from('login_logs')
      .select('*')
      .order('id', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        email: d.email,
        ip: d.ip || 'Client',
        user_agent: d.user_agent || 'Browser',
        status: d.status,
        message: d.message,
        created_at: d.created_at,
      }));
    }
  }

  return getLocal<LoginLogItem[]>(LOCAL_LOGS_KEY, [
    {
      id: 1,
      email: 'admin@example.com',
      ip: 'Direct Client',
      user_agent: 'Antigravity IDE Agent',
      status: 'SUCCESS',
      message: 'Admin signed in successfully',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
}
