import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

export async function GET() {
  try {
    // Head request count query to ping Supabase database engine
    const { count, error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Keepalive ping database error:', error);
      return NextResponse.json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase project engine keepalive active',
      profilesCount: count,
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
