import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

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

    const db = await getDb();
    const query: any = {};
    if (spaceId) query.space_id = spaceId;

    const [folders, lists] = await Promise.all([
      db.collection('folders').find(query).sort({ position: 1 }).toArray(),
      db.collection('lists').find({}).sort({ position: 1 }).toArray()
    ]);

    const enriched = folders.map(f => ({
      ...f,
      lists: lists.filter(l => l.folder_id === f.id)
    }));

    return NextResponse.json(enriched);
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

    const db = await getDb();
    const creator = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${session.email.trim()}$`, 'i') }
    });

    const body = await request.json() as any;
    const { space_id, name, color } = body;
    if (!space_id || !name) {
      return NextResponse.json({ error: 'space_id and name are required' }, { status: 400 });
    }

    const lastFolder = await db.collection('folders')
      .find({ space_id })
      .sort({ position: -1 })
      .limit(1)
      .next();

    const position = (lastFolder?.position ?? -1) + 1;
    const folderId = randomUUID();

    const newFolder = {
      id: folderId,
      space_id,
      name,
      color: color || null,
      position,
      created_by: creator?.id || null,
      created_at: new Date().toISOString()
    };

    await db.collection('folders').insertOne(newFolder);
    return NextResponse.json(newFolder, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
