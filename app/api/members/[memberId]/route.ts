import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/members/[memberId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    const body = await request.json() as { role?: string; status?: string; full_name?: string };

    // Prevent self-deactivation
    const actor = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });
    if (actor?.id === memberId && body.status === 'deactivated') {
      return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
    }

    const allowedFields = ['role', 'status', 'full_name'];
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of allowedFields) {
      if (key in body) update[key] = (body as Record<string, any>)[key];
    }

    const updatedUser = await db.collection('users').findOneAndUpdate(
      { id: memberId },
      { $set: update },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updatedUser || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
