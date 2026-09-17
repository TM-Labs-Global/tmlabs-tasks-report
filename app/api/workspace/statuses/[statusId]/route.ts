import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/workspace/statuses/[statusId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ statusId: string }> }
) {
  try {
    const { statusId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as any;
    const { name, color, type, position } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (color !== undefined) update.color = color;
    if (type !== undefined) update.type = type;
    if (position !== undefined) update.position = position;

    const db = await getDb();
    const updated = await db.collection('statuses').findOneAndUpdate(
      { id: statusId },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (updated) {
      // Also update embedded status inside list
      const listUpdate: any = {};
      if (name !== undefined) listUpdate['statuses.$.name'] = name;
      if (color !== undefined) listUpdate['statuses.$.color'] = color;
      if (type !== undefined) listUpdate['statuses.$.type'] = type;
      if (position !== undefined) listUpdate['statuses.$.position'] = position;

      await db.collection('lists').updateOne(
        { 'statuses.id': statusId },
        { $set: listUpdate }
      );

      // Also update status object on tasks
      await db.collection('tasks').updateMany(
        { status_id: statusId },
        { $set: { status: updated } }
      );
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/workspace/statuses/[statusId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ statusId: string }> }
) {
  try {
    const { statusId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();

    // Check if any tasks are currently in this status
    const taskCount = await db.collection('tasks').countDocuments({ status_id: statusId });
    if (taskCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete status: Move all tasks out of this status first.' },
        { status: 400 }
      );
    }

    await Promise.all([
      db.collection('statuses').deleteOne({ id: statusId }),
      db.collection('lists').updateOne(
        { 'statuses.id': statusId },
        { $pull: { statuses: { id: statusId } } as any }
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
