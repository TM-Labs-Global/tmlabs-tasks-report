import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

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

    const body = await request.json();
    const { name, color, type, position } = body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (color !== undefined) update.color = color;
    if (type !== undefined) update.type = type;
    if (position !== undefined) update.position = position;

    const { data, error } = await supabaseAdmin
      .from('statuses')
      .update(update)
      .eq('id', statusId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
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

    // Check if any tasks are currently in this status
    const { count, error: countErr } = await supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('status_id', statusId);

    if (countErr) throw countErr;
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete status: Move all tasks out of this status first.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from('statuses').delete().eq('id', statusId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
