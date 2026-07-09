import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// GET /api/notifications — get current user's notifications
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();
    if (!profile) return NextResponse.json([]);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select(`
        id, type, message, is_read, created_at,
        task:tasks(id, name),
        actor:profiles!actor_id(id, full_name, avatar_url)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications — mark all as read
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();

    const body = await request.json();
    if (body.markAllRead) {
      await supabaseAdmin.from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile?.id)
        .eq('is_read', false);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
