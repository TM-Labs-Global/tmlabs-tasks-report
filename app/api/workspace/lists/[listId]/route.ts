import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

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

    const body = await request.json();
    const { name, color, position, folder_id } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (color !== undefined) update.color = color;
    if (position !== undefined) update.position = position;
    if (folder_id !== undefined) update.folder_id = folder_id;

    const { data, error } = await supabaseAdmin
      .from('lists')
      .update(update)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
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

    // Cascade delete of lists: tasks, statuses, lists
    const { data: tasks } = await supabaseAdmin.from('tasks').select('id').eq('list_id', listId);
    const taskIds = (tasks || []).map(t => t.id);

    if (taskIds.length > 0) {
      await supabaseAdmin.from('task_assignees').delete().in('task_id', taskIds);
      await supabaseAdmin.from('task_tag_links').delete().in('task_id', taskIds);
      await supabaseAdmin.from('task_dependencies').delete().in('task_id', taskIds);
      await supabaseAdmin.from('task_dependencies').delete().in('depends_on_task_id', taskIds);
      await supabaseAdmin.from('comments').delete().in('task_id', taskIds);
      await supabaseAdmin.from('notifications').delete().in('task_id', taskIds);
      await supabaseAdmin.from('task_history').delete().in('task_id', taskIds);
      await supabaseAdmin.from('tasks').delete().in('id', taskIds);
    }
    await supabaseAdmin.from('statuses').delete().eq('list_id', listId);
    
    const { error } = await supabaseAdmin.from('lists').delete().eq('id', listId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
