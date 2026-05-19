import { NextResponse } from 'next/server';
import { getOTP, deleteOTP, addLog } from '@/shared/utils/db';
import { signSession } from '@/shared/utils/session';

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
      expiresAt
    });

    const response = NextResponse.json({ 
      success: true, 
      email: normalizedEmail 
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
