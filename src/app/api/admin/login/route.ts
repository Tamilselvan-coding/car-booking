import { NextRequest, NextResponse } from 'next/server';
import { recordLoginLog } from '../../../../lib/backendDb';

const LARAVEL_API = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser Client';

    // 1. Try Laravel REST API Authentication (Saved to MySQL)
    try {
      const res = await fetch(`${LARAVEL_API}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': userAgent,
          'X-Forwarded-For': ip,
        },
        body: JSON.stringify({ email, password }),
      });

      const laravelJson = await res.json();
      if (res.ok && laravelJson.status) {
        const response = NextResponse.json({
          status: true,
          message: 'Admin login successful (Verified via Laravel REST API & MySQL)',
          token: laravelJson.data?.token,
          user: laravelJson.data?.user || {
            name: 'Banner Administrator',
            email,
            role: 'admin',
          },
          backend_source: 'laravel_mysql',
        });

        response.cookies.set('admin_session', laravelJson.data?.token || 'authenticated_admin_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }
    } catch (_err) {
      // Fall through to local fallback if Laravel port 8000 is not responding
    }

    // 2. Fallback to local authentication
    if (
      (email === 'admin@example.com' && password === 'admin123') ||
      (email === 'admin@chettinadexpress.com' && password === 'admin123') ||
      (email === 'admin' && password === 'admin')
    ) {
      recordLoginLog({
        email: email || 'admin@example.com',
        ip,
        user_agent: userAgent,
        status: 'SUCCESS',
        message: 'Admin credentials verified and session issued (Local fallback).',
      });

      const response = NextResponse.json({
        status: true,
        message: 'Admin login successful (Local fallback)',
        user: {
          name: 'Banner Administrator',
          email,
          role: 'admin',
        },
        backend_source: 'local_fallback',
      });

      response.cookies.set('admin_session', 'authenticated_admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    recordLoginLog({
      email: email || 'unknown',
      ip,
      user_agent: userAgent,
      status: 'FAILED',
      message: 'Invalid password or unknown administrator account.',
    });

    return NextResponse.json(
      { status: false, message: 'Invalid admin email or password. (Hint: admin@example.com / admin123)' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ status: false, message: 'Login failed' }, { status: 500 });
  }
}

