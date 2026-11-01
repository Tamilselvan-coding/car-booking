import { NextRequest, NextResponse } from 'next/server';
import { getBannerById, updateBanner, deleteBanner } from '../../../../lib/bannerStorage';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try Laravel
    try {
      const res = await fetch(`${LARAVEL_API}/banners/${id}`, {
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
    const bannerId = parseInt(id, 10);
    const banner = getBannerById(bannerId);

    if (!banner) {
      return NextResponse.json({ status: false, message: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: banner, backend_source: 'local_fallback' });
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Try Laravel
    try {
      const res = await fetch(`${LARAVEL_API}/banners/${id}`, {
        method: 'PUT',
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
    const bannerId = parseInt(id, 10);
    const banner = getBannerById(bannerId);

    if (!banner) {
      return NextResponse.json({ status: false, message: 'Banner not found' }, { status: 404 });
    }

    if (body.offer_price && body.actual_price && Number(body.offer_price) > Number(body.actual_price)) {
      return NextResponse.json(
        { status: false, message: 'Offer price must be less than or equal to actual price.' },
        { status: 422 }
      );
    }

    const updated = updateBanner(bannerId, body);

    return NextResponse.json({
      status: true,
      message: 'Banner updated successfully.',
      data: updated,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ status: false, message: 'Failed to update banner' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Try Laravel
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
    const bannerId = parseInt(id, 10);
    const banner = getBannerById(bannerId);

    if (!banner) {
      return NextResponse.json({ status: false, message: 'Banner not found' }, { status: 404 });
    }

    const updated = updateBanner(bannerId, { is_active: Boolean(body.is_active) });

    return NextResponse.json({
      status: true,
      message: 'Banner status updated successfully.',
      data: updated,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error patching banner status:', error);
    return NextResponse.json({ status: false, message: 'Failed to update banner status' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try Laravel
    try {
      const res = await fetch(`${LARAVEL_API}/banners/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ ...json, backend_source: 'laravel_mysql' });
      }
    } catch (_err) {
      // fallback
    }

    // 2. Fallback
    const bannerId = parseInt(id, 10);
    const success = deleteBanner(bannerId);

    if (!success) {
      return NextResponse.json({ status: false, message: 'Banner not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ status: true, message: 'Banner deleted successfully.', backend_source: 'local_fallback' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ status: false, message: 'Server error' }, { status: 500 });
  }
}

