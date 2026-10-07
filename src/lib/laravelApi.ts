/**
 * Laravel Backend REST API Client
 * Connects frontend directly to the Laravel/PHP REST API on http://127.0.0.1:8000/api
 */

import type { BannerItem, BannerFormData, BannerSummary } from '../types/banner';
import type { LoginLogItem, BookingOrderItem } from '../types/backend';

export const LARAVEL_API_BASE =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
  (typeof window !== 'undefined'
    ? 'http://127.0.0.1:8000/api'
    : 'http://127.0.0.1:8000/api');

export interface BackendHealthResponse {
  status: boolean;
  message: string;
  service: string;
  port: number;
  database: string;
  time: string;
  today: string;
}

/**
 * Check if the Laravel REST API server on port 8000 is running and connected to MySQL.
 */
export async function checkBackendHealth(): Promise<{ connected: boolean; info?: BackendHealthResponse; error?: string }> {
  try {
    const res = await fetch(`${LARAVEL_API_BASE}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { connected: false, error: `HTTP ${res.status}` };
    }
    const data: BackendHealthResponse = await res.json();
    return { connected: true, info: data };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Connection refused (port 8000 offline)' };
  }
}

/**
 * Fetch Public Active Banners from Laravel REST API.
 * Adheres strictly to the Admin Approval condition: only banners with is_active = 1
 * and valid date range are returned.
 */
export async function fetchActiveBannersFromLaravel(): Promise<BannerItem[]> {
  const res = await fetch(`${LARAVEL_API_BASE}/banners/active`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch active banners from Laravel (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (json.status && Array.isArray(json.data)) {
    return json.data;
  }
  return [];
}

/**
 * Admin Login via Laravel REST API.
 * Authenticates against MySQL users table and generates a Sanctum Bearer token.
 */
export async function loginAdminViaLaravel(
  email: string,
  pass: string
): Promise<{ token: string; user: { name: string; email: string } }> {
  const res = await fetch(`${LARAVEL_API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password: pass }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Login failed');
  }

  return {
    token: json.data.token,
    user: json.data.user,
  };
}

/**
 * Admin Fetch All Banners from Laravel REST API (with filtering and search).
 */
export async function fetchAdminBannersFromLaravel(
  filter: string = 'all',
  search: string = ''
): Promise<{ data: BannerItem[]; summary?: BannerSummary }> {
  const params = new URLSearchParams();
  if (filter && filter !== 'all') params.set('status', filter);
  if (search) params.set('search', search);

  const res = await fetch(`${LARAVEL_API_BASE}/banners?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to retrieve banners from Laravel (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Admin Create Banner via Laravel REST API.
 * Saved directly to MySQL database.
 */
export async function createBannerInLaravel(data: BannerFormData): Promise<BannerItem> {
  const res = await fetch(`${LARAVEL_API_BASE}/banners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Failed to create banner');
  }
  return json.data;
}

/**
 * Admin Toggle Banner Status via Laravel REST API.
 * Updates is_active in MySQL database.
 */
export async function toggleBannerStatusInLaravel(id: number, is_active: boolean): Promise<BannerItem> {
  const res = await fetch(`${LARAVEL_API_BASE}/banners/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ is_active }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Failed to update banner status');
  }
  return json.data;
}

/**
 * Admin Update Banner via Laravel REST API.
 */
export async function updateBannerInLaravel(id: number, data: Partial<BannerFormData>): Promise<BannerItem> {
  const res = await fetch(`${LARAVEL_API_BASE}/banners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Failed to update banner');
  }
  return json.data;
}

/**
 * Admin Delete Banner via Laravel REST API.
 */
export async function deleteBannerInLaravel(id: number): Promise<boolean> {
  const res = await fetch(`${LARAVEL_API_BASE}/banners/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Failed to delete banner');
  }
  return true;
}

/**
 * Fetch Bookings / Quotation Orders from Laravel REST API.
 */
export async function fetchBookingsFromLaravel(): Promise<BookingOrderItem[]> {
  const res = await fetch(`${LARAVEL_API_BASE}/bookings`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch bookings from Laravel (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}

/**
 * Create Customer Booking / Quotation Order via Laravel REST API.
 */
export async function createBookingInLaravel(order: any): Promise<any> {
  const res = await fetch(`${LARAVEL_API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(order),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Failed to create booking');
  }
  return json.data;
}

/**
 * Fetch Admin Login History from Laravel REST API.
 */
export async function fetchLoginLogsFromLaravel(): Promise<LoginLogItem[]> {
  const res = await fetch(`${LARAVEL_API_BASE}/admin/logins`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch login logs from Laravel (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.data || [];
}
