import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// GET /api/tasks?list_id=...&my_tasks=true
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('list_id');
    const myTasks = searchParams.get('my_tasks') === 'true';

    const db = await getDb();
    const query: any = { is_archived: { $ne: true } };

    if (listId) {
      query.list_id = listId;
    }

    if (myTasks) {
      const user = await db.collection('users').findOne({
        email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
      });
      if (!user) return NextResponse.json([]);
      query['assignees.profile.id'] = user.id;
    }

    const tasks = await db.collection('tasks')
      .find(query)
      .sort({ position: 1, created_at: -1 })
      .toArray();

    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error('GET /api/tasks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    if (session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden: PM role required' }, { status: 403 });
    }

    const db = await getDb();
    const creator = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });

    const body = await request.json() as any;
    const {
      list_id, name, description, status_id, priority = 'normal',
      start_date, due_date, time_estimate, parent_task_id,
      assignee_ids, assigneeId, assignee_id, tag_ids = []
    } = body;

    const finalAssigneeIds = Array.isArray(assignee_ids)
      ? assignee_ids
      : assigneeId
      ? [assigneeId]
      : assignee_id
      ? [assignee_id]
      : [];

    if (!list_id || !name) {
      return NextResponse.json({ error: 'list_id and name are required' }, { status: 400 });
    }

    // Resolve list & space
    const listDoc = await db.collection('lists').findOne({ id: list_id });
    const spaceDoc = listDoc?.space_id ? await db.collection('spaces').findOne({ id: listDoc.space_id }) : null;

    // Resolve status
    let statusObj = null;
    if (status_id) {
      statusObj = await db.collection('statuses').findOne({ id: status_id });
      if (!statusObj && listDoc?.statuses) {
        statusObj = listDoc.statuses.find((s: any) => s.id === status_id) || null;
      }
    }
    if (!statusObj && listDoc && listDoc.statuses?.length > 0) {
      statusObj = listDoc.statuses[0];
    }

    // Calculate position
    const lastTask = await db.collection('tasks')
      .find({ list_id })
      .sort({ position: -1 })
      .limit(1)
      .next();

    const position = (lastTask?.position ?? -1) + 1;

    // Resolve assignees
    let assignees: any[] = [];
    if (finalAssigneeIds.length > 0) {
      const assignedUsers = await db.collection('users')
        .find({ id: { $in: finalAssigneeIds } })
        .toArray();

      assignees = assignedUsers.map(u => ({
        assigned_at: new Date().toISOString(),
        assigned_by: creator?.id || null,
        profile: {
          id: u.id,
          full_name: u.full_name || u.fullName,
          email: u.email,
          avatar_url: u.avatar_url || u.avatarUrl || null,
          role: u.role
        }
      }));
    }

    // Resolve tags
    let tags: any[] = [];
    if (tag_ids.length > 0) {
      const matchedTags = await db.collection('tags')
        .find({ id: { $in: tag_ids } })
        .toArray();
      tags = matchedTags.map(t => ({ tag: { id: t.id, name: t.name, color: t.color } }));
    }

    const taskId = randomUUID();
    const now = new Date().toISOString();

    const newTaskDoc = {
      id: taskId,
      name,
      description: description || '',
      list_id,
      status_id: statusObj?.id || status_id || null,
      priority,
      start_date: start_date || null,
      due_date: due_date || null,
      date_closed: null,
      time_estimate: time_estimate || null,
      time_spent: 0,
      position,
      is_archived: false,
      parent_task_id: parent_task_id || null,
      created_by: creator?.id || null,
      created_at: now,
      updated_at: now,
      status: statusObj,
      list: listDoc ? {
        id: listDoc.id,
        name: listDoc.name,
        space: spaceDoc ? { id: spaceDoc.id, name: spaceDoc.name } : null
      } : null,
      assignees,
      tags
    };

    await db.collection('tasks').insertOne(newTaskDoc);

    // Notifications for assignees
    if (finalAssigneeIds.length > 0 && creator?.id) {
      const notifs = finalAssigneeIds.map((uid: string) => ({
        id: randomUUID(),
        user_id: uid,
        type: 'assigned',
        task_id: taskId,
        actor_id: creator.id,
        message: `You were assigned to "${name}"`,
        is_read: false,
        created_at: now
      }));
      await db.collection('notifications').insertMany(notifs).catch(() => {});
    }

    return NextResponse.json(newTaskDoc, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
