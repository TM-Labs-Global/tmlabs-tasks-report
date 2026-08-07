import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

const TASK_SELECT = `
  *,
  status:statuses(*),
  list:lists(id, name, space:spaces(id, name)),
  assignees:task_assignees(
    assigned_at,
    assigned_by,
    profile:profiles!task_assignees_user_id_fkey(id, full_name, email, avatar_url)
  ),
  tags:task_tag_links(tag:task_tags(id, name, color)),
  subtasks:tasks!parent_task_id(
    id, name, priority, due_date,
    status:statuses(name, type, color),
    assignees:task_assignees(profile:profiles!task_assignees_user_id_fkey(id, full_name, avatar_url))
  ),
  comments(
    id, content, mentions, edited_at, created_at,
    author:profiles(id, full_name, avatar_url)
  ),
  blocking:task_dependencies!task_id(
    id, type,
    depends_on:tasks!depends_on_task_id(id, name, status:statuses(name, type))
  ),
  dependencies:task_dependencies!depends_on_task_id(
    id, type,
    task:tasks!task_id(id, name, status:statuses(name, type))
  )
`;

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

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const headers = {
      'apikey': serviceRole,
      'Authorization': `Bearer ${serviceRole}`,
      'Accept': 'application/vnd.pgrst.object+json'
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/tasks?id=eq.${taskId}&select=${encodeURIComponent(TASK_SELECT.replace(/\s+/g, ''))}`, {
      headers: { ...headers, 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 406 || res.status === 404) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      throw new Error(`Supabase query failed: ${res.status} ${await res.text()}`);
    }

    const rawResult = await res.json();
    // Supabase REST returns an array when no Accept: object header is set
    const task = Array.isArray(rawResult) ? rawResult[0] : rawResult;

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Staff: verify they are an assignee — use both profile ID and email fallback
    if (session.role === 'staff') {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(session.email)}&select=id`,
        { headers, cache: 'no-store' }
      );

      let staffProfileId: string | null = null;
      if (profileRes.ok) {
        const profiles = await profileRes.json();
        staffProfileId = profiles[0]?.id ?? null;
      }

      const isAssigned = task.assignees?.some((a: any) => {
        // Match by profile ID (primary) or by email fallback
        if (staffProfileId && a.profile?.id === staffProfileId) return true;
        if (a.profile?.email && a.profile.email.toLowerCase() === session.email.toLowerCase()) return true;
        return false;
      });

      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden', message: 'You are not assigned to this task.' }, { status: 403 });
      }
    }

    return NextResponse.json(task);
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

    const { data: actor } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();

    const body = await request.json();

    // Staff can only update status_id on their own tasks
    if (session.role === 'staff') {
      const isAssigned = await supabaseAdmin
        .from('task_assignees')
        .select('task_id')
        .eq('task_id', taskId)
        .eq('user_id', actor?.id)
        .maybeSingle();
      if (!isAssigned.data) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const allowedFields = ['status_id'];
      const filteredBody: Record<string, any> = {};
      for (const key of allowedFields) {
        if (key in body) filteredBody[key] = body[key];
      }
      if (Object.keys(filteredBody).length === 0) {
        return NextResponse.json({ error: 'No permitted fields to update' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('tasks').update({ ...filteredBody, updated_at: new Date().toISOString() })
        .eq('id', taskId).select().single();
      if (error) throw error;

      // Write task_history entry
      await supabaseAdmin.from('task_history').insert({
        task_id: taskId, changed_by: actor?.id, field: 'status_id',
        old_value: null, new_value: body.status_id,
      });

      return NextResponse.json(data);
    }

    // PM: full update
    const { assignee_ids, tag_ids, ...taskFields } = body;

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ ...taskFields, updated_at: new Date().toISOString() })
      .eq('id', taskId).select().single();
    if (error) throw error;

    // Update assignees if provided
    if (Array.isArray(assignee_ids)) {
      await supabaseAdmin.from('task_assignees').delete().eq('task_id', taskId);
      if (assignee_ids.length > 0) {
        await supabaseAdmin.from('task_assignees').insert(
          assignee_ids.map((uid: string) => ({
            task_id: taskId, user_id: uid, assigned_by: actor?.id,
          }))
        );
        // Notify new assignees
        await supabaseAdmin.from('notifications').insert(
          assignee_ids.map((uid: string) => ({
            user_id: uid, type: 'assigned', task_id: taskId,
            actor_id: actor?.id, message: `You were assigned to a task`, is_read: false,
          }))
        );
      }
    }

    // Update tags if provided
    if (Array.isArray(tag_ids)) {
      await supabaseAdmin.from('task_tag_links').delete().eq('task_id', taskId);
      if (tag_ids.length > 0) {
        await supabaseAdmin.from('task_tag_links').insert(
          tag_ids.map((tid: string) => ({ task_id: taskId, tag_id: tid }))
        );
      }
    }

    return NextResponse.json(data);
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

    // Cascade: delete subtasks, task_assignees, tags, comments, history, dependencies, notifications
    await supabaseAdmin.from('tasks').delete().eq('parent_task_id', taskId);
    await supabaseAdmin.from('task_assignees').delete().eq('task_id', taskId);
    await supabaseAdmin.from('task_tag_links').delete().eq('task_id', taskId);
    await supabaseAdmin.from('comments').delete().eq('task_id', taskId);
    await supabaseAdmin.from('task_history').delete().eq('task_id', taskId);
    await supabaseAdmin.from('task_dependencies').delete().eq('task_id', taskId);
    await supabaseAdmin.from('task_dependencies').delete().eq('depends_on_task_id', taskId);
    await supabaseAdmin.from('notifications').delete().eq('task_id', taskId);
    await supabaseAdmin.from('tasks').delete().eq('id', taskId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
