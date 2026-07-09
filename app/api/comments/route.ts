import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

// POST /api/comments
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data: author } = await supabaseAdmin
      .from('profiles').select('id').eq('email', session.email).maybeSingle();
    if (!author) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const body = await request.json();
    const { task_id, content, mentions = [] } = body;
    if (!task_id || !content) {
      return NextResponse.json({ error: 'task_id and content are required' }, { status: 400 });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({ task_id, author_id: author.id, content, mentions })
      .select('*, author:profiles(id, full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Notify mentioned users
    if (mentions.length > 0) {
      await supabaseAdmin.from('notifications').insert(
        mentions.map((uid: string) => ({
          user_id: uid, type: 'mentioned', task_id,
          actor_id: author.id,
          message: `You were mentioned in a comment`,
          is_read: false,
        }))
      );
    }

    // Notify other assignees (not the commenter)
    const { data: assignees } = await supabaseAdmin
      .from('task_assignees').select('user_id').eq('task_id', task_id).neq('user_id', author.id);
    if (assignees && assignees.length > 0) {
      await supabaseAdmin.from('notifications').insert(
        assignees.map((a: any) => ({
          user_id: a.user_id, type: 'comment', task_id,
          actor_id: author.id,
          message: `New comment on a task`,
          is_read: false,
        }))
      );
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
