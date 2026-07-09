import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// GET /api/workspace/folders?space_id=...
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('space_id');

    let query = supabaseAdmin.from('folders').select('*, lists(*)').order('position', { ascending: true });
    if (spaceId) query = query.eq('space_id', spaceId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/workspace/folders
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
    const { space_id, name, color } = body;
    if (!space_id || !name) {
      return NextResponse.json({ error: 'space_id and name are required' }, { status: 400 });
    }

    const { data: lastFolder } = await supabaseAdmin
      .from('folders').select('position').eq('space_id', space_id)
      .order('position', { ascending: false }).limit(1).maybeSingle();
    const position = (lastFolder?.position ?? -1) + 1;

    const { data, error } = await supabaseAdmin
      .from('folders')
      .insert({ space_id, name, color: color || null, position, created_by: creator?.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
