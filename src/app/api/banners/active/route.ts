import { NextResponse } from 'next/server';
import { getActiveBanners, getTodayString } from '../../../../lib/bannerStorage';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
  const today = getTodayString();

  // 1. Try Laravel REST Backend on port 8000
  try {
    const res = await fetch(`${LARAVEL_API}/banners/active`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const laravelData = await res.json();
      return NextResponse.json(
        {
          ...laravelData,
          backend_source: 'laravel_mysql',
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'X-Backend-Source': 'laravel_mysql',
          },
        }
      );
    }
  } catch (_err) {
    // Laravel is offline or unreachable - use local storage fallback
  }

  // 2. Fallback to local database
  try {
    const activeBanners = getActiveBanners(today);
    return NextResponse.json(
      {
        status: true,
        data: activeBanners,
        today,
        count: activeBanners.length,
        backend_source: 'local_fallback',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Backend-Source': 'local_fallback',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching active banners fallback:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch active banners', data: [] },
      { status: 500 }
    );
  }
}

