import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// PATCH /api/members/[memberId]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent self-deactivation
    const { data: actorProfile } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();
    if (actorProfile?.id === memberId) {
      const body = await request.json();
      if (body.status === 'deactivated') {
        return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
      }
    }

    const body = await request.json();
    const allowedFields = ['role', 'status', 'full_name'];
    const update: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
