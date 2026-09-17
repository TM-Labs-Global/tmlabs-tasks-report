import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// POST /api/tasks/[taskId]/attachments
export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', taskId);
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || '';
    const fileId = randomUUID();
    const fileName = `${fileId}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/tasks/${taskId}/${fileName}`;
    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext.toLowerCase());
    const isImage = file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext.toLowerCase());

    const attachmentObj = {
      id: fileId,
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type || (isVideo ? 'video/mp4' : 'image/png'),
      category: isVideo ? 'video' : isImage ? 'image' : 'document',
      uploaded_by: session.email,
      created_at: new Date().toISOString()
    };

    const db = await getDb();
    await db.collection('tasks').updateOne(
      { id: taskId },
      { 
        $push: { attachments: attachmentObj } as any,
        $set: { updated_at: new Date().toISOString() }
      }
    );

    return NextResponse.json(attachmentObj, { status: 201 });
  } catch (err: any) {
    console.error('Attachment upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId]/attachments
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const body = await request.json() as any;
    const { attachmentId } = body;

    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId is required' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('tasks').updateOne(
      { id: taskId },
      { 
        $pull: { attachments: { id: attachmentId } } as any,
        $set: { updated_at: new Date().toISOString() }
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
