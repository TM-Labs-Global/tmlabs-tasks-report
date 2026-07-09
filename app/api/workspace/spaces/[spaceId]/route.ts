import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

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

    const body = await request.json();
    const { name, color, icon, position } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (position !== undefined) updateData.position = position;

    const { data, error } = await supabaseAdmin
      .from('spaces')
      .update(updateData)
      .eq('id', spaceId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
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

    // Cascade delete of spaces: tasks, lists, folders, spaces
    // Since folders and lists reference space_id, we can find lists/folders first or let the database handle it
    // Wait, DB might not have CASCADE deletes for lists and folders if they are configured manually.
    // Let's manually clean up in foreign key order:
    // 1. Get folders and lists
    const { data: folders } = await supabaseAdmin.from('folders').select('id').eq('space_id', spaceId);
    const { data: lists } = await supabaseAdmin.from('lists').select('id').eq('space_id', spaceId);
    
    const folderIds = (folders || []).map(f => f.id);
    const listIds = (lists || []).map(l => l.id);

    if (listIds.length > 0) {
      // Get task ids
      const { data: tasks } = await supabaseAdmin.from('tasks').select('id').in('list_id', listIds);
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
      await supabaseAdmin.from('statuses').delete().in('list_id', listIds);
      await supabaseAdmin.from('lists').delete().in('id', listIds);
    }

    if (folderIds.length > 0) {
      await supabaseAdmin.from('folders').delete().in('id', folderIds);
    }

    const { error } = await supabaseAdmin.from('spaces').delete().eq('id', spaceId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
