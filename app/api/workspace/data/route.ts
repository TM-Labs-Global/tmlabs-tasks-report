import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const headers = {
      'apikey': serviceRole,
      'Authorization': `Bearer ${serviceRole}`
    };

    // Helper to fetch from Supabase Rest API
    const getFromSupabase = async (path: string) => {
      const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        headers,
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`Supabase query failed for ${path}: ${res.status} ${await res.text()}`);
      }
      return res.json();
    };

    // 1. Fetch team members (profiles)
    const profilesData = await getFromSupabase('profiles?status=eq.active');

    // 2. Fetch Spaces, Folders, and Lists to build hierarchy
    const allSpaces = await getFromSupabase('spaces?order=position.asc');
    const allFolders = await getFromSupabase('folders?order=position.asc');
    const allLists = await getFromSupabase('lists?select=*,statuses(*)&order=position.asc');

    const hierarchy = (allSpaces || []).map((space: any) => {
      const spaceFolders = (allFolders || []).filter((f: any) => f.space_id === space.id).map((folder: any) => ({
        ...folder,
        lists: (allLists || []).filter((l: any) => l.folder_id === folder.id)
      }));
      const folderlessLists = (allLists || []).filter((l: any) => l.space_id === space.id && !l.folder_id);
      return {
        ...space,
        folders: spaceFolders,
        folderlessLists
      };
    });

    // 3. Fetch Tasks
    const selectQuery = '*,status:statuses(*),list:lists(id,name),assignees:task_assignees(profile:profiles!task_assignees_user_id_fkey(*)),tags:task_tag_links(tag:task_tags(*))';
    const dbTasks = await getFromSupabase(`tasks?select=${encodeURIComponent(selectQuery)}&order=position.asc`);

    console.log('API WORKSPACE DATA (FETCH) -> profiles:', profilesData?.length, 'spaces:', allSpaces?.length, 'tasks:', dbTasks?.length);

    return NextResponse.json({
      members: profilesData || [],
      spaces: hierarchy,
      tasks: dbTasks || []
    });
  } catch (err: any) {
    console.error('Workspace data API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
