import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.email)
      .maybeSingle();

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        status:statuses(*),
        list:lists(id, name, space:spaces(id, name)),
        assignees:task_assignees(
          assigned_at,
          assigned_by,
          profile:profiles(id, full_name, email, avatar_url)
        ),
        tags:task_tag_links(tag:task_tags(id, name, color)),
        subtasks:tasks!parent_task_id(id, name, status:statuses(name, type, color))
      `)
      .eq('is_archived', false)
      .order('position', { ascending: true });

    if (listId) query = query.eq('list_id', listId);
    if (myTasks && profile?.id) {
      const { data: assignedTaskIds } = await supabaseAdmin
        .from('task_assignees')
        .select('task_id')
        .eq('user_id', profile.id);
      const ids = (assignedTaskIds || []).map((r: any) => r.task_id);
      if (ids.length === 0) return NextResponse.json([]);
      query = query.in('id', ids);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
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

    const { data: creator } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', session.email)
      .maybeSingle();

    const body = await request.json();
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

    const { data: lastTask } = await supabaseAdmin
      .from('tasks')
      .select('position')
      .eq('list_id', list_id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const position = (lastTask?.position ?? -1) + 1;

    const { data: task, error: taskErr } = await supabaseAdmin
      .from('tasks')
      .insert({
        list_id, name, description, status_id, priority,
        start_date: start_date || null,
        due_date: due_date || null,
        time_estimate: time_estimate || null,
        parent_task_id: parent_task_id || null,
        created_by: creator?.id,
        position,
      })
      .select()
      .single();

    if (taskErr) throw taskErr;

    if (finalAssigneeIds.length > 0) {
      await supabaseAdmin.from('task_assignees').insert(
        finalAssigneeIds.map((uid: string) => ({
          task_id: task.id,
          user_id: uid,
          assigned_by: creator?.id,
        }))
      );
    }

    if (tag_ids.length > 0) {
      await supabaseAdmin.from('task_tag_links').insert(
        tag_ids.map((tid: string) => ({ task_id: task.id, tag_id: tid }))
      );
    }

    if (finalAssigneeIds.length > 0 && creator?.id) {
      await supabaseAdmin.from('notifications').insert(
        finalAssigneeIds.map((uid: string) => ({
          user_id: uid,
          type: 'assigned',
          task_id: task.id,
          actor_id: creator.id,
          message: `You were assigned to "${name}"`,
          is_read: false,
        }))
      );
    }

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
