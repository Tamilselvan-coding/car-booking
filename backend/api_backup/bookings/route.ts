import { NextRequest, NextResponse } from 'next/server';
import { getAllBookingOrders, createBookingOrder, updateBookingOrderStatus } from '../../../lib/backendDb';

export const dynamic = 'force-dynamic';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function GET(request: NextRequest) {
  // 1. Try Laravel
  try {
    const res = await fetch(`${LARAVEL_API}/bookings`, {
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
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('status');
    let orders = getAllBookingOrders();

    if (filter && filter !== 'all') {
      orders = orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());
    }

    const summary = {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      confirmed: orders.filter((o) => o.status === 'Confirmed').length,
      completed: orders.filter((o) => o.status === 'Completed').length,
    };

    return NextResponse.json({
      status: true,
      data: orders,
      summary,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error fetching bookings fallback:', error);
    return NextResponse.json({ status: false, message: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Try Laravel
    try {
      const res = await fetch(`${LARAVEL_API}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ ...json, backend_source: 'laravel_mysql' }, { status: 201 });
      }
    } catch (_err) {
      // fallback
    }

    // 2. Fallback
    if (!body.phone || !body.pickup || !body.drop) {
      return NextResponse.json(
        { status: false, message: 'Phone, Pickup, and Drop location are required.' },
        { status: 422 }
      );
    }

    const newOrder = createBookingOrder({
      customer_name: body.customer_name || 'Customer',
      phone: body.phone,
      pickup: body.pickup,
      drop: body.drop,
      vehicle: body.vehicle || 'Sedan (Dzire / Etios)',
      trip_type: body.trip_type || 'One Way',
      date: body.date || new Date().toISOString().slice(0, 10),
      time: body.time || '10:00',
      estimated_fare: Number(body.estimated_fare) || 0,
      offer_code: body.offer_code || undefined,
      offer_price: body.offer_price ? Number(body.offer_price) : undefined,
      status: 'Pending',
      source: body.source || 'Direct Booking',
      notes: body.notes || 'Submitted via web interface',
    });

    return NextResponse.json(
      {
        status: true,
        message: 'Booking and quotation details saved in backend database successfully!',
        data: newOrder,
        backend_source: 'local_fallback',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving booking fallback:', error);
    return NextResponse.json({ status: false, message: 'Failed to save booking order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ status: false, message: 'ID and status required' }, { status: 400 });
    }

    const updated = updateBookingOrderStatus(Number(id), status);
    if (!updated) {
      return NextResponse.json({ status: false, message: 'Booking order not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      message: `Booking #${id} status updated to ${status}`,
      data: updated,
      backend_source: 'local_fallback',
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({ status: false, message: 'Failed to update booking status' }, { status: 500 });
  }
}

