import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// POST /api/workspace/lists — create a new list inside a space/folder
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
    const { space_id, folder_id, name, color } = body;
    if (!space_id || !name) {
      return NextResponse.json({ error: 'space_id and name are required' }, { status: 400 });
    }

    const lastList = await db.collection('lists')
      .find({ space_id })
      .sort({ position: -1 })
      .limit(1)
      .next();

    const position = (lastList?.position ?? -1) + 1;
    const listId = randomUUID();

    // Create default statuses for the new list
    const defaultStatusTemplates = [
      { name: 'To Do', color: '#8A9CC8', type: 'open', position: 0 },
      { name: 'In Progress', color: '#F59E0B', type: 'in_progress', position: 1 },
      { name: 'In Review', color: '#6633FF', type: 'review', position: 2 },
      { name: 'Blocked', color: '#EF4444', type: 'blocked', position: 3 },
      { name: 'Done', color: '#22C55E', type: 'closed', position: 4 },
    ];

    const listStatuses = defaultStatusTemplates.map(s => ({
      ...s,
      id: randomUUID(),
      list_id: listId
    }));

    await db.collection('statuses').insertMany(listStatuses);

    const newList = {
      id: listId,
      space_id,
      folder_id: folder_id || null,
      name,
      color: color || null,
      position,
      created_by: creator?.id || null,
      created_at: new Date().toISOString(),
      statuses: listStatuses
    };

    await db.collection('lists').insertOne(newList);
    return NextResponse.json(newList, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/workspace/lists?space_id=...
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

    const lists = await db.collection('lists')
      .find(query)
      .sort({ position: 1, created_at: 1 })
      .toArray();

    return NextResponse.json(lists);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
