import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// GET /api/workspace/spaces
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();
    const [spaces, folders, lists] = await Promise.all([
      db.collection('spaces').find({}).sort({ position: 1, created_at: 1 }).toArray(),
      db.collection('folders').find({}).sort({ position: 1, created_at: 1 }).toArray(),
      db.collection('lists').find({}).sort({ position: 1, created_at: 1 }).toArray()
    ]);

    const enriched = spaces.map(space => ({
      ...space,
      folders: folders.filter(f => f.space_id === space.id).map(f => ({
        ...f,
        lists: lists.filter(l => l.folder_id === f.id)
      })),
      lists: lists.filter(l => l.space_id === space.id)
    }));

    return NextResponse.json(enriched);
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

    const db = await getDb();
    const creator = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });

    const body = await request.json() as any;
    const { name, color, icon } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const lastSpace = await db.collection('spaces')
      .find({})
      .sort({ position: -1 })
      .limit(1)
      .next();

    const position = (lastSpace?.position ?? -1) + 1;
    const spaceId = randomUUID();

    const newSpace = {
      id: spaceId,
      name,
      color: color || '#6633FF',
      icon: icon || '📁',
      position,
      created_by: creator?.id || null,
      created_at: new Date().toISOString()
    };

    await db.collection('spaces').insertOne(newSpace);
    return NextResponse.json(newSpace, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
