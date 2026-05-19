import { NextResponse } from 'next/server';
import { getAllLogs } from '@/shared/utils/db';
import { verifySession } from '@/shared/utils/session';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies['session_token'];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Login required.' }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized. Session expired.' }, { status: 401 });
    }

    const logs = await getAllLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('API /auth/logs error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
