import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

// GET /api/tasks/[taskId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const task = await db.collection('tasks').findOne({
      $or: [{ id: taskId }, { clickup_id: taskId }]
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Staff: verify they are assigned
    if (session.role === 'staff') {
      const isAssigned = (task.assignees || []).some((a: any) => {
        return a.profile?.email && a.profile.email.toLowerCase() === session.email.toLowerCase();
      });

      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden', message: 'You are not assigned to this task.' }, { status: 403 });
      }
    }

    // Subtasks & Comments
    const [subtasks, comments] = await Promise.all([
      db.collection('tasks').find({ parent_task_id: task.id }).toArray(),
      db.collection('comments').find({ task_id: task.id }).sort({ created_at: -1 }).toArray()
    ]);

    return NextResponse.json({
      ...task,
      subtasks: subtasks || [],
      comments: comments || []
    });
  } catch (err: any) {
    console.error('Error in GET /api/tasks/[taskId]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/tasks/[taskId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const actor = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });

    const task = await db.collection('tasks').findOne({
      $or: [{ id: taskId }, { clickup_id: taskId }]
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json() as any;

    // Staff can only update status_id on their own tasks
    if (session.role === 'staff') {
      const isAssigned = (task.assignees || []).some((a: any) => {
        return a.profile?.email && a.profile.email.toLowerCase() === session.email.toLowerCase();
      });
      if (!isAssigned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      if (!body.status_id) {
        return NextResponse.json({ error: 'No permitted fields to update' }, { status: 400 });
      }

      let newStatus = await db.collection('statuses').findOne({ id: body.status_id });
      if (!newStatus && task.list_id) {
        const listDoc = await db.collection('lists').findOne({ id: task.list_id });
        newStatus = listDoc?.statuses?.find((s: any) => s.id === body.status_id) || null;
      }

      const updateFields: any = {
        status_id: body.status_id,
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus?.type === 'closed') {
        updateFields.date_closed = new Date().toISOString();
      } else {
        updateFields.date_closed = null;
      }

      const updated = await db.collection('tasks').findOneAndUpdate(
        { id: task.id },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      return NextResponse.json(updated);
    }

    // PM: full update
    const { assignee_ids, tag_ids, status_id, ...taskFields } = body;
    const updateFields: any = {
      ...taskFields,
      updated_at: new Date().toISOString()
    };

    if (status_id) {
      updateFields.status_id = status_id;
      let newStatus = await db.collection('statuses').findOne({ id: status_id });
      if (!newStatus && (taskFields.list_id || task.list_id)) {
        const listDoc = await db.collection('lists').findOne({ id: taskFields.list_id || task.list_id });
        newStatus = listDoc?.statuses?.find((s: any) => s.id === status_id) || null;
      }
      updateFields.status = newStatus;
      if (newStatus?.type === 'closed') {
        updateFields.date_closed = new Date().toISOString();
      }
    }

    // Update assignees
    if (Array.isArray(assignee_ids)) {
      if (assignee_ids.length > 0) {
        const assignedUsers = await db.collection('users')
          .find({ id: { $in: assignee_ids } })
          .toArray();

        updateFields.assignees = assignedUsers.map(u => ({
          assigned_at: new Date().toISOString(),
          assigned_by: actor?.id || null,
          profile: {
            id: u.id,
            full_name: u.full_name || u.fullName,
            email: u.email,
            avatar_url: u.avatar_url || u.avatarUrl || null,
            role: u.role
          }
        }));
      } else {
        updateFields.assignees = [];
      }
    }

    // Update tags
    if (Array.isArray(tag_ids)) {
      if (tag_ids.length > 0) {
        const matchedTags = await db.collection('tags')
          .find({ id: { $in: tag_ids } })
          .toArray();
        updateFields.tags = matchedTags.map(t => ({ tag: { id: t.id, name: t.name, color: t.color } }));
      } else {
        updateFields.tags = [];
      }
    }

    const updated = await db.collection('tasks').findOneAndUpdate(
      { id: task.id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    const task = await db.collection('tasks').findOne({
      $or: [{ id: taskId }, { clickup_id: taskId }]
    });

    if (task) {
      const realId = task.id;
      await Promise.all([
        db.collection('tasks').deleteMany({ $or: [{ id: realId }, { parent_task_id: realId }] }),
        db.collection('comments').deleteMany({ task_id: realId }),
        db.collection('notifications').deleteMany({ task_id: realId })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
