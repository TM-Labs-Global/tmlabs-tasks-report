import { NextResponse } from 'next/server';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies['session_token'];

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload) {
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
      role: user?.role || payload.role,
      user: user || null,
      supabaseToken: null
    });
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
