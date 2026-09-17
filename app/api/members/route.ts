import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getDb } from '@/shared/utils/mongoClient';
import { randomUUID } from 'crypto';

// GET /api/members
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session = await verifySession(token);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    const members = await db.collection('users')
      .find({})
      .project({ id: 1, email: 1, full_name: 1, avatar_url: 1, role: 1, status: 1, created_at: 1 })
      .sort({ created_at: 1 })
      .toArray();

    return NextResponse.json(members);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/members — invite a new member
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
    const { email, full_name, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }
    if (!['staff', 'stakeholder', 'product_manager'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();

    // Check if user already exists
    const existing = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    if (existing) {
      if (existing.status !== 'deactivated') {
        return NextResponse.json({ error: 'A member with this email already exists' }, { status: 409 });
      }
      // Reactivate deactivated member
      await db.collection('users').updateOne(
        { id: existing.id },
        { $set: { status: 'pending', role, updated_at: new Date().toISOString() } }
      );
    } else {
      // Create new pending profile
      const profileId = randomUUID();
      await db.collection('users').insertOne({
        id: profileId,
        email: normalizedEmail,
        full_name: full_name || normalizedEmail.split('@')[0],
        role,
        status: 'pending',
        timezone: 'UTC',
        notification_preferences: {
          assigned: true,
          due_soon: true,
          mentioned: true,
          dependency_resolved: true,
          comment: true,
          status_changed: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Send invite email via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const proto = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'TM Labs <operations@tmlabs.xyz>',
            to: [normalizedEmail],
            subject: "You've been invited to TM Labs PM Platform",
            html: `
              <div style="background:#0F1B35;color:#F0F4FF;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
                <h1 style="color:#FF3396;font-size:24px;margin:0 0 16px;">You're invited to TM Labs!</h1>
                <p style="color:#8A9CC8;margin:0 0 24px;">
                  You have been invited to join the TM Labs PM Platform as <strong style="color:#F0F4FF;">${role.replace('_', ' ')}</strong>.
                </p>
                <a href="${appUrl}/login?invited=true" style="display:inline-block;background:linear-gradient(135deg,#FF3396,#6633FF);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
                  Accept Invitation & Sign In
                </a>
              </div>
            `,
          }),
        });

        if (!emailRes.ok) {
          const emailErr = await emailRes.json();
          console.error('Resend API error:', emailErr);
        }
      } catch (emailErr) {
        console.error('Failed to send invite email:', emailErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/members error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
