import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/workspace/lists/[listId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as any;
    const { name, color, position, folder_id } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (color !== undefined) update.color = color;
    if (position !== undefined) update.position = position;
    if (folder_id !== undefined) update.folder_id = folder_id;

    const db = await getDb();
    const updated = await db.collection('lists').findOneAndUpdate(
      { id: listId },
      { $set: update },
      { returnDocument: 'after' }
    );

    // If list name changed, also update list.name in tasks
    if (name !== undefined) {
      await db.collection('tasks').updateMany(
        { list_id: listId },
        { $set: { 'list.name': name } }
      );
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/workspace/lists/[listId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();

    // Find all tasks in list
    const tasks = await db.collection('tasks').find({ list_id: listId }).toArray();
    const taskIds = tasks.map(t => t.id);

    await Promise.all([
      db.collection('tasks').deleteMany({ list_id: listId }),
      db.collection('comments').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('notifications').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('statuses').deleteMany({ list_id: listId }),
      db.collection('lists').deleteOne({ id: listId })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
