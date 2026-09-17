import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// GET /api/notifications — get current user's notifications
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const profile = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });
    if (!profile) return NextResponse.json([]);

    const notifications = await db.collection('notifications')
      .find({ user_id: profile.id })
      .sort({ created_at: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(notifications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications — mark all as read
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const profile = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });

    const body = await request.json() as any;
    if (body.markAllRead && profile) {
      await db.collection('notifications').updateMany(
        { user_id: profile.id, is_read: false },
        { $set: { is_read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
