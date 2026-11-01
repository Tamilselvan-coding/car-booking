import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Try Laravel REST API
    try {
      const res = await fetch(`${LARAVEL_API}/banners/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ ...json, backend_source: 'laravel_mysql' });
      }
    } catch (_err) {
      // fallback
    }

    // 2. Fallback
    const { updateBanner, getBannerById } = await import('../../../../../lib/bannerStorage');
    const bannerId = parseInt(id, 10);
    const existing = getBannerById(bannerId);
    if (!existing) {
      return NextResponse.json({ status: false, message: 'Banner not found' }, { status: 404 });
    }

    const updated = updateBanner(bannerId, { is_active: Boolean(body.is_active) });
    return NextResponse.json({
      status: true,
      message: 'Banner status updated.',
      data: updated,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: 'Failed to update status' }, { status: 500 });
  }
}
