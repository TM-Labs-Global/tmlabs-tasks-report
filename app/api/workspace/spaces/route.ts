import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// GET /api/workspace/spaces
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: spaces } = await supabaseAdmin
      .from('spaces')
      .select(`
        *,
        folders(*, lists(*, statuses(*))),
        lists!inner(id, name, folder_id, statuses(*))
      `)
      .order('position', { ascending: true });

    return NextResponse.json(spaces || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/workspace/spaces
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
    const { name, color, icon } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const { data: lastSpace } = await supabaseAdmin
      .from('spaces').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
    const position = (lastSpace?.position ?? -1) + 1;

    const { data, error } = await supabaseAdmin
      .from('spaces')
      .insert({ name, color: color || '#6633FF', icon: icon || '📁', position, created_by: creator?.id })
      .select().single();
    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
