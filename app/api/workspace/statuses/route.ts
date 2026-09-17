import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// GET /api/workspace/statuses?list_id=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('list_id');
    if (!listId) return NextResponse.json({ error: 'list_id is required' }, { status: 400 });

    const db = await getDb();
    const statuses = await db.collection('statuses')
      .find({ list_id: listId })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json(statuses);
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

    const body = await request.json() as any;
    const { list_id, name, color, type } = body;
    if (!list_id || !name || !type) {
      return NextResponse.json({ error: 'list_id, name, and type are required' }, { status: 400 });
    }

    const db = await getDb();
    const lastStatus = await db.collection('statuses')
      .find({ list_id })
      .sort({ position: -1 })
      .limit(1)
      .next();

    const position = (lastStatus?.position ?? -1) + 1;
    const statusId = randomUUID();

    const newStatus = {
      id: statusId,
      list_id,
      name,
      color: color || '#8A9CC8',
      type,
      position
    };

    await Promise.all([
      db.collection('statuses').insertOne(newStatus),
      db.collection('lists').updateOne(
        { id: list_id },
        { $push: { statuses: newStatus } as any }
      )
    ]);

    return NextResponse.json(newStatus, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
