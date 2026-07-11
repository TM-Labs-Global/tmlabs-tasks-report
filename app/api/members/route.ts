import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';
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

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, status, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
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

    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
    }
    if (!['staff', 'stakeholder', 'product_manager'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if profile already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles').select('id, status').eq('email', email.toLowerCase()).maybeSingle();

    if (existing) {
      if (existing.status !== 'deactivated') {
        return NextResponse.json({ error: 'A member with this email already exists' }, { status: 409 });
      }
      // Reactivate deactivated member
      await supabaseAdmin.from('profiles').update({ status: 'pending', role }).eq('email', email.toLowerCase());
    } else {
      // Create new pending profile with generated UUID
      const profileId = randomUUID();
      const { error: insertErr } = await supabaseAdmin.from('profiles').insert({
        id: profileId,
        email: email.toLowerCase(),
        full_name: full_name || email.split('@')[0],
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
      }, { count: 'exact' });
      if (insertErr) {
        console.error('Insert profile error:', insertErr);
        throw insertErr;
      }
    }

    // Send invite email via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tmlabs.xyz';
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'TM Labs <no-reply@tmlabs.xyz>',
            to: [email],
            subject: "You've been invited to TM Labs PM Platform",
            html: `
              <div style="background:#0F1B35;color:#F0F4FF;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;border-radius:12px;">
                <img src="${appUrl}/brand/White.png" alt="TM Labs" style="height:40px;margin-bottom:24px;" />
                <h1 style="color:#FF3396;font-size:24px;margin:0 0 16px;">You're invited to TM Labs!</h1>
                <p style="color:#8A9CC8;margin:0 0 24px;">
                  You have been invited to join the TM Labs PM Platform as <strong style="color:#F0F4FF;">${role.replace('_', ' ')}</strong>.
                </p>
                <p style="color:#8A9CC8;margin:0 0 24px;">
                  To get started, simply log in with your email address. No password needed — we'll send you a one-time code.
                </p>
                <a href="${appUrl}/login?invited=true" style="display:inline-block;background:linear-gradient(135deg,#FF3396,#6633FF);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
                  Accept Invitation & Sign In
                </a>
                <p style="color:#4A5A82;font-size:12px;margin-top:32px;">
                  This invitation was sent from TM Labs. If you didn't expect this, you can ignore it.
                </p>
              </div>
            `,
          }),
        });

        if (!emailRes.ok) {
          const emailErr = await emailRes.json();
          console.error('Resend API error:', emailErr);
        } else {
          const emailData = await emailRes.json();
          console.log('Invite email sent successfully:', emailData);
        }
      } catch (emailErr) {
        console.error('Failed to send invite email:', emailErr);
      }
    } else {
      console.warn('Resend API key not configured. Invite email not sent.');
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/members error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
