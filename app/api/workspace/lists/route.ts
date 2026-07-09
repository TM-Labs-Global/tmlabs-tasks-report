import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// POST /api/workspace/lists — create a new list inside a space/folder
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: creator } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();

    const body = await request.json();
    const { space_id, folder_id, name, color } = body;
    if (!space_id || !name) {
      return NextResponse.json({ error: 'space_id and name are required' }, { status: 400 });
    }

    const { data: lastList } = await supabaseAdmin
      .from('lists').select('position').eq('space_id', space_id)
      .order('position', { ascending: false }).limit(1).maybeSingle();
    const position = (lastList?.position ?? -1) + 1;

    const { data: list, error: listErr } = await supabaseAdmin
      .from('lists')
      .insert({
        space_id, folder_id: folder_id || null, name,
        color: color || null, position, created_by: creator?.id
      })
      .select().single();
    if (listErr) throw listErr;

    // Create default statuses for the new list
    const defaultStatuses = [
      { name: 'To Do', color: '#8A9CC8', type: 'open', position: 0 },
      { name: 'In Progress', color: '#F59E0B', type: 'in_progress', position: 1 },
      { name: 'In Review', color: '#6633FF', type: 'review', position: 2 },
      { name: 'Blocked', color: '#EF4444', type: 'blocked', position: 3 },
      { name: 'Done', color: '#22C55E', type: 'closed', position: 4 },
    ];
    await supabaseAdmin.from('statuses').insert(
      defaultStatuses.map(s => ({ ...s, list_id: list.id }))
    );

    const { data: fullList } = await supabaseAdmin
      .from('lists').select('*, statuses(*)').eq('id', list.id).single();

    return NextResponse.json(fullList, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/workspace/lists?space_id=...
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('space_id');

    let query = supabaseAdmin.from('lists').select('*, statuses(*)').order('position', { ascending: true });
    if (spaceId) query = query.eq('space_id', spaceId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
