import { NextResponse } from 'next/server';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';
import crypto from 'crypto';

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

    // Programmatically sign in user to Supabase Auth to refresh access token
    let supabaseSession: any = null;
    const normalizedEmail = payload.email.toLowerCase().trim();
    const jwtSecret = process.env.JWT_SECRET || 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';
    const supabasePassword = crypto.createHmac('sha256', jwtSecret).update(normalizedEmail).digest('hex');

    try {
      const authRes = await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password: supabasePassword,
      });
      if (authRes.data && authRes.data.session) {
        supabaseSession = authRes.data.session;
      }
    } catch (err) {
      console.error('Supabase Auth error in /api/auth/me:', err);
    }

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
      role: payload.role,
      supabaseToken: supabaseSession ? {
        access_token: supabaseSession.access_token,
        refresh_token: supabaseSession.refresh_token
      } : null
    });
  } catch (error: any) {
    console.error('API /auth/me error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
