import { NextResponse } from 'next/server';
import { getLoginLogs } from '../../../../lib/backendDb';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET() {
  // 1. Try Laravel
  try {
    const res = await fetch(`${LARAVEL_API}/admin/logins`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json({ ...json, backend_source: 'laravel_mysql' });
    }
  } catch (_err) {
    // fallback
  }

  // 2. Fallback
  try {
    const logs = getLoginLogs();
    return NextResponse.json({
      status: true,
      data: logs,
      total: logs.length,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return NextResponse.json({ status: false, message: 'Failed to retrieve login logs' }, { status: 500 });
  }
}

