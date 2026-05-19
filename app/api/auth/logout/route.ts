import { NextResponse } from 'next/server';
import { updateLogoutTime } from '@/shared/utils/db';
import { verifySession } from '@/shared/utils/session';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies['session_token'];

    if (token) {
      const payload = await verifySession(token);
      if (payload && payload.logId) {
        // Update database log sheet setting logout_time = CURRENT_TIMESTAMP
        await updateLogoutTime(payload.logId);
      }
    }

    const response = NextResponse.json({ success: true });
    
    // Clear session_token cookie
    response.cookies.set({
      name: 'session_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Clears the cookie immediately
    });

    return response;
  } catch (error: any) {
    console.error('Logout API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
