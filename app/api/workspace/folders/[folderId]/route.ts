import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/workspace/folders/[folderId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as any;
    const { name, color, position } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (color !== undefined) update.color = color;
    if (position !== undefined) update.position = position;

    const db = await getDb();
    const updated = await db.collection('folders').findOneAndUpdate(
      { id: folderId },
      { $set: update },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/workspace/folders/[folderId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();

    // Find lists in this folder
    const lists = await db.collection('lists').find({ folder_id: folderId }).toArray();
    const listIds = lists.map(l => l.id);

    // Find tasks
    const tasks = await db.collection('tasks').find({ list_id: { $in: listIds } }).toArray();
    const taskIds = tasks.map(t => t.id);

    await Promise.all([
      db.collection('tasks').deleteMany({ list_id: { $in: listIds } }),
      db.collection('comments').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('notifications').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('lists').deleteMany({ folder_id: folderId }),
      db.collection('folders').deleteOne({ id: folderId })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
