import { NextRequest, NextResponse } from 'next/server';
import { getAllBanners, createBanner, getBannerSummary, getTodayString } from '../../../lib/bannerStorage';
import type { BannerFormData } from '../../../types/banner';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 1. Try Laravel REST API on port 8000
  try {
    const res = await fetch(`${LARAVEL_API}/banners?${searchParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const laravelJson = await res.json();
      return NextResponse.json(
        {
          ...laravelJson,
          backend_source: 'laravel_mysql',
        },
        {
          headers: {
            'X-Backend-Source': 'laravel_mysql',
          },
        }
      );
    }
  } catch (_err) {
    // Laravel offline, use local fallback
  }

  // 2. Fallback to local database
  try {
    const today = getTodayString();
    const filter = searchParams.get('status') || 'all';
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    let list = getAllBanners();

    if (search) {
      list = list.filter((b) =>
        b.title.toLowerCase().includes(search) ||
        b.from_city.toLowerCase().includes(search) ||
        b.to_city.toLowerCase().includes(search) ||
        b.quotation_ref.toLowerCase().includes(search)
      );
    }

    if (filter === 'active') {
      list = list.filter((b) => b.is_active && b.from_date <= today && b.to_date >= today);
    } else if (filter === 'inactive') {
      list = list.filter((b) => !b.is_active);
    } else if (filter === 'scheduled') {
      list = list.filter((b) => b.is_active && b.from_date > today);
    } else if (filter === 'expired') {
      list = list.filter((b) => b.is_active && b.to_date < today);
    }

    const summary = getBannerSummary(today);

    return NextResponse.json({
      status: true,
      data: list,
      summary,
      meta: {
        total: list.length,
        today,
      },
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error listing banners fallback:', error);
    return NextResponse.json({ status: false, message: 'Failed to retrieve banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Try Laravel REST API on port 8000
    try {
      const res = await fetch(`${LARAVEL_API}/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const laravelJson = await res.json();
        return NextResponse.json(
          {
            ...laravelJson,
            backend_source: 'laravel_mysql',
          },
          { status: 201 }
        );
      }
    } catch (_err) {
      // Fall through to local fallback
    }

    // 2. Fallback to local database
    if (!body.title || !body.from_city || !body.to_city) {
      return NextResponse.json(
        { status: false, message: 'Title, Starting Location, and Destination Location are required.' },
        { status: 422 }
      );
    }

    if (!body.actual_price || !body.offer_price) {
      return NextResponse.json(
        { status: false, message: 'Actual price and Offer price are required.' },
        { status: 422 }
      );
    }

    if (Number(body.offer_price) > Number(body.actual_price)) {
      return NextResponse.json(
        { status: false, message: 'Offer price must be less than or equal to actual price.' },
        { status: 422 }
      );
    }

    if (!body.from_date || !body.to_date) {
      return NextResponse.json(
        { status: false, message: 'Validity From Date and To Date are required.' },
        { status: 422 }
      );
    }

    if (body.to_date < body.from_date) {
      return NextResponse.json(
        { status: false, message: 'To Date must be on or after From Date.' },
        { status: 422 }
      );
    }

    const formData: BannerFormData = {
      title: body.title.trim(),
      from_city: body.from_city.trim(),
      to_city: body.to_city.trim(),
      vehicle_type: body.vehicle_type || 'Sedan (Dzire / Etios)',
      available_vehicles: Array.isArray(body.available_vehicles) && body.available_vehicles.length > 0
        ? body.available_vehicles
        : ['Sedan (Dzire / Etios)', 'SUV (Ertiga)', 'Innova Crysta'],
      trip_type: body.trip_type === 'Round Trip' ? 'Round Trip' : 'One Way',
      actual_price: Number(body.actual_price),
      offer_price: Number(body.offer_price),
      from_date: body.from_date,
      to_date: body.to_date,
      quotation_ref: body.quotation_ref ? body.quotation_ref.trim() : `QT-${Date.now().toString().slice(-4)}`,
      quotation_details: body.quotation_details || 'All-inclusive drop taxi fare with driver bata.',
      banner_image: body.banner_image || '/images/special-offer-banner.jpg',
      is_active: Boolean(body.is_active),
    };

    const newBanner = createBanner(formData);

    return NextResponse.json(
      {
        status: true,
        message: 'Banner created successfully. ' + (newBanner.is_active ? 'Status is Active (Live).' : 'Status is Inactive (Draft).'),
        data: newBanner,
        backend_source: 'local_fallback',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ status: false, message: 'Failed to create banner' }, { status: 500 });
  }
}

