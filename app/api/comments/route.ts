import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// POST /api/comments
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const author = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });
    if (!author) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const body = await request.json() as { task_id: string; content: string; mentions?: string[] };
    const { task_id, content, mentions = [] } = body;
    if (!task_id || !content) {
      return NextResponse.json({ error: 'task_id and content are required' }, { status: 400 });
    }

    const commentId = randomUUID();
    const now = new Date().toISOString();

    const newComment = {
      id: commentId,
      task_id,
      user_id: author.id,
      author_id: author.id,
      content,
      comment_text: content,
      mentions,
      created_at: now,
      date: now,
      author: {
        id: author.id,
        full_name: author.full_name || author.fullName,
        avatar_url: author.avatar_url || author.avatarUrl || null
      },
      user: {
        id: author.id,
        full_name: author.full_name || author.fullName,
        avatar_url: author.avatar_url || author.avatarUrl || null
      }
    };

    await db.collection('comments').insertOne(newComment);

    // Notify mentioned users
    if (mentions.length > 0) {
      const notifs = mentions.map((uid: string) => ({
        id: randomUUID(),
        user_id: uid,
        type: 'mentioned',
        task_id,
        actor_id: author.id,
        message: `You were mentioned in a comment`,
        is_read: false,
        created_at: now
      }));
      await db.collection('notifications').insertMany(notifs).catch(() => {});
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
