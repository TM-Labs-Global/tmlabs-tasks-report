import { NextResponse } from 'next/server';
import { getOTP, deleteOTP, addLog, getUserByEmail, setUserPassword, saveUser } from '@/shared/utils/db';
import { signSession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await getOTP(normalizedEmail);

    if (!record) {
      return NextResponse.json({ error: 'No verification code requested for this email address.' }, { status: 400 });
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

    // Step A: Pre-verification check (when user enters OTP before setting password)
    if (!password || !password.trim()) {
      return NextResponse.json({ success: true, verified: true });
    }

    // Step B: User is submitting a new password (Password Creation / Reset)
    if (password.trim().length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Save new password locally
    const user = await setUserPassword(normalizedEmail, password.trim());

    // Clean up OTP record
    await deleteOTP(normalizedEmail);

    // Sync with Supabase Auth & profiles if available
    try {
      if (supabaseAdmin) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = users?.find(u => u.email?.toLowerCase() === normalizedEmail);

        if (existingAuthUser) {
          await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, { password: password.trim() });
        } else {
          await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: password.trim(),
            email_confirm: true,
          });
        }

        await supabaseAdmin
          .from('profiles')
          .upsert({
            email: normalizedEmail,
            role: user.role,
            status: 'active',
            full_name: user.fullName || normalizedEmail.split('@')[0],
          }, { onConflict: 'email' });
      }
    } catch (supabaseErr) {
      console.warn('Supabase sync warning (ignorable if offline):', supabaseErr);
    }

    // Create session log entry
    const logId = await addLog(normalizedEmail);

    // Sign session token (strict 24-hour expiration)
    const maxAge = 24 * 60 * 60; // 24 hours
    const expiresAt = Date.now() + maxAge * 1000;
    const token = await signSession({
      email: normalizedEmail,
      logId,
      expiresAt,
      role: user.role
    });

    const response = NextResponse.json({ 
      success: true, 
      email: normalizedEmail,
      role: user.role
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
