import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/notifications/[notifId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notifId: string }> }
) {
  try {
    const { notifId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await request.json() as any;
    const { is_read } = body;

    const db = await getDb();
    const updated = await db.collection('notifications').findOneAndUpdate(
      { id: notifId },
      { $set: { is_read: !!is_read } },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
