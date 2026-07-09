import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// PATCH /api/notifications/[notifId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notifId: string }> }
) {
  try {
    const { notifId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await request.json();
    const { is_read } = body;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: !!is_read })
      .eq('id', notifId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
