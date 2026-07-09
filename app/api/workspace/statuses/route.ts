import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// GET /api/workspace/statuses?list_id=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('list_id');
    if (!listId) return NextResponse.json({ error: 'list_id is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('statuses')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/workspace/statuses
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { list_id, name, color, type } = body;
    if (!list_id || !name || !type) {
      return NextResponse.json({ error: 'list_id, name, and type are required' }, { status: 400 });
    }

    const { data: lastStatus } = await supabaseAdmin
      .from('statuses').select('position').eq('list_id', list_id)
      .order('position', { ascending: false }).limit(1).maybeSingle();
    const position = (lastStatus?.position ?? -1) + 1;

    const { data, error } = await supabaseAdmin
      .from('statuses')
      .insert({ list_id, name, color: color || '#8A9CC8', type, position })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
