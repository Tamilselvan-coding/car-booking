import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
  try {
    const res = await fetch(`${LARAVEL_API}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        connected: true,
        laravel_url: LARAVEL_API,
        port: 8000,
        service: 'Laravel REST Backend API',
        database: 'MySQL (car_booking)',
        data,
      });
    }

    return NextResponse.json({
      connected: false,
      laravel_url: LARAVEL_API,
      port: 8000,
      message: `Laravel API responded with HTTP ${res.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      laravel_url: LARAVEL_API,
      port: 8000,
      message: 'Laravel API is offline (Connection refused on port 8000)',
      error: err?.message,
    });
  }
}
