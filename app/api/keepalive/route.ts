import { NextResponse } from 'next/server';
import { getDb } from '@/shared/utils/mongoClient';

export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection('users').countDocuments();

    return NextResponse.json({
      status: 'ok',
      message: 'MongoDB Atlas cluster keepalive active',
      database: 'tmlabs-tasks',
      usersCount: count,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (err: any) {
    console.error('Keepalive endpoint error:', err);
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Internal keepalive failure',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
