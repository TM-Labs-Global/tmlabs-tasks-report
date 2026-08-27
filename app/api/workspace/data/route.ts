import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Execute queries in parallel using supabaseAdmin for maximum speed & stability
    const [
      { data: profilesData, error: profilesErr },
      { data: allSpaces, error: spacesErr },
      { data: allFolders, error: foldersErr },
      { data: allLists, error: listsErr },
      { data: dbTasks, error: tasksErr }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('status', 'active'),
      supabaseAdmin.from('spaces').select('*').order('position', { ascending: true }),
      supabaseAdmin.from('folders').select('*').order('position', { ascending: true }),
      supabaseAdmin.from('lists').select('*, statuses(*)').order('position', { ascending: true }),
      supabaseAdmin.from('tasks').select('*, status:statuses(*), list:lists(id, name), assignees:task_assignees(profile:profiles(*)), tags:task_tag_links(tag:task_tags(*))').order('position', { ascending: true })
    ]);

    if (profilesErr) console.error('Profiles query error:', profilesErr);
    if (spacesErr) console.error('Spaces query error:', spacesErr);
    if (foldersErr) console.error('Folders query error:', foldersErr);
    if (listsErr) console.error('Lists query error:', listsErr);
    if (tasksErr) console.error('Tasks query error:', tasksErr);

    const DEFAULT_SPACES = [
      { id: 'space-in-house', name: 'In-House Projects', color: '#FF3396', position: 1 },
      { id: 'space-client-projects', name: 'Client Projects', color: '#00F2FE', position: 2 },
      { id: 'space-growth-marketing', name: 'Growth & Marketing', color: '#7C3AED', position: 3 }
    ];

    let effectiveSpaces = allSpaces && allSpaces.length > 0 ? allSpaces : DEFAULT_SPACES;

    // Ensure the 3 primary spaces always exist in effective spaces if missing
    const existingNames = new Set(effectiveSpaces.map((s: any) => s.name?.toLowerCase()));
    DEFAULT_SPACES.forEach(defSpace => {
      if (!existingNames.has(defSpace.name.toLowerCase())) {
        effectiveSpaces.push(defSpace);
      }
    });

    const hierarchy = effectiveSpaces.map((space: any) => {
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
