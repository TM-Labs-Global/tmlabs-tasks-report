import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// PATCH /api/workspace/spaces/[spaceId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    const { spaceId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as any;
    const { name, color, icon, position } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (position !== undefined) updateData.position = position;

    const db = await getDb();
    const updated = await db.collection('spaces').findOneAndUpdate(
      { id: spaceId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/workspace/spaces/[spaceId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    const { spaceId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();

    // Find all lists in this space
    const lists = await db.collection('lists').find({ space_id: spaceId }).toArray();
    const listIds = lists.map(l => l.id);

    // Find all tasks in these lists
    const tasks = await db.collection('tasks').find({ list_id: { $in: listIds } }).toArray();
    const taskIds = tasks.map(t => t.id);

    await Promise.all([
      db.collection('tasks').deleteMany({ list_id: { $in: listIds } }),
      db.collection('comments').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('notifications').deleteMany({ task_id: { $in: taskIds } }),
      db.collection('lists').deleteMany({ space_id: spaceId }),
      db.collection('folders').deleteMany({ space_id: spaceId }),
      db.collection('spaces').deleteOne({ id: spaceId })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
