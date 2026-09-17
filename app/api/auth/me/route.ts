import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

export async function GET(request?: Request) {
  try {
    let token: string | undefined;

    try {
      const cookieStore = await cookies();
      token = cookieStore.get('session_token')?.value;
    } catch {}

    if (!token && request) {
      const cookieHeader = request.headers.get('cookie') || '';
      const parsedCookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const idx = c.indexOf('=');
          return idx > -1 ? [c.slice(0, idx).trim(), c.slice(idx + 1).trim()] : [c.trim(), ''];
        })
      );
      token = parsedCookies['session_token'];
    }

    if (!token && request) {
      const authHeader = request.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = await getDb();
    const user = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
      role: user?.role || payload.role || 'staff',
      fullName: user?.full_name || user?.fullName || payload.email.split('@')[0],
      user: user || null,
      supabaseToken: null
    });
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
