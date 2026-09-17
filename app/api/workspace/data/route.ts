import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const db = await getDb();

    // Execute queries in parallel using native MongoDB
    const [profilesData, allSpaces, allFolders, allLists, dbTasks] = await Promise.all([
      db.collection('users').find({ status: { $ne: 'deactivated' } }).toArray(),
      db.collection('spaces').find({}).sort({ position: 1, created_at: 1 }).toArray(),
      db.collection('folders').find({}).sort({ position: 1, created_at: 1 }).toArray(),
      db.collection('lists').find({}).sort({ position: 1, created_at: 1 }).toArray(),
      db.collection('tasks').find({ is_archived: { $ne: true } }).sort({ position: 1, created_at: -1 }).toArray()
    ]);

    const hierarchy = allSpaces.map((space: any) => {
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
