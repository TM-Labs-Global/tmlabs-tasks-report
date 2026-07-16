import { NextResponse } from 'next/server';
import { getOTP, deleteOTP, addLog } from '@/shared/utils/db';
import { signSession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await getOTP(normalizedEmail);

    if (!record) {
      return NextResponse.json({ error: 'No OTP code requested for this email address.' }, { status: 400 });
    }

    // Verify code
    if (record.code !== code.trim()) {
      return NextResponse.json({ error: 'The verification code is incorrect.' }, { status: 400 });
    }

    // Verify expiration
    if (Date.now() > record.expiresAt) {
      await deleteOTP(normalizedEmail);
      return NextResponse.json({ error: 'The verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Resolve user role from Supabase profiles
    let role = 'staff'; // default fallback role
    let isDeactivated = false;
    let profilesCount = 0;
    let userUuid: string | null = null;
    let supabaseSession: any = null;

    const jwtSecret = process.env.JWT_SECRET || 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';
    const supabasePassword = crypto.createHmac('sha256', jwtSecret).update(normalizedEmail).digest('hex');

    // 1. Sign in or Create user in Supabase Auth programmatically
    try {
      let authRes = await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password: supabasePassword,
      });

      if (authRes.error && authRes.error.message.includes('Invalid login credentials')) {
        // Create user
        const createRes = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: supabasePassword,
          email_confirm: true,
        });

        if (createRes.error) {
          console.error('Failed to create user in Supabase Auth:', createRes.error);
          throw createRes.error;
        }

        // Retry Sign-in
        authRes = await supabaseAdmin.auth.signInWithPassword({
          email: normalizedEmail,
          password: supabasePassword,
        });
      }

      if (authRes.error) {
        console.error('Failed to sign in to Supabase Auth:', authRes.error);
        throw authRes.error;
      }

      userUuid = authRes.data.user?.id || null;
      supabaseSession = authRes.data.session || null;
    } catch (err) {
      console.error('Supabase Auth error:', err);
    }

    // 2. Resolve Role from profiles table
    if (userUuid) {
      try {
        // Check profiles count first
        const countRes = await supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        profilesCount = countRes.count || 0;

        // Query profile for this user
        const profileRes = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (profileRes.data) {
          role = profileRes.data.role;
          isDeactivated = profileRes.data.status === 'deactivated';
          
           // If status is pending, make it active since they logged in successfully
          if (profileRes.data.status === 'pending') {
            const createdAt = new Date(profileRes.data.created_at).getTime();
            const fortyEightHoursMs = 48 * 60 * 60 * 1000;
            if (Date.now() - createdAt > fortyEightHoursMs) {
              // Cancel / deactivate the expired invitation
              await supabaseAdmin
                .from('profiles')
                .update({ status: 'deactivated' })
                .eq('email', normalizedEmail);
              return NextResponse.json({ error: 'Access denied. This invitation has expired (48-hour limit) and is now cancelled.' }, { status: 403 });
            }

            await supabaseAdmin
              .from('profiles')
              .update({ status: 'active', id: userUuid })
              .eq('email', normalizedEmail);
          } else if (profileRes.data.id !== userUuid) {
            // Sync userUuid in profiles
            await supabaseAdmin
              .from('profiles')
              .update({ id: userUuid })
              .eq('email', normalizedEmail);
          }
        } else {
          // If profile table is empty, first user is PM
          if (profilesCount === 0) {
            role = 'product_manager';
          } else {
            // Not invited
            return NextResponse.json({ error: 'Access denied. You must be invited to join.' }, { status: 403 });
          }

          // Create active profile for the user
          const { error: insertErr } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: userUuid,
              email: normalizedEmail,
              role,
              status: 'active',
              full_name: normalizedEmail.split('@')[0],
            });

          if (insertErr) {
            console.error('Failed to create user profile:', insertErr);
          }
        }
      } catch (err) {
        console.error('Database profiles query error:', err);
      }
    }

    if (isDeactivated) {
      return NextResponse.json({ error: 'Your account has been deactivated.' }, { status: 403 });
    }

    // Clean up OTP record
    await deleteOTP(normalizedEmail);

    // Create session log entry (log email, loginTime, and set logoutTime = null)
    const logId = await addLog(normalizedEmail);

    // Sign session token (expires in 7 days)
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const expiresAt = Date.now() + maxAge * 1000;
    const token = await signSession({
      email: normalizedEmail,
      logId,
      expiresAt,
      role
    });

    const response = NextResponse.json({ 
      success: true, 
      email: normalizedEmail,
      role,
      supabaseToken: supabaseSession ? {
        access_token: supabaseSession.access_token,
        refresh_token: supabaseSession.refresh_token
      } : null
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Verify OTP API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
